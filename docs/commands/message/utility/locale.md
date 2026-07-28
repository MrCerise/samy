# `locale`

`prefix`

**Aliases:** `lang`, `language`

View or set your preferred language, or the server's.

**Usage**
```
,locale
```

## `locale set`

`prefix`

Set your preferred language, or the server's language.

**Usage**
```
,set <scope> <locale>
```

| Argument | Description | Required |
| :-- | :-- | :--: |
| `scope` | Whether to set your own locale or the server's (user or server). | false |
| `locale` | Locale identifier (en-US, es-ES, fr-FR, etc). | false |

## `locale unset`

`prefix`

**Aliases:** `remove`, `clear`, `reset`

Reset your language, or the server's, back to automatic detection.

**Usage**
```
,unset [scope]
```

| Argument | Description | Required |
| :-- | :-- | :--: |
| `scope` | Whether to reset your own locale or the server's (user or server). Defaults to user. | false |

