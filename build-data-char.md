# Building Data Character

> [!IMPORTANT]
> An important note, is that data added is not arbitrarily added, but requires proper validation, where the community usually recommends whether or not it is added and whether or not it is trusted, so if it is not approved, don't get upset.

First, you can clone this repository if you want to make it easy to create 2 or more characters, where only push is required, requests should be queued.

```bash
git clone --depth 1 -b main https://github.com/netraindrop/charinfo-context
```

Second, add or modify, you can write the character file with a .character file extension to register it in the group section, in the .character file section there must be an aboutgroup.info file to explain the group briefly such as name, where it is from, and other notes.

To write the contents of the file like this, it can only read in the form of 1 line, just follow the data.

```text
[variable]:[...value]
```

More specific structure of the data form

Template [file in here](./template.character)

```text
name:Name of the character (Required)
callname:Nickname (Required)
gender:Type “Unknown”/“Female”/“Male” (Required)
icon:URL of the character icon (Not Required)
builder:URL of the github of the modification/someone who modified (Required)
source:URL or trustworthy page for the character (Required)
language:Language (In ISO Code) (Required)
introduction: Introduction of a character (Required)
personality: Personality about a person or character (Required)
moreabouthim: What else should be known about him (Required)
```

In table form

| Variable | Description | Congenital | Mandatory? |
|----------|-----------|--------|---------|
| name | The name of the character | | Yes |
| callname | Nickname | | Yes |
| gender | Gender | unknow/female/male | Yes |
| icon | URL of character icon | | No |
| builder | URL of the github of the modification/someone who modified | | Yes |
| source | URL or page that can be trusted for the character | | Yes |
| language | Language (In ISO Code) | | Yes |
| introduction | Introduction of a character | | Yes |
| personality | Personality about a person or character | | Yes |
| moreabouthim | What else should be known about him | | Yes |

> [!TIP]
> If you want to leave a comment, make sure there is 1 line with the hash

```text
# ✅ This is a correct example, because the parse code reads the hash at the beginning of the line.
❌ This is the wrong example # because the code cannot parse this part.
```

Like this :

```text
#name:Sakanan Katana (Old)
name:Sakanan Katana
```

After modifying or adding, please make sure the aboutgroup.info file exists and *.character exists to be modified, after that add data to the group in list-character.json to be able to track on the web, but usually this list will be received by the owner/admin.

Build list-character.json use this command

```bash
node build/buildlist.js
```

That's it, now you can contribute to this!, good luck 🎊.
