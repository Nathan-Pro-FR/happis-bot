const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('neko')
        .setDescription('Affiche une illustration ou une action animée.')
        .addStringOption(option =>
            option.setName('categorie')
                .setDescription('Type d\'image à afficher')
                .setRequired(true)
                .addChoices(
                    { 
                        name: 'Câlin (Hug)', 
                        value: 'hug' 
                    },
                    { 
                        name: 'Caresse (Pat)', 
                        value: 'pat' 
                    },
                    { 
                        name: 'Illustration Neko', 
                        value: 'neko' 
                    },
                    { 
                        name: 'Illustration Kitsune', 
                        value: 'kitsune' 
                    }
                )
        ),

    async execute(interaction) {
        const categorie = interaction.options.getString('categorie');
        await interaction.deferReply();

        try {
            const apiInfo = config.apis.anime.find(api => api.id === 'nekos');
            const response = await fetch(`${apiInfo.url}/${categorie}`);
            const body = await response.json();

            if (!body.results || body.results.length === 0) {
                return interaction.editReply('❌ Impossible d\'obtenir une image pour le moment.');
            }

            const image = body.results[0];

            const nekoEmbed = new EmbedBuilder()
                .setColor(config.color || '#4A4A4A')
                .setTitle(`✨ Catégorie : ${categorie}`)
                .setImage(image.url)
                .setFooter({ text: `HAPPIS Bot • Artiste : ${image.artist_name || 'Inconnu'}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [nekoEmbed] });

        } catch (error) {
            console.error('[ERREUR NEKOS]', error);
            await interaction.editReply('❌ Une erreur est survenue avec l\'API Nekos.best.');
        }
    },
};
