const Discord = require("discord.js")
const dotenv = require("dotenv")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const fs = require("fs")
const { Player } = require("discord-player")

dotenv.config()
const TOKEN = process.env.TOKEN

const LOAD_SLASH = process.argv[2] == "load"
const LOAD_SLASH_GLOBAL = process.argv[2] == "loadglobal"
const DEL_SLASH = process.argv[2] == "del"
const DEL_SLASH_GLOBAL = process.argv[2] == "delglobal"

const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = "298920673957380098"

module.exports.date = 0

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildVoiceStates
    ]
})

client.slashcommands = new Discord.Collection()
client.player = new Player(client, {})

let commands = []

const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))
for (const file of slashFiles){
    const slashcmd = require(`./slash/${file}`)
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if (LOAD_SLASH || LOAD_SLASH_GLOBAL) commands.push(slashcmd.data.toJSON())
}

if (LOAD_SLASH) {
    const rest = new REST({ version: "9" }).setToken(TOKEN)
    console.log("Deploying slash commands")
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {body: commands})
    .then(() => {
        console.log("Successfully loaded")
        process.exit(0)
    })
    .catch((err) => {
        if (err){
            console.log(err)
            process.exit(1)
        }
    })
} else if (LOAD_SLASH_GLOBAL) {
    const rest = new REST({ version: "9" }).setToken(TOKEN)
    console.log("Deploying global slash commands")
    rest.put(Routes.applicationCommands(CLIENT_ID), {body: commands})
    .then(() => {
        console.log("Successfully loaded")
        process.exit(0)
    })
    .catch((err) => {
        if (err){
            console.log(err)
            process.exit(1)
        }
    })
} else if (DEL_SLASH) {
    const rest = new REST({ version: '9' }).setToken(TOKEN);
    rest.get(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID))
        .then(data => {
            const promises = [];
            for (const command of data) {
                const deleteUrl = `${Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
            }
            return Promise.all(promises);
        });
} else if (DEL_SLASH_GLOBAL) {
    const rest = new REST({ version: '9' }).setToken(TOKEN);
    rest.get(Routes.applicationCommands(CLIENT_ID))
        .then(data => {
            const promises = [];
            for (const command of data) {
                const deleteUrl = `${Routes.applicationCommands(CLIENT_ID)}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
            }
            return Promise.all(promises);
        });
} else {
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`)
    })
    client.on("interactionCreate", (interaction) => {
        async function handleCommand(){
            if (!interaction.isCommand()) return

            const slashcmd= client.slashcommands.get(interaction.commandName)
            if (!slashcmd) interaction.reply("Not a valid slash command")

            await interaction.deferReply()
            await slashcmd.run({ client, interaction })
        }
        handleCommand()
    })
    client.login(TOKEN)
	
	client.player.on("error", (queue, error) => {
        console.log(`[Error emitted from the queue: ${error.message}`);
    });
	client.player.on("connectionError", (queue, error) => {
        console.log(`Error emitted from the connection: ${error.message}`);
    });
    client.player.on("trackStart", (queue, track) => {
        const currentDate = new Date();
        module.exports.date = currentDate
    });
}