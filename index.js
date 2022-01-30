const { SlashCommandStringOption } = require('@discordjs/builders');
const { Client, Intents, Guild, Message, DiscordAPIError } = require('discord.js');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
let dotenv = require('dotenv');

//var config;

var prefix = "!";
var COOKIE = process.env.COOKIE;
let guildQueue;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

const { Player } = require("d-music-player");
const player = new Player(client, {
	leaveOnEmpty: false, // These options are optional.
});

client.player = player;
//const { RepeatMode } = require('discord-music-player');

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	if (message.content.startsWith(`${prefix}test`)) {
		message.channel.send("test");
		return;
	}
	else if (message.content.startsWith(`${prefix}play`)) {
		play(message.content.substring(5), message.guild);
		return;
	}
});

function isValidHttpUrl(string) {
	let url;
	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}
	return url.protocol === "http:" || url.protocol === "https:";
}

function youtube_parser(url) {
	var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
	var match = url.match(regExp);
	return (match && match[7].length == 11) ? match[7] : false;
}


client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;
	const guild = interaction.guild;
	const member = guild.members.cache.get(interaction.member.user.id);
	const voiceChannel = member.voice.channel;
	guildQueue = client.player.getQueue(guild.id);

	if (commandName === 'play') {
		const args = interaction.options.getString('song').toString();

		if (isValidHttpUrl(args)) {
			videoUrl = "https://www.youtube.com/watch?v=" + youtube_parser(args);
		}
		else {
			const filters1 = await ytsr.getFilters(args);
			const filter1 = filters1.get('Type').get('Video');
			const options = { pages: 1 }
			const searchResults = await ytsr(filter1.url, options);
			videoUrl = searchResults.items[0]["url"];
			console.log(videoUrl);
		}

		const songInfo = await ytdl.getInfo(videoUrl, {
			requestOptions: {
				headers: {
					cookie: COOKIE
				}
			}
		});

		try {
			if (!guildQueue) {
				await interaction.reply("Now playing **" + songInfo.videoDetails.title + "**.");
			}
			else {
				await interaction.reply("Adding **" + songInfo.videoDetails.title + "** to the queue.");
			}
		} catch (error) {
			await interaction.reply("Now playing **" + args + "**.");
		}
		play(args, guild, interaction, voiceChannel);
	}
	else if (commandName === 'queue'){
		var queueList = "";
		for (i = 0; i < guildQueue.songs.length; i++){
			var pref = "";
			if (i == 0){
				pref = "(current) ";
			}
			else {
				pref = "(" + i + ") ";
			}
			queueList = queueList + pref + guildQueue.songs[i].name + '\n';
			//console.log(guildQueue.songs[i].name);
			
		}
		await interaction.reply(queueList);
	}
	else if (commandName === 'skip'){
		guildQueue.skip();
		await interaction.reply("Skipped current song!");
	}
	else if (commandName === 'stop'){
		guildQueue.stop();
		await interaction.reply("Stopped playing!");
	}
	else if (commandName === 'progress'){
		await interaction.reply("loading..");

		const interval = setInterval(function () {
			const ProgressBar = guildQueue.createProgressBar();
			//console.log(ProgressBar.prettier);
			interaction.fetchReply()
				.then(reply => reply.edit(ProgressBar.prettier));
		}, 5000);
	}
});

async function play(args, guild, interaction, voiceChannel){
	let queue = client.player.createQueue(guild.id);
	await queue.join(voiceChannel);

	let song = await queue.play(args, COOKIE).catch(_ => {
		if (!guildQueue)
			queue.stop();
	});
};

client.player
	.on('error', (error, queue) =>{
		console.log(`Error: ${error} in ${queue.guild}`);
});

//get local env variables
function getConfig(myCallback){
	try {
		dotenv.config()
	} catch (error) {
		console.log("Could not find .env file.")
	}
	myCallback();
}

function login(){
	COOKIE = process.env.COOKIE;
	client.login(process.env.TOKEN);
};

getConfig(login);