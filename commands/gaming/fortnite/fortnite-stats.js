const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fortnite-stats')
        .setDescription('Affiche les statistiques d\'un joueur Fortnite.')
        .addStringOption(option =>
            option.setName('pseudo').setDescription('Le pseudo Epic Games du joueur').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('plateforme').setDescription('La plateforme (par défaut: epic)')
                .addChoices(
                    { name: 'Epic Games', value: 'epic' },
                    { name: 'PlayStation', value: 'psn' },
                    { name: 'Xbox', value: 'xbl' }
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const apiKey = process.env.FORTNITE_API_KEY;
        if (!apiKey) return interaction.editReply('❌ Clé d\'API Fortnite manquante dans le `.env`.');

        const pseudo = interaction.options.getString('pseudo');
        const plateforme = interaction.options.getString('plateforme') || 'epic';
        const apiInfo = config.apis.gaming.find(api => api.id === 'fortnite');
        const baseUrl = apiInfo ? apiInfo.url : 'https://fortnite-api.com';

        try {
            const response = await fetch(`${baseUrl}/stats/br/v2?name=${encodeURIComponent(pseudo)}&accountType=${plateforme}`, {
                headers: { 'Authorization': apiKey }
            });
            const body = await response.json();

            if (body.status === 404) return interaction.editReply(`❌ Le joueur **${pseudo}** est introuvable.`);
            if (body.status !== 200 || !body.data) return interaction.editReply('❌ Erreur de récupération.');

            const stats = body.data.stats.all.overall;
            const embed = new EmbedBuilder()
                .setColor(config.color || '#4A4A4A')
                .setTitle(`🎮 Statistiques de ${body.data.account.name}`)
                .addFields(
                    { name: '⭐ Niveau du Pass', value: `${body.data.battlePass.level}`, inline: true },
                        { name: '🏆 Victoires', value: `${stats.wins}`, inline: true },
                        { name: '📉 Ratio K/D', value: `${stats.kd.toFixed(2)}`, inline: true },
                        { name: '💀 Éliminations', value: `${stats.kills}`, inline: true },
                        { name: '🕹️ Matchs', value: `${stats.matches}`, inline: true },
                        { name: '⏱️ Temps de jeu', value: `${Math.round(stats.minutesPlayed / 60)}h`, inline: true }
                )
                .setFooter({ text: 'HAPPIS Bot' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Une erreur est survenue.');
        }
    }
};
