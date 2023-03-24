const { Client, Collection, Events, GatewayIntentBits } = require("discord.js")
const dotenv = require("dotenv")
//const { REST } = require("@discordjs/rest")
//const { Routes } = require("discord-api-types/v9")
const fs = require("node:fs")
const path = require("node:path")
const { Player } = require("discord-player")

dotenv.config()
const TOKEN = process.env.TOKEN
// const CLIENT_ID = process.env.CLIENT_ID
// const GUILD_ID = process.env.GUILD_ID

module.exports.date = 0

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
})

//client.slashcommands = new Discordjs.Collection()
client.commands = new Collection()
client.player = new Player(client, {})

const commandsPath = path.join(__dirname, 'slash')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const command = require(filePath)
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command)
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName)

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`)
            return
        }

        try {
            await interaction.deferReply()
            await command.execute(interaction)
        } catch (error) {
            console.error(error)
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true })
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
            }
        }
    } else if (interaction.isAutocomplete()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
        
		try {
			await command.autocomplete(interaction);
		} catch (error) {
			console.error(error);
		}
	}
})

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`)
})

// Log in to Discord with your client's token
client.login(TOKEN)

// const LOAD_SLASH = process.argv[2] == "load"
// const LOAD_SLASH_GLOBAL = process.argv[2] == "loadglobal"
// const DEL_SLASH = process.argv[2] == "del"
// const DEL_SLASH_GLOBAL = process.argv[2] == "delglobal"

// let commands = []

// const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))
// for (const file of slashFiles){
//     const slashcmd = require(`./slash/${file}`)
//     client.slashcommands.set(slashcmd.data.name, slashcmd)
//     if (LOAD_SLASH || LOAD_SLASH_GLOBAL) commands.push(slashcmd.data.toJSON())
// }

// if (LOAD_SLASH) {
//     const rest = new REST({ version: "9" }).setToken(TOKEN)
//     console.log("Deploying slash commands")
//     rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {body: commands})
//     .then(() => {
//         console.log("Successfully loaded")
//         process.exit(0)
//     })
//     .catch((err) => {
//         if (err){
//             console.log(err)
//             process.exit(1)
//         }
//     })
// } else if (LOAD_SLASH_GLOBAL) {
//     const rest = new REST({ version: "9" }).setToken(TOKEN)
//     console.log("Deploying global slash commands")
//     rest.put(Routes.applicationCommands(CLIENT_ID), {body: commands})
//     .then(() => {
//         console.log("Successfully loaded")
//         process.exit(0)
//     })
//     .catch((err) => {
//         if (err){
//             console.log(err)
//             process.exit(1)
//         }
//     })
// } else if (DEL_SLASH) {
//     const rest = new REST({ version: '9' }).setToken(TOKEN);
//     rest.get(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID))
//         .then(data => {
//             const promises = [];
//             for (const command of data) {
//                 const deleteUrl = `${Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)}/${command.id}`;
//                 promises.push(rest.delete(deleteUrl));
//             }
//             console.log("Deleted local slash commands!")
//             return Promise.all(promises);
//         });
// } else if (DEL_SLASH_GLOBAL) {
//     const rest = new REST({ version: '9' }).setToken(TOKEN);
//     rest.get(Routes.applicationCommands(CLIENT_ID))
//         .then(data => {
//             const promises = [];
//             for (const command of data) {
//                 const deleteUrl = `${Routes.applicationCommands(CLIENT_ID)}/${command.id}`;
//                 promises.push(rest.delete(deleteUrl));
//             }
//             console.log("Deleted global slash commands!")
//             return Promise.all(promises);
//         });
// } else {
//     client.on("ready", () => {
//         console.log(`Logged in as ${client.user.tag}`)
//     })
//     client.on("interactionCreate", (interaction) => {
//         async function handleCommand(){
//             if (!interaction.isCommand()) return

//             const slashcmd = client.slashcommands.get(interaction.commandName)
//             if (!slashcmd) interaction.reply("Not a valid slash command")

//             await interaction.deferReply()
//             //await slashcmd.execute({ interaction })
//             await slashcmd.run({ client, interaction })
//         }
//         handleCommand()
//     })
//     client.login(TOKEN)
	
	client.player.on("error", (queue, error) => {
        console.log(`[Error emitted from the queue: ${error.message}`);
    })
	client.player.on("connectionError", (queue, error) => {
        console.log(`Error emitted from the connection: ${error.message}`);
    })
    client.player.on("trackStart", (queue, track) => {
        const currentDate = new Date();
        module.exports.date = currentDate
    })
