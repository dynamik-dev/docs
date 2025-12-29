---
title: API Reference
description: Complete API reference for the Listmonk PHP SDK.
---

This reference documents all available methods in the Listmonk PHP SDK.

## Listmonk Client

### Constructor

```php
use DynamikDev\Listmonk\Listmonk;

$listmonk = new Listmonk(
    baseUrl: string,   // Your Listmonk instance URL
    username: string,  // API username
    password: string,  // API password/token
);
```

### Resource Accessors

| Method | Returns | Description |
|--------|---------|-------------|
| `subscribers()` | `SubscribersResource` | Subscriber management |
| `lists()` | `ListsResource` | Mailing list management |
| `campaigns()` | `CampaignsResource` | Campaign management |
| `templates()` | `TemplatesResource` | Email template management |
| `transactional()` | `TransactionalResource` | Transactional emails |
| `public()` | `PublicResource` | Public subscription endpoints |
| `media()` | `MediaResource` | Media/file management |
| `bounces()` | `BouncesResource` | Bounce management |
| `health()` | `HealthResource` | Health checks |
| `settings()` | `SettingsResource` | Settings management |
| `admin()` | `AdminResource` | Admin operations |
| `logs()` | `LogsResource` | Log access |
| `import()` | `ImportResource` | Import operations |
| `maintenance()` | `MaintenanceResource` | Maintenance tasks |

---

## SubscribersResource

### list()

```php
list(
    ?int $page = null,
    ?int $perPage = null,
    ?string $query = null,
    ?string $orderBy = null,
    ?string $order = null,
): array{data: array<Subscriber>, total: int, perPage: int, page: int}
```

### get()

```php
get(int $id): Subscriber
```

### create()

```php
create(
    string $email,
    string $name,
    string $status = 'enabled',
    array $lists = [],
    array $attribs = [],
    bool $preconfirmSubscriptions = false,
): Subscriber
```

### update()

```php
update(
    int $id,
    ?string $email = null,
    ?string $name = null,
    ?string $status = null,
    ?array $lists = null,
    ?array $attribs = null,
    ?bool $preconfirmSubscriptions = null,
): Subscriber
```

### delete()

```php
delete(int $id): Response
```

### deleteMany()

```php
deleteMany(array $ids): Response
```

### deleteByQuery()

```php
deleteByQuery(string $query): Response
```

### manageLists()

```php
manageLists(
    array $ids,
    string $action,        // 'add', 'remove', 'unsubscribe'
    array $targetListIds,
    ?string $status = null,
): Response
```

### manageListSubscribers()

```php
manageListSubscribers(
    int $listId,
    array $ids,
    string $action,
    ?string $status = null,
): Response
```

### manageListsByQuery()

```php
manageListsByQuery(
    string $query,
    string $action,
    array $targetListIds,
    ?string $status = null,
): Response
```

### blocklist()

```php
blocklist(array $ids): Response
```

### blocklistOne()

```php
blocklistOne(int $id): Response
```

### blocklistByQuery()

```php
blocklistByQuery(string $query): Response
```

### export()

```php
export(int $id): array<string, mixed>
```

### getBounces()

```php
getBounces(int $id): array<string, mixed>
```

### deleteBounces()

```php
deleteBounces(int $id): Response
```

### sendOptin()

```php
sendOptin(int $id): Response
```

---

## ListsResource

### list()

```php
list(
    ?int $page = null,
    ?int $perPage = null,
    ?string $query = null,
    ?string $orderBy = null,
    ?string $order = null,
): array{data: array<MailingList>, total: int, perPage: int, page: int}
```

### get()

```php
get(int $id): MailingList
```

### create()

```php
create(
    string $name,
    string $type = 'public',    // 'public' or 'private'
    string $optin = 'single',   // 'single' or 'double'
    array $tags = [],
    string $description = '',
): MailingList
```

### update()

```php
update(
    int $id,
    ?string $name = null,
    ?string $type = null,
    ?string $optin = null,
    ?array $tags = null,
    ?string $description = null,
): MailingList
```

### delete()

```php
delete(int $id): Response
```

---

## CampaignsResource

### list()

```php
list(
    ?int $page = null,
    ?int $perPage = null,
    ?string $query = null,
    ?string $orderBy = null,
    ?string $order = null,
    ?string $status = null,
): array{data: array<Campaign>, total: int, perPage: int, page: int}
```

### get()

```php
get(int $id): Campaign
```

### create()

```php
create(
    string $name,
    string $subject,
    array $lists,
    string $type,           // 'regular' or 'optin'
    string $contentType,    // 'richtext', 'html', 'markdown', 'plain'
    string $body,
    string $altbody,
    ?string $fromEmail = null,
    ?int $templateId = null,
    array $tags = [],
    ?string $sendAt = null,
): Campaign
```

### update()

```php
update(
    int $id,
    ?string $name = null,
    ?string $subject = null,
    ?array $lists = null,
    ?string $type = null,
    ?string $contentType = null,
    ?string $body = null,
    ?string $altbody = null,
    ?string $fromEmail = null,
    ?int $templateId = null,
    ?array $tags = null,
    ?string $sendAt = null,
): Campaign
```

### delete()

```php
delete(int $id): Response
```

### getPreview()

```php
getPreview(int $id): string
```

### createPreview()

```php
createPreview(
    int $id,
    ?string $body = null,
    ?int $templateId = null,
    ?string $contentType = null,
): string
```

### getTextPreview()

```php
getTextPreview(int $id): string
```

### updateStatus()

```php
updateStatus(int $id, string $status): Campaign
```

### start()

```php
start(int $id): Campaign
```

### pause()

```php
pause(int $id): Campaign
```

### cancel()

```php
cancel(int $id): Campaign
```

### schedule()

```php
schedule(int $id): Campaign
```

### archive()

```php
archive(int $id, bool $archive): Response
```

### unarchive()

```php
unarchive(int $id): Response
```

### convertContent()

```php
convertContent(int $id, string $from, string $to): Response
```

### sendTest()

```php
sendTest(int $id, array $subscribers): Response
```

### getRunningStats()

```php
getRunningStats(): array<string, mixed>
```

### getAnalytics()

```php
getAnalytics(
    string $type,
    ?int $campaignId = null,
    ?string $from = null,
    ?string $to = null,
): array<string, mixed>
```

---

## TemplatesResource

### list()

```php
list(): array<Template>
```

### get()

```php
get(int $id): Template
```

### create()

```php
create(
    string $name,
    string $body,
    string $type = 'campaign',
): Template
```

### update()

```php
update(
    int $id,
    ?string $name = null,
    ?string $body = null,
    ?string $type = null,
): Template
```

### delete()

```php
delete(int $id): Response
```

### preview()

```php
preview(int $templateId, ?string $body = null): string
```

### getPreview()

```php
getPreview(int $id): string
```

### setDefault()

```php
setDefault(int $id): Template
```

---

## TransactionalResource

### send()

```php
send(
    int $subscriberId,
    int $templateId,
    ?string $fromEmail = null,
    ?array $data = null,
    ?array $headers = null,
    ?string $messenger = null,
    ?string $contentType = null,
): Response
```

---

## PublicResource

### getLists()

```php
getLists(): array<MailingList>
```

### subscribe()

```php
subscribe(
    string $email,
    string $name,
    array $listUuids,
): Response
```

---

## Data Objects

### Subscriber

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | Subscriber ID |
| `email` | `string` | Email address |
| `name` | `string` | Display name |
| `status` | `string` | Status: enabled, disabled, blocklisted |
| `attribs` | `array` | Custom attributes |
| `lists` | `array` | Subscribed lists |
| `createdAt` | `string` | Creation timestamp |
| `updatedAt` | `string` | Last update timestamp |

### MailingList

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | List ID |
| `uuid` | `string` | List UUID (for public subscriptions) |
| `name` | `string` | List name |
| `type` | `string` | Type: public, private |
| `optin` | `string` | Opt-in type: single, double |
| `tags` | `array` | List tags |
| `description` | `string` | List description |
| `subscriberCount` | `int` | Number of subscribers |

### Campaign

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | Campaign ID |
| `name` | `string` | Campaign name |
| `subject` | `string` | Email subject |
| `status` | `string` | Campaign status |
| `type` | `string` | Campaign type |
| `contentType` | `string` | Content type |
| `body` | `string` | HTML body |
| `altbody` | `string` | Plain text body |
| `fromEmail` | `string` | Sender email |
| `templateId` | `int` | Template ID |
| `tags` | `array` | Campaign tags |
| `sendAt` | `string` | Scheduled send time |
| `lists` | `array` | Target lists |

### Template

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | Template ID |
| `name` | `string` | Template name |
| `body` | `string` | Template HTML |
| `type` | `string` | Template type |
| `isDefault` | `bool` | Whether this is the default template |
