# `lockdown`

`prefix` `guild only`

**Requires:** ManageGuild

Manage server-wide lockdown settings.

**Usage**

```
,lockdown [reason]
```

| Argument | Aliases | Description                                     | Required |
| :------- | :------ | :---------------------------------------------- | :------: |
| `reason` | `r`     | Reason for the lockdown, shown in each channel. |  false   |

## `lockdown on`

`prefix` `guild only`

**Requires:** ManageGuild

Force the lockdown on, even if it's already active.

**Usage**

```
,on [reason]
```

| Argument | Aliases | Description                                     | Required |
| :------- | :------ | :---------------------------------------------- | :------: |
| `reason` | `r`     | Reason for the lockdown, shown in each channel. |  false   |

## `lockdown off`

`prefix` `guild only`

**Requires:** ManageGuild

Force the lockdown off, even if it's already inactive.

**Usage**

```
,off [reason]
```

| Argument | Aliases | Description                                         | Required |
| :------- | :------ | :-------------------------------------------------- | :------: |
| `reason` | `r`     | Reason shown in each channel when lifting lockdown. |  false   |

## `lockdown channel`

`prefix` `guild only`

Manage lockdown channel settings.

**Usage**

```
,channel
```

## `lockdown role`

`prefix` `guild only`

Manage lockdown role settings.

**Usage**

```
,role
```
