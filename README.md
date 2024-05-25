# Music-New Discord Music Bot

## First time setup:
1. Make sure you have NodeJS installed
2. Open command line in the bot map
3. Type npm install
4. Rename "template.env" to just ".env" and fill in your TOKEN, CLIENT_ID and GUILD_ID.
5. Load slash commands
6. Start bot

---

## cmd commands:

Start bot

> node index.js

Load slash commands

> node deploy-commands.js

Delete slash commands

> node delete-commands.js

---

## YouTube Cookies (for age restricted videos)

Steps : -

* Open your browser, then open dev-tools [ Option + ⌘ + J (on macOS), or Shift + CTRL + J (on Windows/Linux). ]

* Then go to Network Tab

* Go to any YouTube URL and find the first request and open it

* The first request would be watch?v="Your video ID"

* Now go to Request Headers

* Find cookie in request headers

* Right click copy value and paste this in .env file
