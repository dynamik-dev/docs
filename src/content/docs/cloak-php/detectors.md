---
title: Detectors
description: Understanding and working with detectors in Cloak PHP.
---

Detectors are the core mechanism that Cloak uses to identify sensitive information in text. Each detector is responsible for finding a specific type of data pattern (like emails or phone numbers) and marking it for masking.

## What is a Detector?

A detector is a class that implements the `DetectorInterface` and performs two main functions:

1. **Scans text** to find sensitive data patterns
2. **Returns matches** as an array of detected values

When you call `cloak()`, Cloak runs all enabled detectors against your text, identifies sensitive data, and replaces it with placeholder tokens.

## Built-In Detectors

Cloak includes four pre-built detectors for common sensitive data types:

### Email Detector

Detects email addresses using pattern matching.

```php
use DynamikDev\Cloak\Detectors\Email;

$detector = new Email();
$matches = $detector->detect('Contact john@example.com');
// Returns: ['john@example.com']
```

**Pattern Type:** `EMAIL`
**What it detects:** Standard email address formats

### Phone Detector

Detects phone numbers using Google's libphonenumber library for validation.

```php
use DynamikDev\Cloak\Detectors\Phone;

$detector = new Phone();
$matches = $detector->detect('Call me at 555-123-4567');
// Returns: ['555-123-4567']
```

**Pattern Type:** `PHONE`
**What it detects:** Valid phone numbers in various formats
**Special Feature:** Uses actual phone validation (not just regex), which filters out false positives like order IDs, timestamps, and serial numbers

### SSN Detector

Detects U.S. Social Security Numbers.

```php
use DynamikDev\Cloak\Detectors\SSN;

$detector = new SSN();
$matches = $detector->detect('My SSN is 123-45-6789');
// Returns: ['123-45-6789']
```

**Pattern Type:** `SSN`
**What it detects:** Social Security Numbers in standard format

### Credit Card Detector

Detects credit card numbers.

```php
use DynamikDev\Cloak\Detectors\CreditCard;

$detector = new CreditCard();
$matches = $detector->detect('Card: 4532-1488-0343-6467');
// Returns: ['4532-1488-0343-6467']
```

**Pattern Type:** `CREDIT_CARD`
**What it detects:** Credit card numbers with or without separators

## Using Specific Detectors

By default, Cloak uses all built-in detectors. You can choose which ones to use:

```php
use DynamikDev\Cloak\Cloak;
use DynamikDev\Cloak\Detectors\Email;
use DynamikDev\Cloak\Detectors\Phone;

$cloak = Cloak::make();

// Only detect emails and phones
$masked = $cloak->cloak($text, [
    new Email(),
    new Phone(),
]);
```

This is useful when:
- You only need to mask certain types of data
- You want to improve performance by limiting detection scope
- You're working with data that doesn't contain certain types

## Creating Custom Detectors

You can create your own detectors for domain-specific sensitive data.

### The DetectorInterface

All detectors must implement this interface:

```php
interface DetectorInterface
{
    public function detect(string $text): array;
    public function getType(): string;
}
```

**Methods:**
- `detect(string $text): array` - Returns array of detected sensitive values
- `getType(): string` - Returns the detector type identifier (used in placeholders)

### Example: IP Address Detector

Here's a complete custom detector example:

```php
use DynamikDev\Cloak\Contracts\DetectorInterface;

class IpAddressDetector implements DetectorInterface
{
    public function detect(string $text): array
    {
        // Use regex to find IP addresses
        preg_match_all(
            '/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/',
            $text,
            $matches
        );

        return $matches[0] ?? [];
    }

    public function getType(): string
    {
        return 'IP_ADDRESS';
    }
}
```

**Usage:**

```php
use DynamikDev\Cloak\Cloak;

$cloak = Cloak::make();

$text = "Server IP: 192.168.1.1 and backup: 10.0.0.5";
$masked = $cloak->cloak($text, [new IpAddressDetector()]);
// Result: "Server IP: {{IP_ADDRESS_x7k2m9_1}} and backup: {{IP_ADDRESS_x7k2m9_2}}"
```

### Example: API Key Detector

Detect API keys with a specific format:

```php
use DynamikDev\Cloak\Contracts\DetectorInterface;

class ApiKeyDetector implements DetectorInterface
{
    public function detect(string $text): array
    {
        // Match pattern like: sk_live_abc123...
        preg_match_all(
            '/\bsk_(live|test)_[a-zA-Z0-9]{32,}\b/',
            $text,
            $matches
        );

        return $matches[0] ?? [];
    }

    public function getType(): string
    {
        return 'API_KEY';
    }
}
```

### Example: Employee ID Detector

Detect company-specific employee IDs:

```php
use DynamikDev\Cloak\Contracts\DetectorInterface;

class EmployeeIdDetector implements DetectorInterface
{
    public function detect(string $text): array
    {
        // Match pattern like: EMP123456
        preg_match_all(
            '/\bEMP\d{6}\b/',
            $text,
            $matches
        );

        return $matches[0] ?? [];
    }

    public function getType(): string
    {
        return 'EMPLOYEE_ID';
    }
}
```

## Combining Detectors

You can mix built-in and custom detectors:

```php
use DynamikDev\Cloak\Cloak;
use DynamikDev\Cloak\Detectors\Email;
use DynamikDev\Cloak\Detectors\Phone;

$cloak = Cloak::make();

$masked = $cloak->cloak($text, [
    new Email(),           // Built-in
    new Phone(),           // Built-in
    new IpAddressDetector(), // Custom
    new ApiKeyDetector(),    // Custom
]);
```

## Best Practices

### Pattern Design

✅ **Be Specific** - Narrow patterns reduce false positives
```php
// Good: Specific format
'/\bEMP\d{6}\b/'

// Less ideal: Too broad
'/EMP\d+/'
```

✅ **Use Word Boundaries** - Prevent partial matches
```php
// Good: Uses \b for word boundaries
'/\b\d{3}-\d{2}-\d{4}\b/'

// Less ideal: Might match within larger numbers
'/\d{3}-\d{2}-\d{4}/'
```

✅ **Test Thoroughly** - Verify against real data samples

### Performance

✅ **Limit Detectors** - Only use what you need
```php
// Only detect what's necessary for your use case
$masked = $cloak->cloak($text, [
    new Email(),
    new ApiKeyDetector(), // Custom detector specific to your needs
]);
```

✅ **Optimize Regex** - Use efficient patterns
- Avoid catastrophic backtracking
- Use atomic groups when appropriate
- Test regex performance with large texts

### Type Naming

✅ **Use Clear Names** - Make placeholder types obvious
```php
// Good: Clear and descriptive
public function getType(): string
{
    return 'EMPLOYEE_ID';
}

// Less ideal: Unclear abbreviation
public function getType(): string
{
    return 'EID';
}
```

## Detector Lifecycle

Understanding how detectors work in the masking process:

1. **Text Input** - Original text is provided to `cloak()`
2. **Detection Phase** - Each detector scans the text
3. **Collection** - All detected values are collected
4. **Deduplication** - Identical values get the same placeholder
5. **Replacement** - Values are replaced with tokens like `{{EMAIL_x7k2m9_1}}`
6. **Storage** - Original values are stored for later retrieval

## Laravel-Specific Detector Features

If you're using the Laravel adapter, you can dynamically add detectors using the facade:

```php
use Cloak\Facades\Cloak;

// This functionality would be added in future versions
// Check the Laravel adapter documentation for updates
```

## Troubleshooting

### Detector Not Finding Matches

**Problem:** Your custom detector isn't finding expected values

**Solutions:**
1. Test your regex pattern separately
2. Check for word boundaries or whitespace issues
3. Verify the text encoding (UTF-8 expected)
4. Add debug logging to see what the detector receives

```php
public function detect(string $text): array
{
    error_log("Detecting in text: " . $text);

    preg_match_all($this->pattern, $text, $matches);

    error_log("Found matches: " . json_encode($matches[0] ?? []));

    return $matches[0] ?? [];
}
```

### Too Many False Positives

**Problem:** Detector matches things it shouldn't

**Solutions:**
1. Make your pattern more specific
2. Add validation logic after pattern matching
3. Use word boundaries (`\b`) in regex
4. Consider context (what comes before/after)

```php
public function detect(string $text): array
{
    preg_match_all($this->pattern, $text, $matches);

    // Filter results
    return array_filter($matches[0] ?? [], function($match) {
        return $this->isValid($match);
    });
}

private function isValid(string $value): bool
{
    // Add custom validation logic
    return strlen($value) >= 10;
}
```

## Next Steps

- [Quick Start Guide](/cloak-php/quick-start) - See detectors in action
- [API Reference](/cloak-php/api-reference) - Complete detector API documentation
- [Laravel Integration](/cloak-php/laravel) - Using detectors in Laravel
