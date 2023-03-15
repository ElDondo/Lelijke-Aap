const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

let list = ['earrape', 'bassboost', 'nightcore', '8D']
let filters = []

module.exports = {
    data: new SlashCommandBuilder()
        .setName("filter")
        .setDescription("Applies an audio filter (bassboost, earrape, nightcore, 8D, off)")
        .addStringOption((option) => option.setName("filter").setDescription("the filter name").setRequired(true))
        .addStringOption((option) => option.setName("filter2").setDescription("the filter name").setRequired(false))
        .addStringOption((option) => option.setName("filter3").setDescription("the filter name").setRequired(false)),
    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId)

        if (!queue) return await interaction.editReply("There are no songs in the queue")

        filters.push(interaction.options.getString("filter"))
        if ((interaction.options.getString("filter2")) != null) {
            filters.push((interaction.options.getString("filter2")))
        }
        if ((interaction.options.getString("filter3")) != null) {
            filters.push((interaction.options.getString("filter3")))
        }

        let available = true
        let unavailable = ""
        filters.forEach(element => {
            if (!list.includes(element.toString())) {
                available = false
                unavailable = element.toString()
            }
        });

        console.log(available.toString())
        if (available) {
            if (filters.length == 1) {
                if (filters[0] == "off") {
                    console.log('removing filters...')
                    await queue.setFilters({
                        earrape: false,
                        bassboost: false,
                        nightcore: false,
                        '8D': false
                    }).then(
                        createEmbed()
                    )
                } else {
                    await queue.setFilters({
                        [filters[0]]: true,
                    }).then(
                        createEmbed()
                    )
                }
            }
            if (filters.length == 2) {
                await queue.setFilters({
                    [filters[0]]: true,
                    [filters[1]]: true
                }).then(
                    createEmbed()
                )
            }
            if (filters.length == 3) {
                await queue.setFilters({
                    [filters[0]]: true,
                    [filters[1]]: true,
                    [filters[2]]: true
                }).then(
                    createEmbed()
                )
            }
        } else {
            if (unavailable == "off") {
                console.log('removing filters...')
                    await queue.setFilters({
                        earrape: false,
                        bassboost: false,
                        nightcore: false,
                        '8D': false
                    }).then(
                        createEmbed()
                    )
            } else {
                await interaction.editReply('Filter does not exist!')
            }
        }

        async function createEmbed() {
            const embed = new MessageEmbed()
                .setTitle('Active audio filters')
                .addFields(
                    { name: 'earrape', value: queue.getFiltersEnabled().includes('earrape').toString() },
                    { name: 'bassboost', value: queue.getFiltersEnabled().includes('bassboost').toString() },
                    { name: 'nightcore', value: queue.getFiltersEnabled().includes('nightcore').toString() },
                    { name: '8D', value: queue.getFiltersEnabled().includes('8D').toString() }
                )
            filters = []
            available = true
            await interaction.editReply({ embeds: [embed] })
        }  
    }
}