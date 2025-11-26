---
title: Quick Start Guide
description: Get started with Cloak PHP core package in minutes.
---

This guide will help you get started with the **Cloak PHP core package**.

:::tip[Using Laravel?]
If you're using Laravel, check out the [Laravel Integration](/cloak-php/laravel) guide for the `cloak-laravel` adapter package with additional features like helper functions, facades, and configuration.
:::

## Installation

Install the core package via Composer:

```bash
composer require dynamik-dev/cloak-php
```

### Requirements

- PHP 8.2 or higher
- mbstring extension

## Basic Usage

```php
use DynamikDev\Cloak\Cloak;

// Create instance
$cloak = Cloak::make();

// Mask sensitive data
$text = "Email me at john@example.com or call 555-123-4567";
$masked = $cloak->cloak($text);
// Result: "Email me at {{EMAIL_x7k2m9_1}} or call {{PHONE_a3b5c7_1}}"

// Restore original data
$original = $cloak->uncloak($masked);
// Result: "Email me at john@example.com or call 555-123-4567"
```

## What Gets Detected?

By default, Cloak automatically detects and masks:

- ✅ Email addresses
- ✅ Phone numbers (validated, not just patterns)
- ✅ Social Security Numbers
- ✅ Credit card numbers

## Real-World Example: API Integration

Here's how to use Cloak when sending data to external APIs:

```php
use DynamikDev\Cloak\Cloak;

class ApiService
{
    private Cloak $cloak;

    public function __construct()
    {
        $this->cloak = Cloak::make();
    }

    public function sendToExternalApi(string $userData): string
    {
        // 1. Mask PII before sending to external API
        $maskedData = $this->cloak->cloak($userData);

        // 2. Send sanitized text to API
        $response = $this->httpClient->post('/api/endpoint', [
            'data' => $maskedData
        ]);

        // 3. Get API response (may contain placeholders)
        $maskedResponse = $response->body();

        // 4. Restore original PII
        return $this->cloak->uncloak($maskedResponse);
    }
}
```

### Example Flow

```php
$service = new ApiService();

// User input
$input = "My email is john@example.com and phone is 555-123-4567";

// Send to API
$result = $service->sendToExternalApi($input);
```

**What happens:**

1. Input is masked: `"My email is {{EMAIL_x7k2m9_1}} and phone is {{PHONE_a3b5c7_1}}"`
2. Masked text sent to external API
3. API responds with placeholders preserved
4. Response is unmasked to restore original data

## Custom Storage

By default, Cloak uses in-memory `ArrayStore`. For persistent storage, implement the `StoreInterface`:

```php
use DynamikDev\Cloak\Contracts\StoreInterface;

class RedisStore implements StoreInterface
{
    public function __construct(private Redis $redis) {}

    public function store(string $key, mixed $value): void
    {
        $this->redis->setex($key, 3600, serialize($value));
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

### Using Custom Storage

```php
use DynamikDev\Cloak\Cloak;

$store = new RedisStore($redis);
$cloak = Cloak::using($store);

$masked = $cloak->cloak($text);
```

## Working with Detectors

Cloak includes built-in detectors for emails, phones, SSN, and credit cards. You can also create custom detectors for your specific needs.

### Using Specific Detectors

```php
use DynamikDev\Cloak\Cloak;
use DynamikDev\Cloak\Detectors\Email;
use DynamikDev\Cloak\Detectors\Phone;

$cloak = Cloak::make();

// Only mask emails and phones (skip SSN and credit cards)
$masked = $cloak->cloak($text, [
    new Email(),
    new Phone(),
]);
```

**Learn More:**
- [Detectors Guide](/cloak-php/detectors) - Complete guide to built-in and custom detectors

## Common Use Cases

### 1. Logging Sensitive Data

```php
use DynamikDev\Cloak\Cloak;

$cloak = Cloak::make();

// Log with masked sensitive information
$maskedData = $cloak->cloak(json_encode($userData));
error_log("User data: " . $maskedData);
```

### 2. Third-Party API Integration

```php
// Mask before sending to external service
$cloak = Cloak::make();
$masked = $cloak->cloak($userData);

$httpClient->post('https://api.example.com/data', [
    'payload' => $masked
]);
```

### 3. Data Export/Sanitization

```php
// Create sanitized exports for testing or sharing
$cloak = Cloak::make();
$sanitizedData = $cloak->cloak(json_encode($productionData));

file_put_contents('exports/sanitized_users.json', $sanitizedData);
```

### 4. Multi-Step Processing

```php
// Using persistent storage for multi-step workflows
$store = new RedisStore($redis);
$cloak = Cloak::using($store);

// Step 1: Mask and store
$masked = $cloak->cloak($sensitiveData);
$queue->push(['data' => $masked]);

// Step 2: Later, retrieve and unmask
$job = $queue->pop();
$original = $cloak->uncloak($job['data']);
```

## Best Practices

### ✅ Do

- **Use persistent storage** (Redis, database) for cross-request workflows
- **Implement TTLs** in your custom storage for automatic cleanup
- **Mask before logging** sensitive information
- **Test thoroughly** with your specific data patterns
- **Use selective detection** when you only need specific types

### ❌ Don't

- **Don't store masked data permanently** - placeholders are meant to be temporary
- **Don't share Cloak instances** across different users or sessions
- **Don't rely on in-memory storage** for async or multi-request workflows
- **Don't skip implementing proper storage** for production use cases

## Troubleshooting

### Placeholders Not Being Replaced

**Problem:** `uncloak()` returns placeholders instead of original values

**Solutions:**

1. Verify you're using the same `Cloak` instance for both `cloak()` and `uncloak()`
2. If using custom storage, ensure data hasn't expired
3. Check that your storage implementation is working correctly

### Phone Numbers Not Detected

**Problem:** Valid phone numbers are not being masked

**Solutions:**

1. Ensure phone numbers are in a valid format (uses libphonenumber validation)
2. Try international format with country code (e.g., +1-555-123-4567)
3. Verify the Phone detector is included in your detector array

### Storage Not Persisting

**Problem:** Data is lost between requests

**Solution:** The default `ArrayStore` is in-memory only. Implement a custom store with persistent backend (Redis, database, etc.)

### Performance Issues

**Problem:** Masking is slow with large texts

**Solutions:**

1. Use selective detection with only the detectors you need
2. Consider processing text in chunks
3. Cache detector instances if processing multiple texts

## Next Steps

- [API Reference](/cloak-php/api-reference) - Complete API documentation
- [Laravel Integration](/cloak-php/laravel) - Laravel adapter with helper functions, facades, and config

## Need Help?

- [GitHub Issues](https://github.com/dynamik-dev/cloak-php/issues) - Report bugs or request features
