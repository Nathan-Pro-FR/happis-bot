const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('manga')
        .setDescription('Recherche un manga sur MangaDex.')
        .addStringOption(option =>
            option.setName('titre')
                .setDescription('Le nom du manga')
                .setRequired(true)
        ),

    async execute(interaction) {
        const titre = interaction.options.getString('titre');
        await interaction.deferReply();

        try {
            const apiInfo = config.apis.anime.find(api => api.id === 'mangadex');
            
            // 1. Recherche du manga pour obtenir son ID et ses données
            const searchUrl = `${apiInfo.url}/manga?title=${encodeURIComponent(titre)}&limit=1&includes[]=cover_art`;
            const response = await fetch(searchUrl);
            const body = await response.json();

            if (!body.data || body.data.length === 0) {
                return interaction.editReply(`❌ Aucun manga trouvé pour : **${titre}**.`);
            }

            const manga = body.data[0];
            const attributes = manga.attributes;
            
            // Récupération du titre et de la description (en priorité en anglais ou français)
            const title = attributes.title.fr || attributes.title.en || Object.values(attributes.title)[0];
            let description = attributes.description.fr || attributes.description.en || Object.values(attributes.description)[0] || 'Aucune description disponible.';
            if (description.length > 350) description = description.substring(0, 350) + '...';

            // 2. Construction de l'URL de l'image de couverture
            const coverRel = manga.relationships.find(rel => rel.type === 'cover_art');
            const coverFileName = coverRel ? coverRel.attributes.fileName : null;
            const coverUrl = coverFileName 
                ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}`
                : null;

            const mangaEmbed = new EmbedBuilder()
                .setColor(config.color || '#4A4A4A')
                .setTitle(title)
                .setURL(`https://mangadex.org/title/${manga.id}`)
                .setDescription(description)
                .addFields(
                    { name: '📅 Année', value: attributes.year ? `${attributes.year}` : 'Inconnue', inline: true },
                    { name: '📈 Statut', value: attributes.status === 'ongoing' ? '🟢 En cours' : '🔴 Terminé', inline: true },
                    { name: '🔞 Contenu', value: attributes.contentRating.toUpperCase(), inline: true }
                )
                .setFooter({ text: 'HAPPIS Bot • Données via MangaDex API' })
                .setTimestamp();

            if (coverUrl) mangaEmbed.setThumbnail(coverUrl);

            await interaction.editReply({ embeds: [mangaEmbed] });

        } catch (error) {
            console.error('[ERREUR MANGADEX]', error);
            await interaction.editReply(`❌ Impossible de récupérer les données du manga **${titre}**.`);
        }
    },
};
