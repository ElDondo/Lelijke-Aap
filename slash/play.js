const { SlashCommandBuilder } = require("@discordjs/builders")
//const { useMasterPlayer } = require("discord-player");
const { EmbedBuilder } = require("discord.js")

//const player = useMasterPlayer();

const playdl = require("play-dl")

const COOKIE = process.env.COOKIE

playdl.setToken({
    youtube : {
        cookie : COOKIE
    }
})

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play songs from youtube")
        .addStringOption((option) => option 
        .setName("song")
        .setDescription("the url or search keywords")
        .setRequired(true)
        .setAutocomplete(true)),
    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply('You are not connected to a voice channel!'); // make sure we have a voice channel
        const query = interaction.options.getString('song', true); // we need input/query to play

        // let's defer the interaction as things can take time to process
        //await interaction.deferReply();

        try {
            //const { track } = await player.play(channel, query, {
            const { track } = await interaction.client.player.play(channel, query, {
                nodeOptions: {
                    metadata: {
                        channel: interaction.channel,
                        client: interaction.guild.members.me,
                        requestedBy: interaction.user.id
                    },
                    leaveOnEmptyCooldown: 300000,
                    leaveOnEmpty: true,
                    leaveOnEnd: false,
                    volume: 10
                }
            });
            track.requestedBy = interaction.user.id

            return interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`**[${track.title}](${track.url})** has been added to the Queue \n\n\n Duration: ${track.duration}`)
                    .setThumbnail(track.thumbnail)
                    //.setFooter({ text: `Duration: ${track.duration}` })
                ]
            });
        } catch (e) {
            // let's return error if something failed
            return interaction.followUp(`Something went wrong: ${e}`);
        }
        
    },
    async autocomplete(interaction) {
        //const player = useMasterPlayer();
        const query = interaction.options.getString('song', true);
        const results = await interaction.client.player.search(query);
        //console.log(results)
     
        //Returns a list of songs with their title
        return interaction.respond(
            results.tracks.slice(0, 10).map((t) => ({
                name: t.title,
                value: t.url,
            }))
        );
    }
}