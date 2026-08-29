# `lock`

`prefix` `guild only`

**Requires:** ManageChannels

Lock a channel, preventing @everyone (and any configured lockdown roles) from sending messages, reacting, or creating threads.

**Usage**
```
,lock [channel] [reason]
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `channel` | `c` | The channel to lock (defaults to this channel). | false |
| `reason` | `r` | Reason for locking, shown in the channel. | false |

