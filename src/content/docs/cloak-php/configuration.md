---
title: Laravel Configuration
description: Configuration options for the Cloak Laravel adapter package.
---

This page covers the configuration options available in the **Cloak for Laravel** adapter package (`dynamikdev/cloak-laravel`).

:::note
This configuration is Laravel-specific. The core `cloak-php` package doesn't require configuration - see the [Quick Start Guide](/cloak-php/quick-start) for core package usage.
:::

## Publishing Configuration

To publish the configuration file, run:

```bash
php artisan vendor:publish --tag="cloak-config"
```

This creates a `config/cloak.php` file in your Laravel application.

## Configuration File

```php
<?php

return [
    'persist' => env('CLOAK_PERSIST', false),
    'storage_driver' => DynamikDev\Cloak\Laravel\CacheStorage::class,
    'cache_store' => env('CLOAK_CACHE_STORE'),
    'default_ttl' => env('CLOAK_DEFAULT_TTL', 3600),
];
```

## Configuration Options

### persist

**Type:** `bool`
**Default:** `false`
**Environment Variable:** `CLOAK_PERSIST`

Controls the storage mechanism for placeholder-to-value mappings.

#### When `false` (Default)
- Uses temporary in-memory storage (`EncryptedArrayStorage`)
- Data is encrypted using Laravel's `Crypt` facade
- Automatically cleaned up after each request
- Best for single-request workflows

#### When `true`
- Uses persistent cache storage (`CacheStorage`)
- Data persists across requests until TTL expires
- Useful for async operations or multi-step workflows
- Still encrypted for security

**Example:**

```php
// .env
CLOAK_PERSIST=true
```

**Use Cases for Persist Mode:**
- Queue jobs that need to restore masked data
- Multi-step forms spanning multiple requests
- API integrations with webhooks
- Long-running processes

### storage_driver

**Type:** `string` (class name)
**Default:** `DynamikDev\Cloak\Laravel\CacheStorage::class`

Specifies the storage implementation class that handles persisting the placeholder-to-value mappings when `persist` is enabled.

**Built-in Options:**
- `DynamikDev\Cloak\Laravel\CacheStorage` - Uses Laravel's cache system
- `DynamikDev\Cloak\Laravel\EncryptedArrayStorage` - In-memory encrypted storage

**Custom Storage:**

You can create a custom storage driver by implementing the Cloak PHP `StoreInterface`:

```php
use DynamikDev\Cloak\Contracts\StoreInterface;

class CustomStorage implements StoreInterface
{
    public function store(string $key, mixed $value): void
    {
        // Your implementation
    }

    public function retrieve(string $key): mixed
    {
        // Your implementation
    }

    public function has(string $key): bool
    {
        // Your implementation
    }
}
```

Then update your config:

```php
'storage_driver' => App\Services\CustomStorage::class,
```

### cache_store

**Type:** `string|null`
**Default:** `null` (uses default cache driver)
**Environment Variable:** `CLOAK_CACHE_STORE`

Designates which Laravel cache store to use when `CacheStorage` is the storage driver.

**Options:**
- `null` - Uses your application's default cache driver
- `'redis'` - Uses Redis cache
- `'memcached'` - Uses Memcached
- `'file'` - Uses file-based cache
- `'database'` - Uses database cache
- Any cache store defined in `config/cache.php`

**Example:**

```php
// .env
CLOAK_CACHE_STORE=redis
```

**Note:** This option is only used when `persist` is `true`.

### default_ttl

**Type:** `int` (seconds)
**Default:** `3600` (1 hour)
**Environment Variable:** `CLOAK_DEFAULT_TTL`

Sets the expiration time in seconds for cached mappings when using persistent storage.

After the TTL expires:
- Uncloaking will not be possible
- The original values are permanently lost
- Placeholders remain as-is in the text

**Example:**

```php
// .env
CLOAK_DEFAULT_TTL=7200  // 2 hours
```

**Common TTL Values:**
- `300` - 5 minutes
- `900` - 15 minutes
- `1800` - 30 minutes
- `3600` - 1 hour (default)
- `7200` - 2 hours
- `86400` - 24 hours

**Important:** Choose a TTL that accommodates your workflow. If data expires before you uncloak it, the original values cannot be recovered.

## Environment Variables

For convenience, you can configure Cloak using environment variables in your `.env` file:

```bash
# Enable persistent storage
CLOAK_PERSIST=true

# Use Redis for storage
CLOAK_CACHE_STORE=redis

# Set 2-hour TTL
CLOAK_DEFAULT_TTL=7200
```

## Configuration Examples

### Development/Testing Setup

Ephemeral storage that clears after each request:

```php
// config/cloak.php
return [
    'persist' => false,
    'storage_driver' => DynamikDev\Cloak\Laravel\EncryptedArrayStorage::class,
    'cache_store' => null,
    'default_ttl' => 3600,
];
```

### Production Setup with Queue Jobs

Persistent storage using Redis with 1-hour TTL:

```php
// .env
CLOAK_PERSIST=true
CLOAK_CACHE_STORE=redis
CLOAK_DEFAULT_TTL=3600
```

### Multi-Step Form Workflow

Persistent storage with extended TTL:

```php
// .env
CLOAK_PERSIST=true
CLOAK_CACHE_STORE=database
CLOAK_DEFAULT_TTL=86400  # 24 hours
```

### High-Security Environment

Short-lived persistent storage:

```php
// .env
CLOAK_PERSIST=true
CLOAK_CACHE_STORE=redis
CLOAK_DEFAULT_TTL=300  # 5 minutes
```

## Security Considerations

### Encryption

All sensitive data is encrypted before storage using Laravel's `Crypt` facade, which uses AES-256-CBC encryption by default.

Ensure your `APP_KEY` in `.env` is:
- Properly generated (`php artisan key:generate`)
- Kept secure and never committed to version control
- Rotated periodically in production

### TTL Best Practices

- **Use the shortest TTL possible** for your use case
- Consider the trade-off between convenience and security
- For highly sensitive data, use shorter TTLs (5-15 minutes)
- For async jobs, ensure TTL exceeds maximum queue processing time

### Storage Backend Security

When using persistent storage:
- **Redis**: Use authentication (`requirepass`) and TLS encryption
- **Database**: Ensure database credentials are secure
- **File Cache**: Set proper filesystem permissions

### Non-Persistent Mode

For maximum security, use non-persistent mode (`persist: false`):
- Data only exists in memory during the request
- Automatically cleaned up after response is sent
- No risk of stale data in cache
- Ideal for real-time API integrations

## Troubleshooting

### Uncloaking Returns Placeholders

**Cause:** Data has expired or was never stored

**Solutions:**
- Increase `default_ttl`
- Ensure `persist` is `true` for cross-request workflows
- Verify cache store is properly configured

### Cache Connection Errors

**Cause:** Cache store is not available

**Solutions:**
- Verify Redis/Memcached is running
- Check `CACHE_DRIVER` and `CLOAK_CACHE_STORE` settings
- Test cache with `php artisan cache:clear`

### Data Not Persisting Between Requests

**Cause:** Persist mode is disabled

**Solution:**
```bash
# .env
CLOAK_PERSIST=true
```
