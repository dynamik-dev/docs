---
title: Cloak PHP
description: A PHP library for masking sensitive information in text strings using placeholder tokens.
---

**Cloak PHP** is a core PHP library that masks sensitive information in text strings using placeholder tokens, then restores the original data from cached storage when needed.

## Packages

- **[dynamik-dev/cloak-php](https://github.com/dynamik-dev/cloak-php)** - Core library for any PHP project
- **[dynamik-dev/cloak-laravel](https://github.com/dynamik-dev/cloak-laravel)** - Laravel adapter with helpers, facades, and config

:::tip[Which package should I use?]

- **Laravel users**: Install `dynamik-dev/cloak-laravel` (it includes the core)
- **Other PHP frameworks/projects**: Install `dynamik-dev/cloak-php`
  :::

## Overview

Cloak helps protect personally identifiable information (PII) by temporarily replacing sensitive data with safe placeholder tokens. This is particularly useful when working with third-party APIs, logging systems, or large language models where you need to process text without exposing sensitive information.

## Key Features

The package provides automatic detection and redaction of:

- **Email addresses**
- **Phone numbers** (with international region support)
- **Social Security Numbers**
- **Credit card numbers**
- **Custom patterns** via regex, word lists, or callable functions

## How It Works

Sensitive data gets replaced with tokens like `{{EMAIL_x7k2m9_1}}`. The original values are stored in a cache, allowing later retrieval through an uncloak operation. The system intelligently reuses the same placeholder when identical values appear multiple times.

### Example

```php
$text = "Contact John at john@example.com or 555-123-4567";
$masked = $cloak->cloak($text);
// Result: "Contact John at {{EMAIL_abc123_1}} or {{PHONE_def456_1}}"

$restored = $cloak->uncloak($masked);
// Result: "Contact John at john@example.com or 555-123-4567"
```

## Getting Started

- [Quick Start Guide](/cloak-php/quick-start) - Get up and running with the core package
- [Laravel Integration](/cloak-php/laravel) - Using the Laravel adapter package
- [API Reference](/cloak-php/api-reference) - Complete API documentation

## License

MIT License
