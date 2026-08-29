# `notes`

`prefix` `guild only`

**Aliases:** `note`

**Requires:** ManageMessages, ModerateMembers

View and manage member notes.

**Usage**
```
,notes [user] [page]
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `user` | `u`, `member`, `target` | The user to view notes for. | false |
| `page` | `p` | Page number. | false |

## `notes add`

`prefix`

**Requires:** ManageMessages, ModerateMembers

Add a note to a member.

**Usage**
```
,add <user> <content>
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `user` | `u`, `member`, `target` | The member to add a note to. | false |
| `content` | `c`, `note` | The note content. | false |

## `notes remove`

`prefix`

**Requires:** ManageMessages, ModerateMembers

Remove a specific note from a user.

**Usage**
```
,remove <user> <note_id>
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `user` | `u`, `member`, `target` | The user to remove the note from. | false |
| `note_id` | `note`, `id` | The note ID to remove. | false |

## `notes clear`

`prefix`

**Requires:** ManageMessages, ModerateMembers

Clear all notes for a user.

**Usage**
```
,clear <user>
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `user` | `u`, `member`, `target` | The user to clear notes for. | false |

