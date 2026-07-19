const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fortnite-shop')
        .setDescription('Affiche la boutique Fortnite du jour.'),

    async execute(interaction) {
        await interaction.deferReply();
        const apiKey = process.env.FORTNITE_API_KEY;
        if (!apiKey) return interaction.editReply('❌ Clé d\'API Fortnite manquante dans le `.env`.');

        const apiInfo = config.apis.gaming.find(api => api.id === 'fortnite');
        const baseUrl = apiInfo ? apiInfo.url : 'https://fortnite-api.com';

        try {
            const response = await fetch(`${baseUrl}/v2/shop/br/combined?language=fr`, {
                headers: { 'Authorization': apiKey }
            });
            const body = await response.json();

            if (body.status !== 200 || !body.data) return interaction.editReply('❌ Boutique indisponible.');

            const items = body.data.featured?.entries || body.data.daily?.entries || [];
            if (items.length === 0) return interaction.editReply('🛍️ La boutique est vide.');

            const embed = new EmbedBuilder()
                .setColor(config.color || '#4A4A4A')
                .setTitle('🛍️ Boutique Fortnite du Jour')
                .setTimestamp();

            items.slice(0, 10).forEach(entry => {
                const name = entry.items[0]?.name || 'Objet Inconnu';
                embed.addFields({ name: name, value: `💰 ${entry.finalPrice} V-Bucks`, inline: true });
            });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Une erreur est survenue.');
        }
    }
};
