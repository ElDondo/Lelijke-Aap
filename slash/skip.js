const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { useQueue } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skips the bot and clears the queue"),
    run: async ({ client, interaction }) => {
        const queue = useQueue(interaction.guild.id);

        if (!queue) return await interaction.editReply("There are no songs in the queue")

        const currentSong = queue.currentTrack
        console.log(currentSong)

        queue.node.skip()
        await interaction.editReply({
            embeds: [
                new EmbedBuilder().setDescription(`${currentSong.title} has been skipped!`).setThumbnail(currentSong.thumbnail)
            ]
        })
    }
}