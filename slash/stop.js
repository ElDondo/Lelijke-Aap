const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stops the bot and clears the queue"),
    async execute(interaction) {
        const { useQueue } = require("discord-player");

        const queue = useQueue(interaction.guild.id);
        queue.delete();
        await interaction.editReply("Bye!")
    }
}
    