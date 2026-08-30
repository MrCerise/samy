# `locale`

`prefix`

**Aliases:** `lang`, `language`

View or set language preferences.

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

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `scope` | `s` | Whether to set your own locale or the server's (user or server). | false |
| `locale` | `l` | Locale identifier (en-US, es-ES, fr-FR, etc). | false |

## `locale unset`

`prefix`

**Aliases:** `remove`, `clear`, `reset`

Reset your language, or the server's, back to automatic detection.

**Usage**
```
,unset [scope]
```

| Argument | Aliases | Description | Required |
| :-- | :-- | :-- | :--: |
| `scope` | `s` | Whether to reset your own locale or the server's (user or server). Defaults to user. | false |

