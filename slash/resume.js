const { SlashCommandBuilder } = require("@discordjs/builders")
const { useQueue } = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resumes the music"),
    run: async ({ client, interaction }) => {
        const queue = useQueue(interaction.guild.id)
        if (queue.isEmpty() && !queue.isPlaying()) {
            return await interaction.editReply("There are no songs in the queue.")
        }

        queue.node.setPaused(!queue.node.isPaused())
        await interaction.editReply("Music has been paused! Use `/pause` to resume the music")
    }
}