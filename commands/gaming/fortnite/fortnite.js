const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fortnite')
        .setDescription('Affiche les statistiques d\'un joueur Fortnite.')
        .addStringOption(option =>
            option.setName('pseudo')
                .setDescription('Le pseudo Epic Games du joueur')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('plateforme')
                .setDescription('La plateforme (par défaut: epic)')
                .addChoices(
                    { name: 'Epic Games', value: 'epic' },
                    { name: 'PlayStation', value: 'psn' },
                    { name: 'Xbox', value: 'xbl' }
                )
        ),

    async execute(interaction) {
        const pseudo = interaction.options.getString('pseudo');
        const plateforme = interaction.options.getString('plateforme') || 'epic';
        await interaction.deferReply();

        const apiKey = process.env.FORTNITE_API_KEY;
        if (!apiKey) {
            return interaction.editReply('❌ La clé d\'API Fortnite n\'est pas configurée dans le fichier `.env`.');
        }

        try {
            // Récupération de l'URL de base depuis le config.json
            const apiInfo = config.apis.gaming.find(api => api.id === 'fortnite');
            const url = `${apiInfo.url}/stats/br/v2?name=${encodeURIComponent(pseudo)}&accountType=${plateforme}`;

            const response = await fetch(url, {
                headers: { 'Authorization': apiKey }
            });

            const body = await response.json();

            if (body.status === 404) {
                return interaction.editReply(`❌ Le joueur **${pseudo}** est introuvable ou son profil est privé.`);
            }

            if (body.status !== 200 || !body.data) {
                return interaction.editReply('❌ Une erreur est survenue lors de la récupération des données.');
            }

            const stats = body.data.stats.all.overall;
            const account = body.data.account;
            const battlePass = body.data.battlePass;

            const fnEmbed = new EmbedBuilder()
                .setColor(config.color || '#4A4A4A')
                .setTitle(`🎮 Statistiques Fortnite de ${account.name}`)
                .addFields(
                    { name: '⭐ Niveau du Pass', value: `${battlePass.level}`, inline: true },
                    { name: '🏆 Victoires', value: `${stats.wins}`, inline: true },
                    { name: '📉 Ratio K/D', value: `${stats.kd.toFixed(2)}`, inline: true },
                    { name: '💀 Éliminations', value: `${stats.kills}`, inline: true },
                    { name: '🕹️ Matchs joués', value: `${stats.matches}`, inline: true },
                    { name: '⏱️ Temps de jeu', value: `${Math.round(stats.minutesPlayed / 60)}h`, inline: true }
                )
                .setFooter({ text: 'HAPPIS Bot • Données via Fortnite-API' })
                .setTimestamp();

            await interaction.editReply({ embeds: [fnEmbed] });

        } catch (error) {
            console.error('[ERREUR FORTNITE]', error);
            await interaction.editReply('❌ Impossible de contacter l\'API Fortnite pour le moment.');
        }
    },
};
