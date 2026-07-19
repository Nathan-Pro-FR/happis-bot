const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fortnite-map')
        .setDescription('Affiche la carte actuelle de l\'île.'),

    async execute(interaction) {
        await interaction.deferReply();
        const apiKey = process.env.FORTNITE_API_KEY;
        if (!apiKey) return interaction.editReply('❌ Clé d\'API Fortnite manquante dans le `.env`.');

        const apiInfo = config.apis.gaming.find(api => api.id === 'fortnite');
        const baseUrl = apiInfo ? apiInfo.url : 'https://fortnite-api.com';

        try {
            const response = await fetch(`${baseUrl}/v1/map?language=fr`, {
                headers: { 'Authorization': apiKey }
            });
            const body = await response.json();

            if (body.status !== 200 || !body.data?.images?.blank) return interaction.editReply('❌ Carte indisponible.');

            const embed = new EmbedBuilder()
                .setColor(config.color || '#4A4A4A')
                .setTitle('🗺️ Carte de la Saison Actuelle')
                .setImage(body.data.images.blank)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Une erreur est survenue.');
        }
    }
};
