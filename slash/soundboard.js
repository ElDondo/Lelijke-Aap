const { SlashCommandBuilder } = require("@discordjs/builders")
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sb")
        .setDescription("Soundboard")
        .addSubcommand(subcommand =>
            subcommand
                .setName("play")
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
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName("remove")
                .setDescription("Removes the sound by name")
                .addStringOption(option => 
                    option.setName("sound")
                        .setDescription("Remove sound from soundboard")
                        .setRequired(true)
                )
        ),
        async execute(interaction, prevNext, client, sbChannelId, sbMsgId, currentPage) {
            if (prevNext) {
                const pages = getPages()
                const lastRow = pages[prevNext - 1].length - 1
                //console.log(pages[prevNext - 1][lastRow].components[0])
                pages[prevNext - 1][lastRow].components[0].setPlaceholder("Page " + prevNext)
                client.channels.cache.get(sbChannelId).messages.fetch(sbMsgId)
                    .then(message => 
                        message.edit({ components: pages[prevNext - 1] })
                    )
                    .catch(console.error)
                await interaction.deferUpdate()
            } else if (interaction.options._subcommand == "play") {
                const pages = getPages()
                
                await interaction.editReply({ components: pages[0] })
    
            } else if (interaction.options._subcommand == "add") {
                const url = interaction.options._hoistedOptions[0].attachment.url
                const name = interaction.options._hoistedOptions[0].attachment.name
                const size = interaction.options._hoistedOptions[0].attachment.size
                const type = interaction.options._hoistedOptions[0].attachment.contentType.split('/')[0]
                //console.log(interaction.options._hoistedOptions)
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
            } else if (interaction.options._subcommand == "remove") {
                const song = interaction.options.getString('sound')
                const oldPath = process.cwd() + '/clips/' + song + '.mp3'
                const newPath = process.cwd() + '/deleted/' + song + '.mp3'
    
                fs.rename(oldPath, newPath, async function (err) {
                    if (err) {
                        //console.log(err)
                        await interaction.editReply("This sound does not exist!")
                    } else {
                        //console.log('Successfully renamed - AKA moved!')
                        await interaction.editReply("Removed sound from the soundboard")
                    }
                })
            }
        }
    }
    
    function getPages() {
        const files = fs.readdirSync(process.cwd() + '/clips/');
        const length = files.length
        const pageCount = Math.ceil(length / 20)
        //console.log(length)
        //console.log(pageCount)
    
        let left = length
        let currentLeftCount = 0
        let id = 0
        let grouped = []
        let pages = []
    
        const select = new StringSelectMenuBuilder()
        .setCustomId('pageNumber')
        .setPlaceholder('Make a selection!')
        // .addOptions(
        //     new StringSelectMenuOptionBuilder()
        //         .setLabel('Bulbasaur')
        //         .setDescription('The dual-type Grass/Poison Seed Pokémon.')
        //         .setValue('bulbasaur')
        // )
    
        for (let i = 0; i < pageCount; i++) {
            select.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel("Page " + (i + 1).toString())
                    .setValue((i + 1).toString())
            )
        }
    
        let buttons = new ActionRowBuilder()
        buttons.addComponents(
            // new ButtonBuilder()
            //     .setCustomId("998")
            //     .setLabel("previous")
            //     .setStyle(ButtonStyle.Secondary),
            // new ButtonBuilder()
            //     .setCustomId("999")
            //     .setLabel("next")
            //     .setStyle(ButtonStyle.Secondary),
            select,
        )
    
        while ( left != 0) {
            if (left >= 5) {
                currentLeftCount = 5
            } else {
                currentLeftCount = left
            }
            let stack = []
            for (let index = 0; index < currentLeftCount; index++) {
                stack.push(files[id].toString())
                id = id + 1
            }
            left = left - currentLeftCount
            grouped.push(stack)
        }
        id = 0
        let page = []
    
        grouped.forEach(element => {
            let row = new ActionRowBuilder()
            for (let index = 0; index < element.length; index++) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(id.toString())
                        .setLabel(element[index].split('.')[0])
                        .setStyle(ButtonStyle.Primary),
                )
                id = id + 1
            }
            page.push(row)
            if ( page.length == 4) {
                page.push(buttons)
                pages.push(page)
                page = []
            }
        })
        if (page.length != 4 && page.length != 0) {
            page.push(buttons)
            pages.push(page)
        }
        return pages
    }