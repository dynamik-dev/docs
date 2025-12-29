---
title: Campaigns
description: Creating and managing email campaigns with the Listmonk PHP SDK.
---

The Campaigns resource allows you to create, manage, and send email campaigns programmatically. This includes support for scheduling, templates, analytics, and campaign lifecycle management.

## Listing Campaigns

```php
$result = $listmonk->campaigns()->list(
    page: 1,
    perPage: 50,
    query: null,
    orderBy: 'created_at',
    order: 'desc',
    status: 'running',  // Filter by status
);

$campaigns = $result['data'];   // array<Campaign>
$total = $result['total'];
```

### Campaign Statuses

| Status | Description |
|--------|-------------|
| `draft` | Campaign is being created/edited |
| `scheduled` | Scheduled for future sending |
| `running` | Currently being sent |
| `paused` | Temporarily paused |
| `finished` | Completed sending |
| `cancelled` | Cancelled before completion |

## Creating Campaigns

```php
$campaign = $listmonk->campaigns()->create(
    name: 'Weekly Newsletter',
    subject: 'This Week in Tech - {{ .Campaign.Name }}',
    lists: [1, 2],               // Target list IDs
    type: 'regular',             // 'regular' or 'optin'
    contentType: 'richtext',     // 'richtext', 'html', 'markdown', 'plain'
    body: '<h1>Hello {{ .Subscriber.Name }}!</h1><p>Welcome to our newsletter.</p>',
    altbody: 'Hello {{ .Subscriber.Name }}! Welcome to our newsletter.',
    fromEmail: 'newsletter@example.com',
    templateId: 1,               // Optional template ID
    tags: ['newsletter', 'weekly'],
    sendAt: '2024-12-25T10:00:00Z',  // Optional scheduled time
);
```

### Content Types

| Type | Description |
|------|-------------|
| `richtext` | HTML with visual editor support |
| `html` | Raw HTML content |
| `markdown` | Markdown that converts to HTML |
| `plain` | Plain text only |

### Campaign Types

| Type | Description |
|------|-------------|
| `regular` | Standard email campaign |
| `optin` | Opt-in confirmation campaign |

## Using Templates

Create a campaign using a predefined template:

```php
// First, create or get a template
$template = $listmonk->templates()->create(
    name: 'Newsletter Template',
    body: '<!DOCTYPE html>
<html>
<head><title>{{ .Campaign.Subject }}</title></head>
<body>
    <header>
        <h1>{{ .Campaign.Name }}</h1>
    </header>
    <main>
        {{ template "content" . }}
    </main>
    <footer>
        <a href="{{ .UnsubscribeURL }}">Unsubscribe</a>
    </footer>
</body>
</html>',
    type: 'campaign',
);

// Create campaign using the template
$campaign = $listmonk->campaigns()->create(
    name: 'December Newsletter',
    subject: 'December Updates',
    lists: [1],
    type: 'regular',
    contentType: 'richtext',
    body: '<p>Here are the latest updates...</p>',
    altbody: 'Here are the latest updates...',
    templateId: $template->id,
    tags: ['newsletter'],
);
```

## Template Variables

Use Go template syntax in your campaign content:

```html
<h1>Hello {{ .Subscriber.Name }}!</h1>

<p>Email: {{ .Subscriber.Email }}</p>

<!-- Custom attributes -->
<p>Company: {{ .Subscriber.Attribs.company }}</p>

<!-- Campaign info -->
<p>Campaign: {{ .Campaign.Name }}</p>

<!-- Links -->
<a href="{{ .UnsubscribeURL }}">Unsubscribe</a>
<a href="{{ .TrackLink "https://example.com" }}">Visit our site</a>

<!-- Conditional content -->
{{ if .Subscriber.Attribs.premium }}
<p>Thank you for being a premium member!</p>
{{ end }}
```

## Previewing Campaigns

Preview how a campaign will render:

```php
// Get HTML preview
$html = $listmonk->campaigns()->getPreview($campaign->id);

// Get plain text preview
$text = $listmonk->campaigns()->getTextPreview($campaign->id);

// Preview with custom content (without saving)
$preview = $listmonk->campaigns()->createPreview(
    id: $campaign->id,
    body: '<p>Alternative content to preview</p>',
    templateId: 2,
    contentType: 'richtext',
);
```

## Sending Test Emails

Send a test email before launching:

```php
$listmonk->campaigns()->sendTest(
    id: $campaign->id,
    subscribers: ['test@example.com', 'qa@example.com'],
);
```

## Campaign Lifecycle

### Starting a Campaign

```php
$listmonk->campaigns()->start(id: $campaign->id);
```

### Scheduling a Campaign

```php
// Set the send time when creating
$campaign = $listmonk->campaigns()->create(
    // ... other params
    sendAt: '2024-12-25T10:00:00Z',
);

// Or update an existing campaign
$listmonk->campaigns()->update(
    id: $campaign->id,
    sendAt: '2024-12-25T10:00:00Z',
);

// Then schedule it
$listmonk->campaigns()->schedule(id: $campaign->id);
```

### Pausing and Resuming

```php
// Pause a running campaign
$listmonk->campaigns()->pause(id: $campaign->id);

// Resume a paused campaign
$listmonk->campaigns()->start(id: $campaign->id);
```

### Cancelling a Campaign

```php
$listmonk->campaigns()->cancel(id: $campaign->id);
```

### Archiving Campaigns

```php
// Archive
$listmonk->campaigns()->archive(id: $campaign->id, archive: true);

// Unarchive
$listmonk->campaigns()->unarchive(id: $campaign->id);
```

## Updating Campaigns

Update a draft campaign:

```php
$campaign = $listmonk->campaigns()->update(
    id: $campaign->id,
    name: 'Updated Campaign Name',
    subject: 'New Subject Line',
    body: '<p>Updated content</p>',
    tags: ['updated', 'newsletter'],
);
```

:::note[Draft Only]
Campaigns can only be updated while in `draft` status. Running or completed campaigns cannot be modified.
:::

## Analytics

### Get Running Campaign Stats

```php
$stats = $listmonk->campaigns()->getRunningStats();
```

### Get Campaign Analytics

```php
$analytics = $listmonk->campaigns()->getAnalytics(
    type: 'views',          // 'views', 'clicks', 'bounces', 'links'
    campaignId: 123,        // Optional: specific campaign
    from: '2024-01-01',     // Optional: start date
    to: '2024-12-31',       // Optional: end date
);
```

## Content Conversion

Convert campaign content between formats:

```php
$listmonk->campaigns()->convertContent(
    id: $campaign->id,
    from: 'markdown',
    to: 'html',
);
```

## Deleting Campaigns

```php
$listmonk->campaigns()->delete(id: $campaign->id);
```

## Common Patterns

### Automated Newsletter Pipeline

```php
function sendWeeklyNewsletter(Listmonk $listmonk, array $articles): void
{
    // Build content from articles
    $body = '<h1>This Week\'s Articles</h1>';
    foreach ($articles as $article) {
        $body .= sprintf(
            '<article><h2>%s</h2><p>%s</p><a href="%s">Read more</a></article>',
            htmlspecialchars($article['title']),
            htmlspecialchars($article['summary']),
            $article['url']
        );
    }

    // Create campaign
    $campaign = $listmonk->campaigns()->create(
        name: 'Weekly Newsletter - ' . date('Y-m-d'),
        subject: 'Your Weekly Digest',
        lists: [1],
        type: 'regular',
        contentType: 'html',
        body: $body,
        altbody: strip_tags($body),
        templateId: 1,
        tags: ['weekly', 'automated'],
    );

    // Send test first
    $listmonk->campaigns()->sendTest($campaign->id, ['editor@example.com']);

    // Schedule for next morning
    $sendAt = new DateTime('tomorrow 9:00', new DateTimeZone('UTC'));
    $listmonk->campaigns()->update(
        id: $campaign->id,
        sendAt: $sendAt->format('c'),
    );
    $listmonk->campaigns()->schedule($campaign->id);
}
```

### A/B Testing Pattern

```php
function createABTest(Listmonk $listmonk, array $variants): array
{
    $campaigns = [];

    foreach ($variants as $variant => $config) {
        $campaign = $listmonk->campaigns()->create(
            name: "Test Campaign - Variant {$variant}",
            subject: $config['subject'],
            lists: $config['lists'],
            type: 'regular',
            contentType: 'richtext',
            body: $config['body'],
            altbody: strip_tags($config['body']),
            tags: ['ab-test', "variant-{$variant}"],
        );

        $campaigns[$variant] = $campaign;
    }

    return $campaigns;
}
```

## Next Steps

- [Subscribers Guide](/listmonk-php/subscribers) - Manage your subscriber base
- [API Reference](/listmonk-php/api-reference) - Complete method documentation
