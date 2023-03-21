const { SlashCommandBuilder } = require("@discordjs/builders")
const { useQueue } = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Shuffles the queue"),
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id)
        if (queue.isEmpty()) {
            return await interaction.editReply("There are no songs in the queue.")
        }

        queue.tracks.shuffle()
        await interaction.editReply(`The queue of ${queue.getSize()} songs have been shuffled!`)
    }
}