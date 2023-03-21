const { SlashCommandBuilder } = require("@discordjs/builders")
const { useQueue } = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skipto")
        .setDescription("Skips to a certain track #")
        .addNumberOption((option) => option.setName("tracknumber").setDescription("The track to skip to").setMinValue(1).setRequired(true)),
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id)

        if (queue.isEmpty() && !queue.isPlaying()) {
            return await interaction.editReply("There are no songs in the queue.")
        }

        const trackNum = interaction.options.getNumber("tracknumber")
        if (trackNum > queue.getSize()){
            return await interaction.editReply("Invalid track number")
        }
        const tracks = queue.tracks.toArray()
        console.log(tracks[trackNum-1].title)
        await interaction.editReply(`Skipped ahead to track number ${trackNum} - ${tracks[trackNum-1].title}`)
        queue.node.skipTo(trackNum - 1)
    }
}
    