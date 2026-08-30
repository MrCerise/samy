# `welcomer`

`prefix` `guild only`

**Aliases:** `welcome`, `wc`

**Requires:** ManageGuild

Configure welcome messages for the server.

**Usage**
```
,welcomer
```

## `welcomer add`

`prefix`

**Requires:** ManageGuild

Add a welcome message to a channel.

**Usage**
```
,add <channel> <message>
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `channel` | `c` | The channel to send the welcome message to. | false |
| `message` | `m` | Plain text, an {embed} script, or a {cv2} script. | false |

## `welcomer preview`

`prefix`

**Aliases:** `view`, `test`

**Requires:** ManageGuild

Preview a configured welcome message, or all of them.

**Usage**
```
,preview [channel]
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `channel` | `c` | The welcome channel to preview. Leave empty to preview all welcomes | false |

## `welcomer list`

`prefix`

**Requires:** ManageGuild

List all configured welcome messages.

**Usage**
```
,list
```

## `welcomer remove`

`prefix`

**Requires:** ManageGuild

Remove a welcome message from a channel.

**Usage**
```
,remove <channel>
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `channel` | `c` | The channel to remove the welcome message from. | false |

