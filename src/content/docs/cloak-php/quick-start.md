---
title: Quick Start Guide
description: Get started with Cloak PHP core package in minutes.
---

This guide covers the **Cloak PHP core package** for use in any PHP project.

:::tip[Using Laravel?]
If you're using Laravel, see the [Laravel Integration](/cloak-php/laravel) guide for the `cloak-laravel` adapter with helper functions, facades, and configuration.
:::

## Installation

Install via Composer:

```bash
composer require dynamik-dev/cloak-php
```

**Requirements:**
- PHP 8.2 or higher
- mbstring extension (required by libphonenumber)

## Basic Usage

```php
use DynamikDev\Cloak\Cloak;

// Create instance
$cloak = Cloak::make();

// Mask sensitive data
$text = "Email me at john@example.com or call 555-123-4567";
$masked = $cloak->cloak($text);
// "Email me at {{EMAIL_x7k2m9_1}} or call {{PHONE_a3b5c7_1}}"

// Restore original data
$original = $cloak->uncloak($masked);
// "Email me at john@example.com or call 555-123-4567"
```

## What Gets Detected?

By default, Cloak automatically detects and masks:

- **Email addresses** - `{{EMAIL_...}}`
- **Phone numbers** - `{{PHONE_...}}` (validated using libphonenumber)
- **Social Security Numbers** - `{{SSN_...}}`
- **Credit card numbers** - `{{CREDIT_CARD_...}}`

Learn more about detectors and creating custom ones in the [Detectors Guide](/cloak-php/detectors).

## Example: API Integration

Protect PII when sending data to external APIs:

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
        // 1. Mask PII before sending
        $maskedData = $this->cloak->cloak($userData);

        // 2. Send sanitized text to API
        $response = $this->httpClient->post('/api/endpoint', [
            'data' => $maskedData
        ]);

        // 3. Restore original data from response
        return $this->cloak->uncloak($response->body());
    }
}
```

**Flow:**
```php
$input = "My email is john@example.com and phone is 555-123-4567";
$result = $service->sendToExternalApi($input);

// Masked: "My email is {{EMAIL_x7k2m9_1}} and phone is {{PHONE_a3b5c7_1}}"
// Sent to API → Response returned → Original data restored
```

## Using Specific Detectors

Use only the detectors you need for better performance:

```php
use DynamikDev\Cloak\Cloak;
use DynamikDev\Cloak\Detectors\Email;
use DynamikDev\Cloak\Detectors\Phone;

$cloak = Cloak::make();

// Only mask emails and phones
$masked = $cloak->cloak($text, [
    new Email(),
    new Phone(),
]);
```

Learn more in the [Detectors Guide](/cloak-php/detectors).

## Common Use Cases

**Logging:**
```php
$cloak = Cloak::make();
$maskedData = $cloak->cloak(json_encode($userData));
error_log("User data: " . $maskedData);
```

**Data Export:**
```php
$cloak = Cloak::make();
$sanitizedData = $cloak->cloak(json_encode($productionData));
file_put_contents('exports/sanitized.json', $sanitizedData);
```

## Storage & Persistence

By default, Cloak uses in-memory storage that clears after each request. For workflows that span multiple requests (queues, multi-step forms, etc.), you'll need persistent storage.

See the [Storage Guide](/cloak-php/storage) for:
- Custom storage implementations (Redis, database, etc.)
- Persistence strategies
- TTL configuration
- Best practices

## Next Steps

- **[Detectors](/cloak-php/detectors)** - Learn about built-in detectors and create custom ones
- **[Storage](/cloak-php/storage)** - Implement persistent storage backends
- **[Laravel Integration](/cloak-php/laravel)** - Use the Laravel adapter
- **[API Reference](/cloak-php/api-reference)** - Complete API documentation

## Need Help?

[GitHub Issues](https://github.com/dynamik-dev/cloak-php/issues) - Report bugs or request features
