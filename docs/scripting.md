# Scripting

> This feature has been vibecoded, it works very well in my experience

Build embeds and Components V2 messages with a simple script syntax.

## Commands

### Embed

Prefix:

```text
,embed {title: Hello}$v{description: World}$v{color: #5865F2}
```

Slash:

```text
/embed script:{title: Hello}$v{description: World}$v{color: #5865F2}
```

### Components V2

Prefix:

```text
,cv2 {container}$v{text: Hello}$v{separator}$v{section}$v{text: Welcome}$v{button: Click && https://discord.com}
```

Slash:

```text
/cv2 script:{container}$v{text: Hello}$v{separator}$v{section}$v{text: Welcome}$v{button: Click && https://discord.com}
```

### `,say`

`say` accepts plain text, embed scripts, or CV2 scripts.

Prefix the script with `{embed}` or `{cv2}` (and usually `$v`). You can also put plain text before the marker:

```text
,say Hello world
,say #general Hello world

,say Hello {embed}$v{title: Title}$v{description: Body}
,say {embed}$v{content: Hello}$v{title: Title}$v{description: Body}
,say #announcements Update {embed}$v{title: Patch Notes}$v{description: We shipped something new.}

,say Hello {cv2}$v{container}$v{text: Welcome}$v{button: Click && https://discord.com}
,say {cv2}$v{content: Hello}$v{container}$v{text: Welcome}
,say #general {cv2}$v{container: #5865F2}$v{text: **Announcement**}$v{text: Please read the rules.}
```

For embeds, plain text becomes the message content above the embed (`{content: ...}` also works).

For CV2, plain text / `{content: ...}` becomes a text component (Components V2 cannot use normal message content).

---

## Syntax

Scripts are made of parameters separated by `$v`:

```text
{parameter: value}$v{parameter: value}
```

- `{` starts a parameter
- `:` separates the name from the value
- `$v` separates parameters
- `}` ends a parameter
- `&&` separates multiple arguments inside one parameter

You can also put variables in values, like `{user}` or `{guild.name}`. They are recognized, but not all are filled in yet.

```text
{description: Welcome {user} to {guild.name}}
```

---

## Embed parameters

| Parameter     | Example                                                        |
| ------------- | -------------------------------------------------------------- |
| `title`       | `{title: Hello}`                                               |
| `description` | `{description: Welcome}`                                       |
| `color`       | `{color: #5865F2}`                                             |
| `url`         | `{url: https://discord.com}`                                   |
| `thumbnail`   | `{thumbnail: https://...}`                                     |
| `image`       | `{image: https://...}`                                         |
| `timestamp`   | `{timestamp}`                                                  |
| `author`      | `{author: Name && icon url && url}`                            |
| `footer`      | `{footer: Text && icon url}`                                   |
| `field`       | `{field: Name && Value}` or `{field: Name && Value && inline}` |
| `button`      | `{button: Label && https://example.com}`                       |
| `content`     | `{content: Plain text above the embed}`                        |

### One parameter at a time

**Title**

```text
,embed {title: Hello World}
```

**Description**

```text
,embed {description: This is a longer description for your embed.}
```

**Color**

```text
,embed {title: Blurple}$v{color: #5865F2}
,embed {title: Red}$v{color: #ED4245}
,embed {title: Green}$v{color: #57F287}
,embed {title: Decimal color}$v{color: 5793266}
```

**URL** (makes the title clickable)

```text
,embed {title: Discord}$v{url: https://discord.com}
```

**Thumbnail**

```text
,embed {title: Avatar}$v{thumbnail: https://cdn.discordapp.com/embed/avatars/0.png}
```

**Image**

```text
,embed {title: Banner}$v{image: https://cdn.discordapp.com/embed/avatars/1.png}
```

**Timestamp**

```text
,embed {title: Just now}$v{timestamp}
```

**Author**

```text
,embed {author: Samy}
,embed {author: Samy && https://cdn.discordapp.com/embed/avatars/0.png}
,embed {author: Samy && https://cdn.discordapp.com/embed/avatars/0.png && https://discord.com}
```

**Footer**

```text
,embed {title: Info}$v{footer: Made with Samy}
,embed {title: Info}$v{footer: Made with Samy && https://cdn.discordapp.com/embed/avatars/0.png}
```

**Fields**

```text
,embed {title: Stats}$v{field: Ping && 12ms}
,embed {title: Stats}$v{field: Ping && 12ms}$v{field: API && Online}
,embed {title: Stats}$v{field: Ping && 12ms && inline}$v{field: API && Online && inline}$v{field: Shard && 0 && inline}
```

**Buttons** (link only)

```text
,embed {title: Links}$v{button: Website && https://discord.com}
,embed {title: Links}$v{button: Website && https://discord.com}$v{button: Support && https://discord.gg/discord-developers}
,embed {title: Links}$v{button: Disabled && https://discord.com && disabled}
```

### Full embed examples

**Simple announcement**

```text
,embed
{title: Server Update}$v
{description: We added new channels and roles. Check #announcements for details.}$v
{color: #5865F2}$v
{timestamp}$v
{footer: Samy}
```

**Welcome-style embed**

```text
,embed
{title: Welcome!}$v
{description: Hey {user}, welcome to {guild.name}!}$v
{color: #57F287}$v
{thumbnail: https://cdn.discordapp.com/embed/avatars/0.png}$v
{footer: Enjoy your stay}
```

**Status / info card**

```text
,embed
{author: Status Bot && https://cdn.discordapp.com/embed/avatars/2.png}$v
{title: System Status}$v
{description: Everything looks good right now.}$v
{color: #57F287}$v
{field: API && Online && inline}$v
{field: Latency && 42ms && inline}$v
{field: Uptime && 99.9% && inline}$v
{timestamp}$v
{footer: Last checked}
```

**Rules / guide**

```text
,embed
{title: Server Rules}$v
{description: Please read before chatting.}$v
{color: #ED4245}$v
{field: 1. Be respectful && No harassment or hate speech.}$v
{field: 2. No spam && Keep messages useful.}$v
{field: 3. Use channels properly && Read channel topics.}$v
{footer: Breaking rules may result in a mute or ban}$v
{button: Full Rules && https://discord.com}
```

**Media embed**

```text
,embed
{title: New Artwork}$v
{description: Check out this image.}$v
{image: https://cdn.discordapp.com/embed/avatars/4.png}$v
{thumbnail: https://cdn.discordapp.com/embed/avatars/0.png}$v
{color: #FEE75C}$v
{button: Open Image && https://cdn.discordapp.com/embed/avatars/4.png}
```

**Profile-style embed**

```text
,embed
{author: {user} && https://cdn.discordapp.com/embed/avatars/1.png}$v
{title: User Profile}$v
{description: Member of {guild.name}}$v
{thumbnail: https://cdn.discordapp.com/embed/avatars/1.png}$v
{field: Joined && Recently && inline}$v
{field: Roles && Member && inline}$v
{color: #EB459E}$v
{url: https://discord.com}$v
{timestamp}
```

**Everything together**

```text
,embed
{author: Samy && https://cdn.discordapp.com/embed/avatars/0.png && https://discord.com}$v
{title: Kitchen Sink}$v
{url: https://discord.com}$v
{description: This embed uses almost every parameter.}$v
{color: #5865F2}$v
{thumbnail: https://cdn.discordapp.com/embed/avatars/1.png}$v
{image: https://cdn.discordapp.com/embed/avatars/2.png}$v
{field: Left && Value A && inline}$v
{field: Middle && Value B && inline}$v
{field: Right && Value C && inline}$v
{field: Notes && Extra details go here.}$v
{footer: Footer text && https://cdn.discordapp.com/embed/avatars/3.png}$v
{timestamp}$v
{button: Docs && https://discord.com}$v
{button: Invite && https://discord.gg/discord-developers}
```

---

## Components V2

| Component           | Example                                      |
| ------------------- | -------------------------------------------- |
| `container`         | `{container}` or `{container: #5865F2}`      |
| `text`              | `{text: Hello World}`                        |
| `content`           | `{content: Hello}` (alias of `text`)         |
| `separator`         | `{separator}` or `{separator: large}`        |
| `section`           | `{section}`                                  |
| `thumbnail`         | `{thumbnail: https://...}` (after a section) |
| `media` / `gallery` | `{media: https://a.png && https://b.png}`    |
| `button`            | `{button: Label && https://example.com}`     |

### How nesting works

Write components in order with `$v`.

- `{container}` owns everything after it until the next container
- `{section}` takes the following `{text}` lines, then one `{button}` or `{thumbnail}`
- `{thumbnail}` only works as a section accessory

### One component at a time

**Container**

```text
,cv2 {container}$v{text: Hello}
,cv2 {container: #5865F2}$v{text: Colored container}
```

**Text**

```text
,cv2 {container}$v{text: Plain text}
,cv2 {container}$v{text: **Bold** and *italic*}
,cv2 {container}$v{text: # Heading}$v{text: Body text under it}
```

**Separator**

```text
,cv2 {container}$v{text: Above}$v{separator}$v{text: Below}
,cv2 {container}$v{text: Above}$v{separator: large}$v{text: Below}
,cv2 {container}$v{text: Above}$v{separator: small && hidden}$v{text: Below}
```

**Section + button**

```text
,cv2
{container}$v
{section}$v
{text: Click the button}$v
{button: Open && https://discord.com}
```

**Section + thumbnail**

```text
,cv2
{container}$v
{section}$v
{text: Profile card}$v
{text: Extra line of info}$v
{thumbnail: https://cdn.discordapp.com/embed/avatars/0.png}
```

**Media / gallery**

```text
,cv2 {container}$v{media: https://cdn.discordapp.com/embed/avatars/0.png}
,cv2 {container}$v{gallery: https://cdn.discordapp.com/embed/avatars/0.png && https://cdn.discordapp.com/embed/avatars/1.png}
,cv2
{container}$v
{text: Screenshots}$v
{media: https://cdn.discordapp.com/embed/avatars/0.png && https://cdn.discordapp.com/embed/avatars/1.png && https://cdn.discordapp.com/embed/avatars/2.png}
```

**Buttons in a container**

```text
,cv2
{container}$v
{text: Useful links}$v
{button: Website && https://discord.com}$v
{button: Support && https://discord.gg/discord-developers}$v
{button: Docs && https://discord.com/developers/docs}
```

### Full CV2 examples

**Simple announcement**

```text
,cv2
{container: #5865F2}$v
{text: # Server Update}$v
{text: We shipped a few quality-of-life changes today.}$v
{separator}$v
{text: Check #announcements for the full list.}
```

**Welcome message**

```text
,cv2
{container: #57F287}$v
{section}$v
{text: # Welcome!}$v
{text: Hey {user}, glad you joined {guild.name}.}$v
{thumbnail: https://cdn.discordapp.com/embed/avatars/0.png}$v
{separator}$v
{text: Start in #general and read the rules.}$v
{button: Rules && https://discord.com}
```

**Link card**

```text
,cv2
{container}$v
{section}$v
{text: **Need help?**}$v
{text: Join the support server or read the docs.}$v
{button: Support && https://discord.gg/discord-developers}$v
{separator}$v
{button: Documentation && https://discord.com/developers/docs}$v
{button: Status Page && https://discordstatus.com}
```

**Gallery post**

```text
,cv2
{container: #FEE75C}$v
{text: # Weekly Highlights}$v
{text: A few moments from this week.}$v
{separator: large}$v
{media: https://cdn.discordapp.com/embed/avatars/0.png && https://cdn.discordapp.com/embed/avatars/1.png && https://cdn.discordapp.com/embed/avatars/2.png}$v
{separator}$v
{section}$v
{text: Want to submit yours?}$v
{button: Submit && https://discord.com}
```

**Multi-section layout**

```text
,cv2
{container}$v
{text: # Feature Overview}$v
{separator}$v
{section}$v
{text: **Moderation**}$v
{text: Ban, kick, timeout, and case logs.}$v
{button: Guide && https://discord.com}$v
{separator}$v
{section}$v
{text: **Utility**}$v
{text: Embeds, CV2 builders, and info commands.}$v
{button: Examples && https://discord.com}$v
{separator}$v
{section}$v
{text: **Last.fm**}$v
{text: Now playing and listening stats.}$v
{thumbnail: https://cdn.discordapp.com/embed/avatars/3.png}
```

**Two containers**

```text
,cv2
{container: #5865F2}$v
{text: # Part 1}$v
{text: First block of content.}$v
{container: #ED4245}$v
{text: # Part 2}$v
{text: Second block with a different accent.}
```

**Product / store style**

```text
,cv2
{container: #EB459E}$v
{section}$v
{text: # Premium Plan}$v
{text: Unlock extra features for your server.}$v
{thumbnail: https://cdn.discordapp.com/embed/avatars/4.png}$v
{separator}$v
{text: - Custom welcome messages}$v
{text: - Advanced automod}$v
{text: - Priority support}$v
{separator: large}$v
{button: Buy Premium && https://discord.com}$v
{button: Compare Plans && https://discord.com}
```

**Everything together**

```text
,cv2
{container: #5865F2}$v
{text: # Components Showcase}$v
{text: Text, separators, media, sections, thumbnails, and buttons.}$v
{separator: large}$v
{media: https://cdn.discordapp.com/embed/avatars/0.png && https://cdn.discordapp.com/embed/avatars/1.png}$v
{separator}$v
{section}$v
{text: **Section with thumbnail**}$v
{text: Accessory on the right.}$v
{thumbnail: https://cdn.discordapp.com/embed/avatars/2.png}$v
{separator}$v
{section}$v
{text: **Section with button**}$v
{text: Accessory becomes a link button.}$v
{button: Open Discord && https://discord.com}$v
{separator}$v
{text: Footer-style text at the bottom.}$v
{button: Docs && https://discord.com/developers/docs}$v
{button: Support && https://discord.gg/discord-developers}
```

---

## Buttons

Buttons are **link buttons only**.

```text
{button: Label && https://example.com}
{button: Label && https://example.com && disabled}
```

**Embed**

```text
,embed {title: Links}$v{button: Discord && https://discord.com}$v{button: GitHub && https://github.com}
```

**CV2 section accessory**

```text
,cv2 {container}$v{section}$v{text: Open the site}$v{button: Visit && https://discord.com}
```

**CV2 action row**

```text
,cv2 {container}$v{text: Pick a link}$v{button: A && https://discord.com}$v{button: B && https://discord.gg/discord-developers}
```

---

## Tips

- Put `$v` between every parameter
- Use `&&` only inside multi-argument parameters like `field`, `author`, `footer`, `media`, and `button`
- Buttons always need a real `http://` or `https://` URL
- Thumbnails in CV2 must come after a `{section}`
- If something is wrong, the bot replies with a clear error
