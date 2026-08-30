# `restrictcommand`

`prefix` `guild only`

**Requires:** ManageGuild

Restrict a command to specific roles.

**Usage**
```
,restrictcommand
```

## `restrictcommand add`

`prefix`

**Requires:** ManageGuild

Add a role restriction to a command.

**Usage**
```
,add <command> <role>
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `command` | — | The command to restrict. Use command:subcommand for subcommands. | false |
| `role` | — | The role to restrict to. | false |

## `restrictcommand remove`

`prefix`

**Requires:** ManageGuild

Remove a role restriction from a command.

**Usage**
```
,remove <command> <role>
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `command` | — | The command to unrestrict. Use command:subcommand for subcommands. | false |
| `role` | — | The role to remove. | false |

## `restrictcommand clear`

`prefix`

**Requires:** ManageGuild

Clear all restrictions from a command.

**Usage**
```
,clear <command>
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `command` | — | The command to clear restrictions from. | false |

## `restrictcommand list`

`prefix`

**Requires:** ManageGuild

List all restricted commands.

**Usage**
```
,list
```

