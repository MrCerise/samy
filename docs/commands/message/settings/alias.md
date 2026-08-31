# `alias`

`prefix` `guild only`

**Requires:** ManageGuild

Manage command aliases for this server.

**Usage**

```
,alias
```

## `alias add`

`prefix`

**Requires:** ManageGuild

Add a new alias for a command. Use $1, $2, etc. for arguments, $* for all.

**Usage**

```
,add <alias> <command>
```

| Argument  | Aliases | Description                                                       | Required |
| :-------- | :------ | :---------------------------------------------------------------- | :------: |
| `alias`   | —       | The alias to add.                                                 |  false   |
| `command` | —       | The command template. Use $1, $2, etc. for arguments, $* for all. |  false   |

## `alias remove`

`prefix`

**Requires:** ManageGuild

Remove an alias.

**Usage**

```
,remove <alias>
```

| Argument | Aliases | Description          | Required |
| :------- | :------ | :------------------- | :------: |
| `alias`  | —       | The alias to remove. |  false   |

## `alias list`

`prefix`

**Requires:** ManageGuild

List all aliases for this server.

**Usage**

```
,list
```
