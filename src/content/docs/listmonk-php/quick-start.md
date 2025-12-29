---
title: Quick Start
description: Get started with the Listmonk PHP SDK - installation, configuration, and basic usage.
---

This guide covers installing and configuring the Listmonk PHP SDK to interact with your Listmonk instance.

## Installation

Install via Composer:

```bash
composer require dynamik-dev/listmonk-php
```

## Configuration

Create a new Listmonk client instance with your server URL and API credentials:

```php
use DynamikDev\Listmonk\Listmonk;

$listmonk = new Listmonk(
    baseUrl: 'https://listmonk.example.com',
    username: 'admin',
    password: 'your-api-token',
);
```

:::tip[Getting API Credentials]
In Listmonk, go to **Settings > API** to find or generate your API credentials. The username is typically your admin username, and the password is your API token.
:::

## Basic Usage

### Creating a Subscriber

```php
$subscriber = $listmonk->subscribers()->create(
    email: 'jane@example.com',
    name: 'Jane Smith',
    status: 'enabled',
    lists: [1, 2], // List IDs to subscribe to
    attribs: [
        'city' => 'New York',
        'plan' => 'premium',
    ],
);

echo "Created subscriber ID: {$subscriber->id}";
```

### Listing Subscribers

```php
$result = $listmonk->subscribers()->list(
    page: 1,
    perPage: 50,
    query: "subscribers.status = 'enabled'",
);

foreach ($result['data'] as $subscriber) {
    echo "{$subscriber->name} <{$subscriber->email}>\n";
}

echo "Total subscribers: {$result['total']}";
```

### Creating a Mailing List

```php
$list = $listmonk->lists()->create(
    name: 'Newsletter',
    type: 'public',
    optin: 'single', // or 'double' for double opt-in
    tags: ['newsletter', 'marketing'],
    description: 'Our main newsletter list',
);
```

### Creating and Sending a Campaign

```php
// Create the campaign
$campaign = $listmonk->campaigns()->create(
    name: 'Monthly Newsletter',
    subject: 'Your Monthly Update - {{ .Campaign.Name }}',
    lists: [1],
    type: 'regular',
    contentType: 'richtext',
    body: '<h1>Hello {{ .Subscriber.Name }}!</h1><p>Here is your monthly update...</p>',
    altbody: 'Hello {{ .Subscriber.Name }}! Here is your monthly update...',
    tags: ['monthly', 'newsletter'],
);

// Preview before sending
$preview = $listmonk->campaigns()->getPreview($campaign->id);

// Start the campaign
$listmonk->campaigns()->start($campaign->id);
```

### Sending Transactional Emails

For one-off emails like password resets or order confirmations:

```php
$listmonk->transactional()->send(
    subscriberId: 123,
    templateId: 1,
    data: [
        'order_id' => 'ORD-12345',
        'total' => '$99.99',
        'items' => ['Widget A', 'Widget B'],
    ],
);
```

## Public Subscriptions

Allow website visitors to subscribe without API authentication using list UUIDs:

```php
// Get public lists (no auth required for this endpoint)
$lists = $listmonk->public()->getLists();

// Subscribe a user publicly
$listmonk->public()->subscribe(
    email: 'visitor@example.com',
    name: 'Site Visitor',
    listUuids: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
);
```

:::note[List UUIDs vs IDs]
Public subscription uses list UUIDs (found in list settings) rather than numeric IDs. This prevents enumeration of your lists.
:::

## Template Variables

Listmonk supports Go template variables in campaign content:

| Variable | Description |
|----------|-------------|
| `{{ .Subscriber.Name }}` | Subscriber's name |
| `{{ .Subscriber.Email }}` | Subscriber's email |
| `{{ .Subscriber.Attribs.field }}` | Custom attribute value |
| `{{ .Campaign.Name }}` | Campaign name |
| `{{ .Campaign.Subject }}` | Campaign subject |
| `{{ .UnsubscribeURL }}` | Unsubscribe link |
| `{{ .TrackLink "URL" }}` | Tracked link |

## Error Handling

The SDK throws exceptions for API errors:

```php
use Saloon\Exceptions\Request\RequestException;

try {
    $subscriber = $listmonk->subscribers()->get(99999);
} catch (RequestException $e) {
    echo "Error: " . $e->getMessage();
    echo "Status: " . $e->getResponse()->status();
}
```

## Next Steps

- [Subscribers Guide](/listmonk-php/subscribers) - Advanced subscriber management
- [Campaigns Guide](/listmonk-php/campaigns) - Campaign creation and analytics
- [API Reference](/listmonk-php/api-reference) - Complete method documentation
