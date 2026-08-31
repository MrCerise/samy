# `logs`

`prefix` `guild only`

**Aliases:** `logging`

Configure server event logging.

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

| Argument      | Aliases | Description                                                                            | Required |
| :------------ | :------ | :------------------------------------------------------------------------------------- | :------: |
| `category`    | `c`     | The log category: channels, guild, images, members, messages, moderation, roles, voice |  false   |
| `description` | `d`     | Optional description text.                                                             |  false   |
| `footer`      | `f`     | Optional footer text.                                                                  |  false   |

## `logs setup`

`prefix` `guild only`

**Requires:** ManageGuild

Create a logging category with a channel for every log event, and configure them automatically.

**Usage**

```
,setup [name]
```

| Argument | Aliases | Description                                            | Required |
| :------- | :------ | :----------------------------------------------------- | :------: |
| `name`   | `n`     | Name for the new logging category. Defaults to 'Logs'. |  false   |
