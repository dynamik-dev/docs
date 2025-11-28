---
title: Storage
description: Understanding storage backends and persistence options in Cloak PHP.
---

Cloak stores the mapping between placeholder tokens and original sensitive values using storage backends. Understanding storage options is crucial for choosing the right approach for your use case.

## Storage Basics

When you call `cloak()`, the library:
1. Detects sensitive data in your text
2. Generates unique placeholder tokens
3. **Stores** the mapping (token → original value)
4. Returns text with placeholders

When you call `uncloak()`, the library:
1. Finds placeholder tokens in the text
2. **Retrieves** original values from storage
3. Replaces tokens with original values
4. Returns restored text

## Default Storage: ArrayStore

By default, Cloak uses `ArrayStore` - an in-memory storage implementation.

```php
use DynamikDev\Cloak\Cloak;

$cloak = Cloak::make(); // Uses ArrayStore by default

$masked = $cloak->cloak($text);
$original = $cloak->uncloak($masked);
```

**Characteristics:**
- ✅ Fast - data stored in PHP memory
- ✅ Secure - data cleared when script ends
- ✅ Simple - no configuration needed
- ❌ Ephemeral - data lost between requests
- ❌ Not suitable for queues, webhooks, or multi-step workflows

**Use ArrayStore for:**
- Single-request workflows (same HTTP request)
- Testing and development
- Real-time API integrations where masking and unmasking happen immediately

## Persistent Storage

For workflows spanning multiple requests, you need persistent storage.

### Implementing Custom Storage

Create a class implementing `StoreInterface`:

```php
use DynamikDev\Cloak\Contracts\StoreInterface;

interface StoreInterface
{
    public function store(string $key, mixed $value): void;
    public function retrieve(string $key): mixed;
    public function has(string $key): bool;
}
```

### Example: Redis Storage

```php
use DynamikDev\Cloak\Contracts\StoreInterface;
use Redis;

class RedisStore implements StoreInterface
{
    public function __construct(
        private Redis $redis,
        private int $ttl = 3600
    ) {}

    public function store(string $key, mixed $value): void
    {
        $this->redis->setex(
            $key,
            $this->ttl,
            serialize($value)
        );
    }

    public function retrieve(string $key): mixed
    {
        $value = $this->redis->get($key);
        return $value ? unserialize($value) : null;
    }

    public function has(string $key): bool
    {
        return $this->redis->exists($key) > 0;
    }
}
```

**Using it:**
```php
use DynamikDev\Cloak\Cloak;

$redis = new Redis();
$redis->connect('127.0.0.1', 6379);

$store = new RedisStore($redis, ttl: 3600); // 1 hour TTL
$cloak = Cloak::using($store);

$masked = $cloak->cloak($text);
// Later, in a different request:
$original = $cloak->uncloak($masked);
```

### Example: Database Storage

```php
use DynamikDev\Cloak\Contracts\StoreInterface;
use PDO;

class DatabaseStore implements StoreInterface
{
    public function __construct(
        private PDO $pdo,
        private int $ttl = 3600
    ) {}

    public function store(string $key, mixed $value): void
    {
        $expiresAt = time() + $this->ttl;

        $stmt = $this->pdo->prepare(
            'INSERT INTO cloak_storage (key, value, expires_at)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE value = ?, expires_at = ?'
        );

        $serialized = serialize($value);
        $stmt->execute([
            $key,
            $serialized,
            $expiresAt,
            $serialized,
            $expiresAt
        ]);
    }

    public function retrieve(string $key): mixed
    {
        $stmt = $this->pdo->prepare(
            'SELECT value FROM cloak_storage
             WHERE key = ? AND expires_at > ?'
        );

        $stmt->execute([$key, time()]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ? unserialize($result['value']) : null;
    }

    public function has(string $key): bool
    {
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) FROM cloak_storage
             WHERE key = ? AND expires_at > ?'
        );

        $stmt->execute([$key, time()]);
        return $stmt->fetchColumn() > 0;
    }
}
```

**Database schema:**
```sql
CREATE TABLE cloak_storage (
    `key` VARCHAR(255) PRIMARY KEY,
    `value` TEXT NOT NULL,
    `expires_at` INT UNSIGNED NOT NULL,
    INDEX idx_expires (expires_at)
);
```

### Example: File Storage

```php
use DynamikDev\Cloak\Contracts\StoreInterface;

class FileStore implements StoreInterface
{
    public function __construct(
        private string $directory,
        private int $ttl = 3600
    ) {
        if (!is_dir($directory)) {
            mkdir($directory, 0700, true);
        }
    }

    public function store(string $key, mixed $value): void
    {
        $data = [
            'value' => $value,
            'expires_at' => time() + $this->ttl,
        ];

        $filename = $this->getFilename($key);
        file_put_contents(
            $filename,
            serialize($data),
            LOCK_EX
        );
    }

    public function retrieve(string $key): mixed
    {
        $filename = $this->getFilename($key);

        if (!file_exists($filename)) {
            return null;
        }

        $data = unserialize(file_get_contents($filename));

        if ($data['expires_at'] < time()) {
            unlink($filename);
            return null;
        }

        return $data['value'];
    }

    public function has(string $key): bool
    {
        return $this->retrieve($key) !== null;
    }

    private function getFilename(string $key): string
    {
        return $this->directory . '/' . md5($key) . '.dat';
    }
}
```

## Laravel Storage

If you're using Laravel, the `cloak-laravel` package provides built-in storage options:

**In-Memory (Default):**
```php
// config/cloak.php
return [
    'persist' => false, // Uses EncryptedArrayStorage
];
```

**Cache-Based Persistent Storage:**
```php
// config/cloak.php
return [
    'persist' => true,
    'cache_store' => 'redis', // or null for default
    'default_ttl' => 3600,
];
```

See the [Configuration Guide](/cloak-php/configuration) for complete Laravel storage options.

## Time-To-Live (TTL)

TTL determines how long data persists before expiring.

**Considerations:**
- **Too short**: Data may expire before you can uncloak it
- **Too long**: Sensitive data persists longer than necessary (security risk)
- **Sweet spot**: Long enough for your workflow + buffer

**Common TTL values:**
- `300` (5 minutes) - Short-lived, high-security workflows
- `900` (15 minutes) - Quick background jobs
- `1800` (30 minutes) - Standard processing
- `3600` (1 hour) - Default, covers most use cases
- `7200` (2 hours) - Longer workflows
- `86400` (24 hours) - Multi-step forms, extended processes

**Example:**
```php
// Queue job that typically runs in 2 minutes
// Set TTL to 15 minutes (5-minute buffer + potential delays)
$store = new RedisStore($redis, ttl: 900);
```

## Use Case Recommendations

### Single HTTP Request
**Use:** ArrayStore (default)
```php
$cloak = Cloak::make();
```
**Example:** Mask data before sending to AI API, unmask response immediately

### Queue Jobs
**Use:** Redis or Database with TTL > max queue delay
```php
$store = new RedisStore($redis, ttl: 3600);
$cloak = Cloak::using($store);

// In controller
$masked = $cloak->cloak($userData);
dispatch(new ProcessData($masked));

// In job
$original = $cloak->uncloak($this->maskedData);
```

### Webhook Callbacks
**Use:** Redis or Database with generous TTL
```php
$store = new RedisStore($redis, ttl: 7200);
$cloak = Cloak::using($store);

// Send to external API
$masked = $cloak->cloak($data);
$externalApi->process($masked, callbackUrl: '/webhook');

// Later, in webhook handler
$original = $cloak->uncloak($request->input('data'));
```

### Multi-Step Forms
**Use:** Cache or Database with extended TTL
```php
// Laravel example
// config/cloak.php: 'persist' => true, 'default_ttl' => 86400

// Step 1
session(['form_data' => cloak($request->validated())]);

// Step 2 (hours later)
$originalData = uncloak(session('form_data'));
```

### Data Export/Sharing
**Use:** ArrayStore (if sanitizing permanently)
```php
$cloak = Cloak::make();
$sanitized = $cloak->cloak(json_encode($data));

// Save sanitized version permanently (DON'T uncloak later)
file_put_contents('export.json', $sanitized);
```

## Security Best Practices

### 1. Encryption at Rest

Always encrypt sensitive data in storage:

```php
class EncryptedRedisStore implements StoreInterface
{
    private const CIPHER = 'AES-256-CBC';

    public function __construct(
        private Redis $redis,
        private string $encryptionKey,
        private int $ttl = 3600
    ) {}

    public function store(string $key, mixed $value): void
    {
        $serialized = serialize($value);
        $encrypted = $this->encrypt($serialized);

        $this->redis->setex($key, $this->ttl, $encrypted);
    }

    public function retrieve(string $key): mixed
    {
        $encrypted = $this->redis->get($key);

        if (!$encrypted) {
            return null;
        }

        $decrypted = $this->decrypt($encrypted);
        return unserialize($decrypted);
    }

    private function encrypt(string $data): string
    {
        $iv = random_bytes(openssl_cipher_iv_length(self::CIPHER));
        $encrypted = openssl_encrypt(
            $data,
            self::CIPHER,
            $this->encryptionKey,
            0,
            $iv
        );

        return base64_encode($iv . $encrypted);
    }

    private function decrypt(string $data): string
    {
        $data = base64_decode($data);
        $ivLength = openssl_cipher_iv_length(self::CIPHER);
        $iv = substr($data, 0, $ivLength);
        $encrypted = substr($data, $ivLength);

        return openssl_decrypt(
            $encrypted,
            self::CIPHER,
            $this->encryptionKey,
            0,
            $iv
        );
    }

    public function has(string $key): bool
    {
        return $this->redis->exists($key) > 0;
    }
}
```

### 2. Short TTLs

Use the shortest TTL that accommodates your workflow:
```php
// Good: 5-minute TTL for quick processes
$store = new RedisStore($redis, ttl: 300);

// Less ideal: 24-hour TTL when 1 hour would work
$store = new RedisStore($redis, ttl: 86400);
```

### 3. Cleanup Expired Data

Implement cleanup for storage backends that don't auto-expire:

```php
// Database cleanup job (run hourly)
$pdo->exec('DELETE FROM cloak_storage WHERE expires_at < ' . time());

// File storage cleanup
foreach (glob($directory . '/*.dat') as $file) {
    $data = unserialize(file_get_contents($file));
    if ($data['expires_at'] < time()) {
        unlink($file);
    }
}
```

### 4. Isolate Storage

Use separate storage instances for different contexts:
```php
// Per-user storage keys
$store = new RedisStore($redis);
$key = 'cloak:user:' . $userId . ':' . uniqid();

// Per-tenant storage
$store = new RedisStore($redis);
$key = 'cloak:tenant:' . $tenantId;
```

## Troubleshooting

### Data Not Persisting

**Problem:** Uncloaking returns placeholders instead of original values

**Solutions:**
1. Verify you're using persistent storage (not ArrayStore) for cross-request workflows
2. Check TTL hasn't expired
3. Ensure storage backend (Redis, database) is running and accessible
4. Verify you're using the same storage instance/configuration

### Performance Issues

**Problem:** Storage operations are slow

**Solutions:**
1. Use in-memory storage (Redis, Memcached) instead of database
2. Add indexes to database tables (`key`, `expires_at`)
3. Implement connection pooling
4. Consider caching storage instances

### Storage Exhaustion

**Problem:** Storage fills up with expired data

**Solutions:**
1. Implement TTL with auto-expiration (Redis `SETEX`)
2. Add cleanup jobs for non-expiring backends
3. Use shorter TTLs
4. Monitor storage usage

## Next Steps

- **[Quick Start](/cloak-php/quick-start)** - Basic usage examples
- **[Configuration](/cloak-php/configuration)** - Laravel storage configuration
- **[API Reference](/cloak-php/api-reference)** - StoreInterface documentation
