const { SlashCommandBuilder } = require("@discordjs/builders")

const { useMasterPlayer } = require("discord-player");

const player = useMasterPlayer();


const playdl = require("play-dl")

const COOKIE = process.env.COOKIE

playdl.setToken({
    youtube : {
        cookie : COOKIE
    }
})

player.events.on('playerStart', (queue, track) => {  
    queue.metadata.channel.send(`Started playing **${track.title}**!`);
})

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play songs from youtube")
        .addStringOption((option) => option.setName("song").setDescription("the url or search keywords").setRequired(true)),
    run: async ({ client, interaction }) => {
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply('You are not connected to a voice channel!'); // make sure we have a voice channel
        const query = interaction.options.getString('song', true); // we need input/query to play

        // let's defer the interaction as things can take time to process
        //await interaction.deferReply();

        try {
            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    metadata: {
                        channel: interaction.channel,
                        client: interaction.guild.members.me,
                        requestedBy: interaction.user
                    },
                    leaveOnEmptyCooldown: 300000,
                    leaveOnEmpty: true,
                    leaveOnEnd: false,
                    volume: 10
                }
            });
    
            return interaction.followUp(`**${track.title}** enqueued!`);
        } catch (e) {
            // let's return error if something failed
            return interaction.followUp(`Something went wrong: ${e}`);
        }
        
    }
}