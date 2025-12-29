---
title: Listmonk PHP
description: A PHP SDK for the Listmonk email marketing platform - manage subscribers, campaigns, and transactional emails programmatically.
---

**Listmonk PHP** is a PHP SDK that provides a clean, fluent interface for interacting with the [Listmonk](https://listmonk.app) email marketing platform. It enables you to manage subscribers, send campaigns, handle transactional emails, and more—all from your PHP application.

- **GitHub**: [dynamik-dev/listmonk-php](https://github.com/dynamik-dev/listmonk-php)

## Features

- **Subscriber Management** - Create, update, delete, and query subscribers with custom attributes
- **Campaign Operations** - Build, schedule, and send email campaigns programmatically
- **Mailing Lists** - Manage lists with different opt-in types and configurations
- **Templates** - Create and manage email templates with variable support
- **Transactional Emails** - Send one-off transactional emails to individual subscribers
- **Public API** - Allow unauthenticated subscriptions from your website
- **Analytics** - Access campaign statistics and analytics data

## Installation

```bash
composer require dynamik-dev/listmonk-php
```

:::note[Requirements]
- PHP 8.4 or higher
- Listmonk v5 or higher
:::

## How It Works

The SDK provides a fluent interface for all Listmonk API endpoints through resource classes:

```php
use DynamikDev\Listmonk\Listmonk;

$listmonk = new Listmonk(
    baseUrl: 'https://listmonk.example.com',
    username: 'api',
    password: 'your-api-token',
);

// Access resources
$listmonk->subscribers();    // Manage subscribers
$listmonk->campaigns();      // Manage campaigns
$listmonk->lists();          // Manage mailing lists
$listmonk->templates();      // Manage templates
$listmonk->transactional();  // Send transactional emails
$listmonk->public();         // Public subscription endpoints
```

## Use Cases

- **Newsletter Systems** - Automate subscriber management and campaign delivery
- **E-commerce** - Send order confirmations, shipping updates, and promotional emails
- **SaaS Applications** - Onboarding sequences, feature announcements, and user notifications
- **Marketing Automation** - Trigger campaigns based on user actions in your application
- **Website Signups** - Enable public subscription forms without exposing API credentials

## Documentation

**Getting Started:**
- [Quick Start](/listmonk-php/quick-start) - Installation and basic usage

**Features:**
- [Subscribers](/listmonk-php/subscribers) - Managing subscribers and lists
- [Campaigns](/listmonk-php/campaigns) - Creating and sending campaigns

**Reference:**
- [API Reference](/listmonk-php/api-reference) - Complete API documentation

## Quick Example

```php
use DynamikDev\Listmonk\Listmonk;

$listmonk = new Listmonk(
    baseUrl: 'https://listmonk.example.com',
    username: 'api',
    password: 'your-api-token',
);

// Create a subscriber
$subscriber = $listmonk->subscribers()->create(
    email: 'john@example.com',
    name: 'John Doe',
    lists: [1, 2], // List IDs
);

// Create and send a campaign
$campaign = $listmonk->campaigns()->create(
    name: 'Welcome Campaign',
    subject: 'Welcome to our newsletter!',
    lists: [1],
    type: 'regular',
    contentType: 'richtext',
    body: '<h1>Hello {{ .Subscriber.Name }}!</h1><p>Welcome aboard.</p>',
    altbody: 'Hello {{ .Subscriber.Name }}! Welcome aboard.',
    tags: ['welcome', 'onboarding'],
);

$listmonk->campaigns()->start($campaign->id);
```

## Contributing

Contributions are welcome! Before submitting a pull request, ensure all checks pass:

```bash
# Code style check (linting)
composer check-style

# Static analysis
composer analyse

# Unit tests
composer test

# Integration tests (requires Docker)
docker compose -f docker-compose.test.yml up -d
composer test:integration

# Or run all tests at once
composer test:all
```

All checks (lint, static analysis, and tests) must pass for your contribution to be accepted.

## License

MIT License
