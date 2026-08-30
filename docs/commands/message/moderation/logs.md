# `logs`

`prefix` `guild only`

**Aliases:** `logging`

Log events in your server.

**Usage**
```
,logs
```

## `logs add`

`prefix` `guild only`

Add logging for specific events.

**Usage**
```
,add
```

## `logs remove`

`prefix` `guild only`

Remove logging for specific events.

**Usage**
```
,remove
```

## `logs list`

`prefix` `guild only`

**Requires:** ManageGuild

List all the logging channels.

**Usage**
```
,list
```

## `logs ignore`

`prefix` `guild only`

Manage the logging ignore list.

**Usage**
```
,ignore
```

## `logs emit`

`prefix` `guild only` `owner only`

Manually emit test log events for all categories.

**Usage**
```
,emit <category> [description] [footer]
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `category` | `c` | The log category: channels, guild, images, members, messages, moderation, roles, voice | false |
| `description` | `d` | Optional description text. | false |
| `footer` | `f` | Optional footer text. | false |

