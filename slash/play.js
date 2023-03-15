const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const { QueryTpe, QueryType } = require("discord-player")

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
        .addStringOption((option) => option.setName("song").setDescription("the url or search keywords").setRequired(true)),
    run: async ({ client, interaction }) => {
        if (!interaction.member.voice.channel)
            return interaction.editReply("You need to be in a Voicechannel to use this command")

        const queue = await client.player.createQueue(interaction.guild, {
			leaveOnEnd: false,
			leaveOnEmpty: true,
			spotifyBridge: false,

			async onBeforeCreateStream(track, source, _queue) {
            // only trap youtube source
				if (source === "youtube") {
					// track here would be youtube track
					return (await playdl.stream(track.url, { discordPlayerCompatibility : true })).stream
					// we must return readable stream or void (returning void means telling discord-player to look for default extractor)
				}
			}
		})
        if (!queue.connection) await queue.connect(interaction.member.voice.channel)

        let embed = new MessageEmbed()

        let url = interaction.options.getString("song")

        if (url.includes("&list") || url.includes("?list")) {
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            })
            if (result.tracks.length === 0) {
                return interaction.editReply("No results")
            }

            const playlist = result.playlist
            await queue.addTracks(result.tracks)
            embed
                .setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** has been added to the Queue`)
                .setThumbnail(playlist.thumbnail)
        }
        else {
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })
            if (result.tracks.length === 0) {
                return interaction.editReply("No results")
            }

            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}` })
        }

        if (!queue.playing) {
            await queue.play()
        }
        await interaction.editReply({
            embeds: [embed]
        })
    }
}