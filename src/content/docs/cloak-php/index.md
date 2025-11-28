---
title: Cloak PHP
description: A PHP library for masking sensitive information in text strings using placeholder tokens.
---

**Cloak PHP** is a library that masks sensitive information in text strings using placeholder tokens, then restores the original data when needed. It's particularly useful when working with third-party APIs, logging systems, or large language models where you need to process text without exposing personally identifiable information (PII).

## Packages

Cloak is available as two packages:

- **[cloak-php](https://github.com/dynamik-dev/cloak-php)** - Core library for any PHP project (PHP 8.2+)
- **[cloak-laravel](https://github.com/dynamik-dev/cloak-laravel)** - Laravel adapter with helpers, facades, and configuration

:::tip[Which package should I use?]
- **Laravel users**: Install `dynamik-dev/cloak-laravel` (it includes the core library)
- **Other PHP frameworks/projects**: Install `dynamik-dev/cloak-php`
:::

## How It Works

Cloak replaces sensitive data with unique placeholder tokens and stores the mapping for later retrieval:

```php
// Input
"Contact john@example.com or call 555-123-4567"

// After masking
"Contact {{EMAIL_x7k2m9_1}} or call {{PHONE_a3b5c7_1}}"

// After unmasking
"Contact john@example.com or call 555-123-4567"
```

The system automatically detects and masks:
- Email addresses
- Phone numbers (with international validation)
- Social Security Numbers
- Credit card numbers
- Custom patterns you define

## Use Cases

- **AI/LLM Integration** - Send data to ChatGPT, Claude, or other AI APIs without exposing PII
- **Logging & Monitoring** - Log user data safely without storing sensitive information
- **Third-Party APIs** - Share data with external services while protecting privacy
- **Data Export** - Create sanitized datasets for testing or development
- **Compliance** - Help meet GDPR, HIPAA, or other privacy requirements

## Documentation

**Getting Started:**
- [Quick Start](/cloak-php/quick-start) - Core package installation and basic usage
- [Laravel Integration](/cloak-php/laravel) - Using the Laravel adapter

**Features:**
- [Detectors](/cloak-php/detectors) - Built-in detectors and creating custom ones
- [Storage](/cloak-php/storage) - Storage backends and persistence options
- [Configuration](/cloak-php/configuration) - Laravel configuration options

**Reference:**
- [API Reference](/cloak-php/api-reference) - Complete API documentation

## Quick Example

**Core PHP:**
```php
use DynamikDev\Cloak\Cloak;

$cloak = Cloak::make();
$masked = $cloak->cloak('Email: john@example.com');
$original = $cloak->uncloak($masked);
```

**Laravel:**
```php
$masked = cloak('Email: john@example.com');
$original = uncloak($masked);
```

## License

MIT License
