# `warnings`

`prefix` `guild only`

**Aliases:** `warninghistory`, `warns`

**Requires:** ManageMessages, ModerateMembers

View and manage warning history for a user.

**Usage**
```
,warnings [user] [page]
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `user` | `u`, `member`, `target` | The user to view warnings for. | false |
| `page` | `p` | Page number. | false |

## `warnings remove`

`prefix`

**Requires:** ManageMessages, ModerateMembers

Remove a specific warning from a user.

**Usage**
```
,remove <user> <warning_id>
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `user` | `u`, `member`, `target` | The user to remove the warning from. | false |
| `warning_id` | `warning`, `id` | The warning ID to remove. | false |

## `warnings clear`

`prefix`

**Requires:** ManageMessages, ModerateMembers

Clear all warnings for a user.

**Usage**
```
,clear <user>
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `user` | `u`, `member`, `target` | The user to clear warnings for. | false |

