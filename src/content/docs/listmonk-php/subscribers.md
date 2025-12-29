---
title: Subscribers
description: Managing subscribers with the Listmonk PHP SDK - create, update, query, and organize subscribers.
---

The Subscribers resource provides comprehensive methods for managing your email subscribers, including CRUD operations, list management, and bulk actions.

## Listing Subscribers

Retrieve subscribers with pagination and filtering:

```php
$result = $listmonk->subscribers()->list(
    page: 1,
    perPage: 100,
    query: "subscribers.status = 'enabled'",
    orderBy: 'created_at',
    order: 'desc',
);

// Access the data
$subscribers = $result['data'];  // array<Subscriber>
$total = $result['total'];       // Total count
$perPage = $result['perPage'];   // Items per page
$page = $result['page'];         // Current page
```

### Query Syntax

Listmonk uses SQL-like query syntax for filtering:

```php
// Active subscribers
$listmonk->subscribers()->list(query: "subscribers.status = 'enabled'");

// Subscribers on a specific list
$listmonk->subscribers()->list(query: "subscribers.lists @> '[1]'");

// Subscribers with custom attribute
$listmonk->subscribers()->list(query: "subscribers.attribs->>'plan' = 'premium'");

// Subscribers created after a date
$listmonk->subscribers()->list(query: "subscribers.created_at > '2024-01-01'");

// Combined conditions
$listmonk->subscribers()->list(
    query: "subscribers.status = 'enabled' AND subscribers.attribs->>'country' = 'US'"
);
```

## Creating Subscribers

```php
$subscriber = $listmonk->subscribers()->create(
    email: 'user@example.com',
    name: 'John Doe',
    status: 'enabled',           // 'enabled', 'disabled', or 'blocklisted'
    lists: [1, 2, 3],            // List IDs
    attribs: [                   // Custom attributes
        'company' => 'Acme Inc',
        'role' => 'Developer',
        'signup_source' => 'website',
    ],
    preconfirmSubscriptions: false,
);
```

### Subscriber Statuses

| Status | Description |
|--------|-------------|
| `enabled` | Active subscriber, will receive campaigns |
| `disabled` | Temporarily disabled, won't receive campaigns |
| `blocklisted` | Permanently blocked from receiving emails |

## Retrieving a Subscriber

```php
$subscriber = $listmonk->subscribers()->get(id: 123);

echo $subscriber->id;
echo $subscriber->email;
echo $subscriber->name;
echo $subscriber->status;
```

## Updating Subscribers

Update any subscriber fields:

```php
$subscriber = $listmonk->subscribers()->update(
    id: 123,
    name: 'John Updated',
    status: 'enabled',
    lists: [1, 2],
    attribs: [
        'company' => 'New Company',
        'updated_at' => date('Y-m-d'),
    ],
);
```

:::note[Partial Updates]
Only the fields you provide will be updated. Omitted fields retain their current values.
:::

## Deleting Subscribers

Delete a single subscriber:

```php
$listmonk->subscribers()->delete(id: 123);
```

Delete multiple subscribers:

```php
$listmonk->subscribers()->deleteMany(ids: [123, 456, 789]);
```

Delete by query:

```php
$listmonk->subscribers()->deleteByQuery(
    query: "subscribers.status = 'disabled' AND subscribers.created_at < '2023-01-01'"
);
```

## Managing List Subscriptions

### Add/Remove Subscribers from Lists

```php
// Add subscribers to lists
$listmonk->subscribers()->manageLists(
    ids: [123, 456, 789],
    action: 'add',
    targetListIds: [1, 2],
    status: 'confirmed',  // 'confirmed' or 'unconfirmed'
);

// Remove subscribers from lists
$listmonk->subscribers()->manageLists(
    ids: [123, 456],
    action: 'remove',
    targetListIds: [2],
);

// Unsubscribe from lists
$listmonk->subscribers()->manageLists(
    ids: [123],
    action: 'unsubscribe',
    targetListIds: [1, 2],
);
```

### Manage Subscribers on a Specific List

```php
$listmonk->subscribers()->manageListSubscribers(
    listId: 1,
    ids: [123, 456],
    action: 'add',
    status: 'confirmed',
);
```

### Bulk Operations by Query

```php
$listmonk->subscribers()->manageListsByQuery(
    query: "subscribers.attribs->>'plan' = 'premium'",
    action: 'add',
    targetListIds: [5],  // VIP list
    status: 'confirmed',
);
```

## Blocklisting

Block individual subscribers:

```php
$listmonk->subscribers()->blocklistOne(id: 123);
```

Block multiple subscribers:

```php
$listmonk->subscribers()->blocklist(ids: [123, 456, 789]);
```

Block by query:

```php
$listmonk->subscribers()->blocklistByQuery(
    query: "subscribers.attribs->>'spam_reports' > '3'"
);
```

## Opt-in Management

Send opt-in confirmation email:

```php
$listmonk->subscribers()->sendOptin(id: 123);
```

## Bounces

Get bounces for a subscriber:

```php
$bounces = $listmonk->subscribers()->getBounces(id: 123);
```

Delete bounces for a subscriber:

```php
$listmonk->subscribers()->deleteBounces(id: 123);
```

## Exporting Subscriber Data

Export all data for a subscriber (useful for GDPR compliance):

```php
$data = $listmonk->subscribers()->export(id: 123);
```

## Common Patterns

### Sync Users from Your Application

```php
function syncUser(User $user, Listmonk $listmonk): void
{
    try {
        // Try to find existing subscriber
        $result = $listmonk->subscribers()->list(
            query: "subscribers.email = '{$user->email}'"
        );

        if ($result['total'] > 0) {
            // Update existing
            $listmonk->subscribers()->update(
                id: $result['data'][0]->id,
                name: $user->name,
                attribs: [
                    'user_id' => $user->id,
                    'plan' => $user->plan,
                ],
            );
        } else {
            // Create new
            $listmonk->subscribers()->create(
                email: $user->email,
                name: $user->name,
                lists: [1], // Default list
                attribs: [
                    'user_id' => $user->id,
                    'plan' => $user->plan,
                ],
            );
        }
    } catch (RequestException $e) {
        // Handle error
    }
}
```

### Clean Up Inactive Subscribers

```php
// Disable subscribers who haven't opened in 6 months
$listmonk->subscribers()->manageListsByQuery(
    query: "subscribers.status = 'enabled' AND subscribers.updated_at < NOW() - INTERVAL '6 months'",
    action: 'unsubscribe',
    targetListIds: [1, 2, 3],
);
```

## Next Steps

- [Campaigns Guide](/listmonk-php/campaigns) - Send campaigns to your subscribers
- [API Reference](/listmonk-php/api-reference) - Complete method documentation
