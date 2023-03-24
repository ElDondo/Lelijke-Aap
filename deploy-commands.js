const { REST, Routes } = require('discord.js')
const dotenv = require("dotenv")
const fs = require('node:fs')
const path = require('node:path')

dotenv.config()
const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, 'slash')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./slash/${file}`)
	commands.push(command.data.toJSON())
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`)

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
			{ body: commands }
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`)
		process.exit(0)
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error)
	}
})()

// let commands = []

// const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))
// for (const file of slashFiles){
//     const slashcmd = require(`./slash/${file}`)
//     client.slashcommands.set(slashcmd.data.name, slashcmd)
//     commands.push(slashcmd.data.toJSON())
// }

//const rest = new REST({ version: "9" }).setToken(TOKEN)
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
