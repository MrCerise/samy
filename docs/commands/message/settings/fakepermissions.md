# `fakepermissions`

`prefix` `guild only`

**Aliases:** `fp`

**Requires:** ManageGuild

Manage fake permissions for roles.

**Usage**

```
,fakepermissions
```

## `fakepermissions add`

`prefix`

**Requires:** ManageGuild

Add a fake permission to a role.

**Usage**

```
,add <role> <permission>
```

| Argument     | Aliases | Description                        | Required |
| :----------- | :------ | :--------------------------------- | :------: |
| `role`       | —       | The role to add the permission to. |  false   |
| `permission` | —       | The permission to add.             |  false   |

## `fakepermissions remove`

`prefix`

**Requires:** ManageGuild

Remove a fake permission from a role.

**Usage**

```
,remove <role> <permission>
```

| Argument     | Aliases | Description                             | Required |
| :----------- | :------ | :-------------------------------------- | :------: |
| `role`       | —       | The role to remove the permission from. |  false   |
| `permission` | —       | The permission to remove.               |  false   |

## `fakepermissions list`

`prefix`

**Requires:** ManageGuild

List fake permissions for a role.

**Usage**

```
,list [role]
```

| Argument | Aliases | Description                       | Required |
| :------- | :------ | :-------------------------------- | :------: |
| `role`   | —       | The role to list permissions for. |  false   |
