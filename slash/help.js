const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Help page"),
    run: async ({ client, interaction }) => {
        //const queue = client.player.getQueue(interaction.guildId)

        let reply = new MessageEmbed()
            .setTitle('Discord Music Bot Commands')
            .setThumbnail('https://i.imgur.com/mWShjtU.png')
            .addFields(
                { name: '\u200B', value: '\u200B' },
                { name: '/play [song]', value: 'plays song from url or keywords' },
                { name: '/queue', value: '...' },
                { name: '/pause', value: '...' },
                { name: '/resume', value: '...' },
                { name: '/skip', value: '...' },
                { name: '/skipto [tracknumber]', value: '...' },
                { name: '/info', value: '...' },
                { name: '/shuffle', value: '...' },
                { name: '/filter [filter]', value: 'apply an audio filter (bassboost, earrape, nightcore, 8d)' },
                { name: '/stop', value: 'disconnects the bot and clears the queue' }
            )


        await interaction.editReply({ embeds: [reply] })
    }
}