const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { useQueue } = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Displays the current song queue")
        .addNumberOption((option) => option.setName("page").setDescription("Page number of the queue").setMinValue(1)),

    async execute(interaction) {
        const queue = useQueue(interaction.guild.id)
        const tracks = queue.tracks.toArray()
        const size = queue.getSize()

        if (queue.isEmpty() && !queue.isPlaying()) {
            return await interaction.editReply("There are no songs in the queue.")
        }
        let totalPages = Math.ceil(size / 10)
        const page = (interaction.options.getNumber("page") || 1) - 1

        if (page > totalPages){
            return await interaction.editReply(`Invalid Page. There are only a total of ${totalPages} pages.`)
        }

        const queueString = tracks.slice(page * 10, page * 10 + 10).map((song, i) => {
            return `**${page *10 + i +1}.** \`[${song.duration}]\` ${song.title} -- <@${song.requestedBy}>`
        }).join("\n")

        const currentSong = queue.currentTrack
        if (totalPages == 0){
            totalPages = 1
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setDescription(`**Currently Playing**\n` + 
                (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} -- <@${currentSong.requestedBy}>` : "None") + 
                `\n\n**Queue**\n${queueString}`
                )
                .setFooter({
                    text: `Page ${page + 1} of ${totalPages}`
                })
                .setThumbnail(currentSong.setThumbnail)
            ]
        })
    }
}