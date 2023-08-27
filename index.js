const { Client, Collection, Events, GatewayIntentBits, CommandInteractionOptionResolver, ApplicationCommandOptionType } = require("discord.js")
const dotenv = require("dotenv")
//const { REST } = require("@discordjs/rest")
//const { Routes } = require("discord-api-types/v9")
const fs = require("node:fs")
const path = require("node:path")
const { Player, QueryType } = require("discord-player")

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
const COOKIE = process.env.COOKIE
//client.slashcommands = new Discordjs.Collection()
client.commands = new Collection()
client.player = new Player(client, {
    ytdlOptions: {
        requestOptions: {
            headers: {
                cookie: COOKIE
            }
        }
    }
})

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

	
client.player.on("error", (queue, error) => {
    console.log(`[Error emitted from the queue: ${error.message}`);
})
client.player.on("connectionError", (queue, error) => {
    console.log(`Error emitted from the connection: ${error.message}`);
})
// client.player.on("trackStart", (queue, track) => {
//     const currentDate = new Date();
//     module.exports.date = currentDate
// })
client.player.events.on('playerStart', (queue, track) => {  
    try {
        queue.metadata.channel.send(`Started playing **${track.title}**!`);
    } catch (error) {
        //console.log("no title found")
    }
    
})

// const sbPlay = async(channel, filePath) => {
    
//     await client.player.play( channel, filePath, {
//         nodeOptions: {
//             leaveOnEmptyCooldown: 300000,
//             leaveOnEmpty: true,
//             leaveOnEnd: false
//         },
//         searchEngine: QueryType.FILE
//     })
// }

const clipPath = process.cwd() + '/clips/'

client.on(Events.InteractionCreate, interaction => {
    
    if (interaction.isButton()){
        const command = interaction.client.commands.get("sb")
        const channelId = interaction.message.channelId
        const msgId = interaction.message.id
        const page = interaction.message.components[0].components[0].data.custom_id / 20
        switch(interaction.customId) {
            case "999": 
                command.execute(interaction, "next", client, channelId, msgId, page)
                break
            case "998":
                command.execute(interaction, "prev", client, channelId, msgId, page)
                break
            default:
                interaction.deferUpdate()
                const { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice')
                
                const files = fs.readdirSync(clipPath)
                const filePath = clipPath + files[interaction.customId]
                const resource = createAudioResource(filePath)
                //console.log(interaction.member.voice.channel.id)
                let connection
                if (interaction.member.voice.channel.id) {
                    connection = joinVoiceChannel({
                        channelId: interaction.member.voice.channel.id,
                        guildId: interaction.member.voice.channel.guild.id,
                        adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator,
                    });
                }

                let players = []
                for (let index = 0; index < 5; index++) {
                    const player = createAudioPlayer({
                        behaviors: {
                            noSubscriber: NoSubscriberBehavior.Play,
                        }
                    })
                    players.push(player)
                }
                //console.log(players.length)

                connection.subscribe(players[0])

                players[0].play(resource)
                
    
                

                // players[0].on(AudioPlayerStatus.Playing, () => {
                //     console.log('The audio player has started playing!');
                //     console.log(players[0].state.status)
                // });
                players[0].on(AudioPlayerStatus.Idle, () => {
                    players[0].stop()
                    console.log("stopping audio player")
                    //console.log('The audio player is idle');
                    //console.log(players[0].state.status)
                });
        } 
    } else if (interaction.isStringSelectMenu()) {
        const command = interaction.client.commands.get("sb")
        const channelId = interaction.message.channelId
        const msgId = interaction.message.id
        const page = interaction.message.components[0].components[0].data.custom_id / 20
        //console.log(interaction.customId + " " + interaction.values)
        command.execute(interaction, interaction.values, client, channelId, msgId, page)
    } else {
        return
    }
    
    //StringSelectMenuInteraction

            


            // const files = fs.readdirSync(clipPath)
            // const channel = interaction.member.voice.channel
            // const filePath = clipPath + files[interaction.customId]
            // sbPlay(channel, filePath)
            // interaction.deferUpdate()
    

    //console.log(interaction)
    // if (interaction.customId == "999") {
    //     command.execute(interaction, "next", client, channelId, msgId, page)
    // } else if (interaction.customId == "998") {
    //     command.execute(interaction, "prev", client, channelId, msgId, page)
    // } else {
    //     const files = fs.readdirSync(clipPath)
    //     const channel = interaction.member.voice.channel
    //     const filePath = clipPath + files[interaction.customId]
    //     //console.log(interaction.customId)
    //     sbPlay(channel, filePath)
    //     interaction.deferUpdate()
    // }
})