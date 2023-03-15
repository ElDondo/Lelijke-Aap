# Music-New Discord Music Bot

## First time setup:

1. Rename "template.env" to just ".env" and fill in your TOKEN and CLIENT_ID.
2. Load slash commands
3. Start bot

---

## cmd commands:

Start bot

> node index.js

Load slash commands

> node index.js load

Delete slash commands

> node index.js del

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
