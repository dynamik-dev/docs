---
title: Laravel Integration
description: Laravel adapter package with helper functions, facades, and persistent storage configuration.
---

**Cloak for Laravel** (`dynamik-dev/cloak-laravel`) is a Laravel adapter that adds framework-specific features to the core [Cloak PHP](/cloak-php) library.

:::tip[Looking for Core Features?]
This page covers **Laravel-specific features only**. For detectors, storage backends, and core concepts, see:
- [Quick Start](/cloak-php/quick-start) - Core usage
- [Detectors](/cloak-php/detectors) - Built-in and custom detectors
- [Storage](/cloak-php/storage) - Storage backends and persistence
:::

## Laravel Features

The adapter adds:

- **Helper Functions** - Global `cloak()` and `uncloak()` helpers
- **Facade** - `Cloak` facade for static access
- **Service Provider** - Auto-registration and configuration
- **Encrypted Storage** - Built-in encrypted cache storage
- **Configuration** - Environment-based config file
- **Dependency Injection** - Container binding

## Installation

Install via Composer:

```bash
composer require dynamik-dev/cloak-laravel
```

Optionally publish the configuration file for customization:

```bash
php artisan vendor:publish --tag="cloak-config"
```

See [Configuration](/cloak-php/configuration) for all options (storage modes, TTL, cache drivers, etc.).

## Usage Methods

### 1. Helper Functions (Recommended)

The simplest and most convenient way to use Cloak in Laravel:

```php
// Mask sensitive data
$masked = cloak('Email me at john@example.com');
// Result: "Email me at {{EMAIL_x7k2m9_1}}"

// Restore original data
$original = uncloak($masked);
// Result: "Email me at john@example.com"
```

### 2. Facade

For static access in classes:

```php
use Cloak\Facades\Cloak;

$masked = Cloak::cloak($text);
$original = Cloak::uncloak($masked);
```

### 3. Dependency Injection

For testability and IoC container integration:

```php
use DynamikDev\Cloak\Cloak;

class ChatController extends Controller
{
    public function __construct(private Cloak $cloak)
    {
    }

    public function sendMessage(Request $request)
    {
        $masked = $this->cloak->cloak($request->input('message'));
        // Send to API...
    }
}
```


## Real-World Example: OpenAI Integration

Here's how to use Cloak with OpenAI's API:

```php
use OpenAI\Client;
use Cloak\Facades\Cloak;

class AiChatService
{
    public function __construct(private Client $openai)
    {
    }

    public function chat(string $userMessage): string
    {
        // Mask PII before sending to OpenAI
        $maskedMessage = Cloak::cloak($userMessage);

        // Send sanitized text to the model
        $response = $this->openai->chat()->create([
            'model' => 'gpt-4',
            'messages' => [
                ['role' => 'user', 'content' => $maskedMessage],
            ],
        ]);

        $maskedResponse = $response->choices[0]->message->content;

        // Restore original PII for the user
        return Cloak::uncloak($maskedResponse);
    }
}
```

### Example Flow

```php
// User input
$input = "My email is john@example.com and my phone is 555-123-4567";

// Step 1: Mask before API call
$masked = Cloak::cloak($input);
// "My email is {{EMAIL_x7k2m9_1}} and my phone is {{PHONE_a3b5c7_1}}"

// Step 2: Send to OpenAI (tokens are preserved in response)
$aiResponse = "Sure! I'll email you at {{EMAIL_x7k2m9_1}}";

// Step 3: Restore original data
$final = Cloak::uncloak($aiResponse);
// "Sure! I'll email you at john@example.com"
```

## Laravel Use Cases

### Queue Jobs

Mask sensitive data before dispatching jobs:

```php
// Dispatch with masked data
dispatch(new ProcessUserData(cloak($userData)));
```

```php
// In the job
public function handle()
{
    $original = uncloak($this->maskedData);
    // Process...
}
```

:::tip
Enable `persist: true` in config for cross-request workflows. See [Configuration](/cloak-php/configuration).
:::

### Logging Middleware

```php
class LogRequestsWithMaskedData
{
    public function handle(Request $request, Closure $next)
    {
        Log::info('Request', [
            'url' => $request->url(),
            'payload' => cloak(json_encode($request->all())),
        ]);

        return $next($request);
    }
}
```

### Multi-Step Forms

```php
// Step 1: Store in session
session(['data' => cloak($request->validated())]);

// Step 2: Retrieve later
$original = uncloak(session('data'));
```

## Next Steps

- **[Configuration](/cloak-php/configuration)** - Configure storage, TTL, and cache drivers
- **[Detectors](/cloak-php/detectors)** - Use built-in detectors or create custom ones
- **[Storage](/cloak-php/storage)** - Understand persistence and storage backends
- **[API Reference](/cloak-php/api-reference)** - Complete API documentation

## Resources

- [GitHub: cloak-laravel](https://github.com/dynamik-dev/cloak-laravel)
- [GitHub: cloak-php](https://github.com/dynamik-dev/cloak-php)
