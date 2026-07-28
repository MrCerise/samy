# `timezone`

`prefix`

**Aliases:** `tz`

View or set your local timezone.

**Usage**
```
,timezone [target]
```

| Argument | Description | Required |
| :-- | :-- | :--: |
| `target` | The user whose timezone you want to view. | false |

## `timezone set`

`prefix`

Set your local timezone.

**Usage**
```
,set <timezone>
```

| Argument | Description | Required |
| :-- | :-- | :--: |
| `timezone` | Timezone identifier (America/New_York, UTC, EST, etc). | false |

## `timezone unset`

`prefix`

**Aliases:** `remove`, `clear`

Remove your saved timezone.

**Usage**
```
,unset
```

## `timezone get`

`prefix`

View local time for a user.

**Usage**
```
,get [target]
```

| Argument | Description | Required |
| :-- | :-- | :--: |
| `target` | The user to view local time for. | false |

