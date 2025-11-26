---
title: API Reference
description: Complete API reference for Cloak PHP core library.
---

This page documents the public API of the Cloak PHP library.

## Cloak Class

The main class for masking and unmasking sensitive data.

### Factory Methods

#### `make(?StoreInterface $store = null): self`

Creates a new Cloak instance with an optional storage backend.

```php
use DynamikDev\Cloak\Cloak;

// Create with default ArrayStore
$cloak = Cloak::make();

// Create with custom store
$cloak = Cloak::make(new RedisStore());
```

**Parameters:**
- `$store` (optional) - Storage backend implementing `StoreInterface`. Defaults to `ArrayStore`.

**Returns:** Configured Cloak instance

#### `using(StoreInterface $store): self`

Creates a new Cloak instance with a specified storage backend.

```php
$cloak = Cloak::using(new RedisStore());
```

**Parameters:**
- `$store` (required) - Storage backend implementing `StoreInterface`

**Returns:** Configured Cloak instance

### Core Methods

#### `cloak(string $text, ?array $detectors = null): string`

Identifies sensitive data in text, generates unique placeholders, stores the mapping, and returns text with values replaced by placeholders.

```php
$masked = $cloak->cloak(
    'Email: john@example.com, Phone: 555-123-4567'
);
// Result: "Email: {{EMAIL_x7k2m9_1}}, Phone: {{PHONE_a3b5c7_1}}"
```

**Parameters:**
- `$text` (required) - The text to mask
- `$detectors` (optional) - Array of detector instances to use. If null, uses all default detectors.

**Returns:** Masked text with placeholders

**Placeholder Format:** `{{TYPE_randomId_sequence}}`
- `TYPE` - The detector type (EMAIL, PHONE, SSN, CREDIT_CARD, or custom)
- `randomId` - Unique identifier for this masking session
- `sequence` - Sequential number for each unique value

#### `uncloak(string $text): string`

Reverses the masking process by locating placeholders in text and restoring the original sensitive data.

```php
$original = $cloak->uncloak($masked);
// Result: "Email: john@example.com, Phone: 555-123-4567"
```

**Parameters:**
- `$text` (required) - The text containing placeholders to restore

**Returns:** Original text with sensitive data restored

## Built-in Detectors

Cloak includes four pre-built detectors:

- **Email** - Type: `EMAIL`
- **Phone** - Type: `PHONE` (uses libphonenumber for validation)
- **SSN** - Type: `SSN`
- **Credit Card** - Type: `CREDIT_CARD`

For detailed information about each detector, pattern examples, and creating custom detectors, see the [Detectors Guide](/cloak-php/detectors).

## Interfaces

### DetectorInterface

Defines the contract for detector implementations.

```php
interface DetectorInterface
{
    public function detect(string $text): array;
    public function getType(): string;
}
```

**Methods:**
- `detect(string $text): array` - Returns array of detected sensitive values
- `getType(): string` - Returns the detector type identifier (e.g., "EMAIL", "PHONE")

### StoreInterface

Defines the contract for storage implementations.

```php
interface StoreInterface
{
    public function store(string $key, mixed $value): void;
    public function retrieve(string $key): mixed;
    public function has(string $key): bool;
}
```

**Methods:**
- `store(string $key, mixed $value): void` - Stores a key-value pair
- `retrieve(string $key): mixed` - Retrieves a value by key
- `has(string $key): bool` - Checks if a key exists

## Custom Detectors

See the [Detectors Guide](/cloak-php/detectors) for complete documentation on creating custom detectors with examples.

## Storage Backends

### ArrayStore (Default)

In-memory storage suitable for single-request scenarios.

```php
use DynamikDev\Cloak\Stores\ArrayStore;

$cloak = Cloak::make(new ArrayStore());
```

**Use Cases:**
- Testing
- Single-request workflows
- Non-persistent masking

### Custom Storage

Implement `StoreInterface` for persistent storage:

```php
use DynamikDev\Cloak\Contracts\StoreInterface;

class RedisStore implements StoreInterface
{
    public function __construct(private Redis $redis)
    {
    }

    public function store(string $key, mixed $value): void
    {
        $this->redis->set($key, serialize($value), 3600);
    }

    public function retrieve(string $key): mixed
    {
        $value = $this->redis->get($key);
        return $value ? unserialize($value) : null;
    }

    public function has(string $key): bool
    {
        return $this->redis->exists($key);
    }
}
```

## Placeholder Reuse

When the same sensitive value appears multiple times, Cloak reuses the same placeholder:

```php
$text = "Email john@example.com twice: john@example.com";
$masked = $cloak->cloak($text);
// Result: "Email {{EMAIL_x7k2m9_1}} twice: {{EMAIL_x7k2m9_1}}"
```

This ensures consistency and reduces storage overhead.
