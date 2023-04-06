const { SlashCommandBuilder } = require("@discordjs/builders")
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sb")
        .setDescription("Soundboard")
        .addSubcommand(subcommand =>
            subcommand
                .setName("1play")
                .setDescription("Gives the soundboard")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("add")
                .setDescription("Add sound to soundboard")
                .addAttachmentOption(option =>
                    option.setName("sound")
                        .setDescription("Sound to add to the soundboard")
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        if (interaction.options._subcommand == "1play") {
            
            var files = fs.readdirSync(process.cwd() + '/clips/');
            console.log(files)
            console.log(interaction.options._subcommand)

            const length = files.length
            const rowCount = Math.floor(length/5)
            const mod = length % 5
            let id = 0
            //console.log(clips[1])
            let rows = []

            for (let index = 0; index < rowCount; index++) {
                let row = new ActionRowBuilder()
                for (let i = 0; i < 5; i++) {
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(id.toString())
                            .setLabel(files[id].split('.')[0])
                            .setStyle(ButtonStyle.Primary),
                    )
                    id = id + 1
                }
                rows.push(row)
            }
            if (mod != 0) {
                for (let index = 0; index < 1; index++) {
                    let row = new ActionRowBuilder()
                    for (let i = 0; i < mod; i++) {
                        row.addComponents(
                            new ButtonBuilder()
                                .setCustomId(id.toString())
                                .setLabel(files[id].split('.')[0])
                                .setStyle(ButtonStyle.Primary),
                        )
                        id = id + 1
                    }
                    if (rows.length < 5) {
                        rows.push(row)
                    }
                    
                }
            }
            await interaction.editReply({ components: rows })
        }

        if (interaction.options._subcommand == "add") {
            const url = interaction.options._hoistedOptions[0].attachment.url
            const name = interaction.options._hoistedOptions[0].attachment.name
            const size = interaction.options._hoistedOptions[0].attachment.size
            const type = interaction.options._hoistedOptions[0].attachment.contentType.split('/')[0]
            console.log(interaction.options._hoistedOptions)
            if (type != "audio") {
                await interaction.editReply("This is not a valid file!")
            } else if (size > 2000000) {
                await interaction.editReply("File is too large!")
            } else {
                const request = require('request')

                request
                    .get(url)
                    .on('error', function(err) {
                        console.log(err)
                    })
                .pipe(fs.createWriteStream(process.cwd() + '/clips/' + name));
                await interaction.editReply("Adding sound to the soundboard")
            }
        }
    }
}