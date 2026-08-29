# `unlock`

`prefix` `guild only`

**Requires:** ManageChannels

Unlock a channel, restoring @everyone's (and any configured lockdown roles') ability to send messages, react, and create threads.

**Usage**
```
,unlock [channel] [reason]
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `channel` | `c` | The channel to unlock (defaults to this channel). | false |
| `reason` | `r` | Reason for unlocking, shown in the channel. | false |

