# `timezone`

`prefix`

**Aliases:** `tz`

View or set your local timezone.

**Usage**

```
,timezone [target]
```

| Argument | Aliases     | Description                               | Required |
| :------- | :---------- | :---------------------------------------- | :------: |
| `target` | `u`, `user` | The user whose timezone you want to view. |  false   |

## `timezone set`

`prefix`

Set your local timezone.

**Usage**

```
,set <timezone>
```

| Argument   | Aliases | Description                                            | Required |
| :--------- | :------ | :----------------------------------------------------- | :------: |
| `timezone` | `tz`    | Timezone identifier (America/New_York, UTC, EST, etc). |  false   |

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

| Argument | Aliases     | Description                      | Required |
| :------- | :---------- | :------------------------------- | :------: |
| `target` | `u`, `user` | The user to view local time for. |  false   |
