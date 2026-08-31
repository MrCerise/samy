# `purge`

`prefix` `guild only`

**Aliases:** `clear`, `c`, `clean`, `prune`

**Requires:** ManageMessages

Delete multiple messages from a channel.

**Usage**

```
,purge [amount]
```

| Argument | Aliases      | Description                           | Required |
| :------- | :----------- | :------------------------------------ | :------: |
| `amount` | `a`, `count` | Number of messages to delete (1-500). |  false   |

## `purge user`

`prefix`

**Aliases:** `member`, `author`

**Requires:** ManageMessages

Delete messages sent by a specific user.

**Usage**

```
,user <user> [amount]
```

| Argument | Aliases            | Description                           | Required |
| :------- | :----------------- | :------------------------------------ | :------: |
| `user`   | `u`, `m`, `member` | The user whose messages to delete.    |  false   |
| `amount` | `a`, `count`       | Number of messages to delete (1-500). |  false   |

## `purge links`

`prefix`

**Aliases:** `link`, `urls`, `url`

**Requires:** ManageMessages

Delete messages containing links/URLs.

**Usage**

```
,links [amount]
```

| Argument | Aliases      | Description                           | Required |
| :------- | :----------- | :------------------------------------ | :------: |
| `amount` | `a`, `count` | Number of messages to delete (1-500). |  false   |

## `purge bots`

`prefix`

**Aliases:** `bot`

**Requires:** ManageMessages

Delete messages sent by bots.

**Usage**

```
,bots [amount]
```

| Argument | Aliases      | Description                           | Required |
| :------- | :----------- | :------------------------------------ | :------: |
| `amount` | `a`, `count` | Number of messages to delete (1-500). |  false   |

## `purge attachments`

`prefix`

**Aliases:** `attachment`, `files`, `file`

**Requires:** ManageMessages

Delete messages containing attachments.

**Usage**

```
,attachments [amount]
```

| Argument | Aliases      | Description                           | Required |
| :------- | :----------- | :------------------------------------ | :------: |
| `amount` | `a`, `count` | Number of messages to delete (1-500). |  false   |

## `purge embeds`

`prefix`

**Aliases:** `embed`

**Requires:** ManageMessages

Delete messages containing embeds.

**Usage**

```
,embeds [amount]
```

| Argument | Aliases      | Description                           | Required |
| :------- | :----------- | :------------------------------------ | :------: |
| `amount` | `a`, `count` | Number of messages to delete (1-500). |  false   |
