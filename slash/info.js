const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { useQueue } = require("discord-player")

//const index = require('../index')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Displays info about the currently playing song"),
    async execute(interaction) {
        
        // if (!queue.isPlaying()) {
        //     return await interaction.editReply("There are no songs playing.")
        // } else {
        //     return await interaction.editReply("There are no songs playing.")
        // }

        const queue = useQueue(interaction.guild.id)
        const currentTrack = queue.currentTrack

        console.log(currentTrack)

        await interaction.editReply("info")

        //let bar
        // bar = queue.createProgressBar({
        //     queue: false,
        //     length: 18
        // })
    
        //console.log(queue.currentTrack)

        // console.log('streamtime' + queue.streamTime)
        // console.log('totalTime' + queue.totalTime)
        // console.log('getPlayerTimestamp current: ' + queue.getPlayerTimestamp().current + ' end: ' + queue.getPlayerTimestamp().end + ' progress: ' + queue.getPlayerTimestamp().progress)

        // const currentTime = queue.getPlayerTimestamp().current
        // const endTime = queue.getPlayerTimestamp().end

        // let ctSplit = currentTime.split(':')

        // let h = 0
        // let m = 0
        // let s = 0

        // switch (ctSplit.length) {
        //     case 3:
        //         h = ctSplit[0]
        //         m = ctSplit[1]
        //         s = ctSplit[2]
        //         break;
        //     case 2:
        //         m = ctSplit[0]
        //         s = ctSplit[1]
        //         break;
        // }

        // let etSplit = endTime.split(':')

        // let eh = 0
        // let em = 0
        // let es = 0

        // switch (etSplit.length) {
        //     case 3:
        //         eh = etSplit[0]
        //         em = etSplit[1]
        //         es = etSplit[2]
        //         break;
        //     case 2:
        //         em = etSplit[0]
        //         es = etSplit[1]
        //         break;
        // }

        // m = (m.length<2) ? '0' + m : m;
        // //s = (s<10) ? '0' + s : s;

        // em = (em.length<2) ? '0' + em : em;
        // //es = (es<10) ? '0' + es : es;

        // var playTime =  h + ':' + m + ':' + s
        // var dTime =  eh + ':' + em + ':' + es

        // const song = queue.current
        // await interaction.editReply({
        //     embeds: [new EmbedBuilder()
        //     .setThumbnail(song.thumbnail)
        //     .setDescription(`Currently Playing [${song.title}](${song.url})\n\n` + bar + " ᲼ " + playTime + " / " + dTime)]
        // })
    }
}