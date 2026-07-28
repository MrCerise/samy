# `/locale`

`slash`

View or set your preferred language, or the server's.

## `/locale view`

`slash`

View your locale, or the server's.

| Argument | Description | Required |
| :-- | :-- | :--: |
| `scope` | Whose locale to view. | false |

## `/locale set`

`slash`

Set your preferred language, or the server's language.

| Argument | Description | Required |
| :-- | :-- | :--: |
| `scope` | Whether to set your own locale or the server's. | true |
| `locale` | Locale identifier (en-US, es-ES, fr-FR, etc). | true |

## `/locale unset`

`slash`

Reset your language, or the server's, back to automatic detection.

| Argument | Description | Required |
| :-- | :-- | :--: |
| `scope` | Whether to reset your own locale or the server's. | false |

