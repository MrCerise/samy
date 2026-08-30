# `leaver`

`prefix` `guild only`

**Aliases:** `leave`, `lv`

**Requires:** ManageGuild

Configure leave messages for the server.

**Usage**
```
,leaver
```

## `leaver add`

`prefix`

**Requires:** ManageGuild

Add a leave message to a channel.

**Usage**
```
,add <channel> <message>
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `channel` | `c` | The channel to send the leave message to. | false |
| `message` | `m` | Plain text, an {embed} script, or a {cv2} script. | false |

## `leaver preview`

`prefix`

**Aliases:** `view`, `test`

**Requires:** ManageGuild

Preview a configured leave message, or all of them.

**Usage**
```
,preview [channel]
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `channel` | `c` | The leave channel to preview. Leave empty to preview all leave messages | false |

## `leaver list`

`prefix`

**Requires:** ManageGuild

List all configured leave messages.

**Usage**
```
,list
```

## `leaver remove`

`prefix`

**Requires:** ManageGuild

Remove a leave message from a channel.

**Usage**
```
,remove <channel>
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `channel` | `c` | The channel to remove the leave message from. | false |

