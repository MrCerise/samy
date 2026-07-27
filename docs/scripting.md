# Scripting

> This feature has been vibecoded, it works very well in my experience

Build embeds and Components V2 messages with a simple script syntax.

## Commands

### Builder

Prefix:

```text
,builder {embed}$v{title: Hello}$v{description: World}$v{color: #5865F2}
,builder {cv2}$v{container}$v{text: Hello}$v{separator}$v{section}$v{text: Welcome}$v{button: Click && https://discord.com}
```

Slash:

```text
/builder message:{embed}$v{title: Hello}$v{description: World}$v{color: #5865F2}
/builder message:{cv2}$v{container}$v{text: Hello}$v{separator}$v{section}$v{text: Welcome}$v{button: Click && https://discord.com}
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
,builder {embed}$v{title: Hello World}
```

**Description**

```text
,builder {embed}$v{description: This is a longer description for your embed.}
```

**Color**

```text
,builder {embed}$v{title: Blurple}$v{color: #5865F2}
,builder {embed}$v{title: Red}$v{color: #ED4245}
,builder {embed}$v{title: Green}$v{color: #57F287}
,builder {embed}$v{title: Decimal color}$v{color: 5793266}
```

**URL** (makes the title clickable)

```text
,builder {embed}$v{title: Discord}$v{url: https://discord.com}
```

**Thumbnail**

```text
,builder {embed}$v{title: Avatar}$v{thumbnail: https://cdn.discordapp.com/embed/avatars/0.png}
```

**Image**

```text
,builder {embed}$v{title: Banner}$v{image: https://cdn.discordapp.com/embed/avatars/1.png}
```

**Timestamp**

```text
,builder {embed}$v{title: Just now}$v{timestamp}
```

**Author**

```text
,builder {embed}$v{author: Samy}
,builder {embed}$v{author: Samy && https://cdn.discordapp.com/embed/avatars/0.png}
,builder {embed}$v{author: Samy && https://cdn.discordapp.com/embed/avatars/0.png && https://discord.com}
```

**Footer**

```text
,builder {embed}$v{title: Info}$v{footer: Made with Samy}
,builder {embed}$v{title: Info}$v{footer: Made with Samy && https://cdn.discordapp.com/embed/avatars/0.png}
```

**Fields**

```text
,builder {embed}$v{title: Stats}$v{field: Ping && 12ms}
,builder {embed}$v{title: Stats}$v{field: Ping && 12ms}$v{field: API && Online}
,builder {embed}$v{title: Stats}$v{field: Ping && 12ms && inline}$v{field: API && Online && inline}$v{field: Status && Active && inline}
```

**Buttons** (link only)

```text
,builder {embed}$v{button: Website && https://discord.com}
,builder {embed}$v{button: Website && https://discord.com}$v{button: Support && https://discord.gg/discord-developers}
,builder {embed}$v{button: Disabled && https://discord.com && disabled}
```

### Full embed examples

**Simple announcement**

```text
,builder {embed}$v
{title: Server Update}$v
{description: We added new channels and roles. Check #announcements for details.}$v
{color: #5865F2}$v
{timestamp}$v
{footer: Samy}
```

**Welcome-style embed**

```text
,builder {embed}$v
{title: Welcome!}$v
{description: Hey {user}, welcome to {guild.name}!}$v
{color: #57F287}$v
{thumbnail: https://cdn.discordapp.com/embed/avatars/0.png}$v
{footer: Enjoy your stay}
```

**Status / info card**

```text
,builder {embed}$v
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
,builder {embed}$v
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
,builder {embed}$v
{title: New Artwork}$v
{description: Check out this image.}$v
{image: https://cdn.discordapp.com/embed/avatars/4.png}$v
{thumbnail: https://cdn.discordapp.com/embed/avatars/0.png}$v
{color: #FEE75C}$v
{button: Open Image && https://cdn.discordapp.com/embed/avatars/4.png}
```

**Profile-style embed**

```text
,builder {embed}$v
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
,builder {embed}$v
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
,builder {cv2}$v{container}$v{text: Hello}
,builder {cv2}$v{container: #5865F2}$v{text: Colored container}
```

**Text**

```text
,builder {cv2}$v{container}$v{text: Plain text}
,builder {cv2}$v{container}$v{text: **Bold** and *italic*}
,builder {cv2}$v{container}$v{text: # Heading}$v{text: Body text under it}
```

**Separator**

```text
,builder {cv2}$v{container}$v{text: Above}$v{separator}$v{text: Below}
,builder {cv2}$v{container}$v{text: Above}$v{separator: large}$v{text: Below}
,builder {cv2}$v{container}$v{text: Above}$v{separator: small && hidden}$v{text: Below}
```

**Section + button**

```text
,builder {cv2}$v
{container}$v
{section}$v
{text: Click the button}$v
{button: Open && https://discord.com}
```

**Section + thumbnail**

```text
,builder {cv2}$v
{container}$v
{section}$v
{text: Profile card}$v
{text: Extra line of info}$v
{thumbnail: https://cdn.discordapp.com/embed/avatars/0.png}
```

**Media / gallery**

```text
,builder {cv2}$v{container}$v{media: https://cdn.discordapp.com/embed/avatars/0.png}
,builder {cv2}$v{container}$v{gallery: https://cdn.discordapp.com/embed/avatars/0.png && https://cdn.discordapp.com/embed/avatars/1.png}
,builder {cv2}$v
{container}$v
{text: Screenshots}$v
{media: https://cdn.discordapp.com/embed/avatars/0.png && https://cdn.discordapp.com/embed/avatars/1.png && https://cdn.discordapp.com/embed/avatars/2.png}
```

**Buttons in a container**

```text
,builder {cv2}$v
{container}$v
{text: Useful links}$v
{button: Website && https://discord.com}$v
{button: Support && https://discord.gg/discord-developers}$v
{button: Docs && https://discord.com/developers/docs}
```

### Full CV2 examples

**Simple announcement**

```text
,builder {cv2}$v
{container: #5865F2}$v
{text: # Server Update}$v
{text: We shipped a few quality-of-life changes today.}$v
{separator}$v
{text: Check #announcements for the full list.}
```

**Welcome message**

```text
,builder {cv2}$v
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
,builder {cv2}$v
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
,builder {cv2}$v
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
,builder {cv2}$v
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
,builder {cv2}$v
{container: #5865F2}$v
{text: # Part 1}$v
{text: First block of content.}$v
{container: #ED4245}$v
{text: # Part 2}$v
{text: Second block with a different accent.}
```

**Product / store style**

```text
,builder {cv2}$v
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
,builder {cv2}$v
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
,builder {embed}$v{title: Links}$v{button: Discord && https://discord.com}$v{button: GitHub && https://github.com}
```

**CV2 section accessory**

```text
,builder {cv2}$v{container}$v{section}$v{text: Open the site}$v{button: Visit && https://discord.com}
```

**CV2 action row**

```text
,builder {cv2}$v{container}$v{text: Pick a link}$v{button: A && https://discord.com}$v{button: B && https://discord.gg/discord-developers}
```

---

## Tips

- Put `$v` between every parameter
- Use `&&` only inside multi-argument parameters like `field`, `author`, `footer`, `media`, and `button`
- Buttons always need a real `http://` or `https://` URL
- Thumbnails in CV2 must come after a `{section}`
- If something is wrong, the bot replies with a clear error
