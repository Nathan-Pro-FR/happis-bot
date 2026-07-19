const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apex')
        .setDescription('Affiche le profil et le rang d\'un joueur Apex Legends.')
        .addStringOption(option =>
            option.setName('pseudo')
                .setDescription('Le pseudo du joueur')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('plateforme')
                .setDescription('La plateforme du joueur')
                .setRequired(true)
                .addChoices(
                    { name: 'PC (Origin/Steam)', value: 'PC' },
                    { name: 'PlayStation', value: 'PS4' },
                    { name: 'Xbox', value: 'X1' }
                )
        ),

    async execute(interaction) {
        const pseudo = interaction.options.getString('pseudo');
        const plateforme = interaction.options.getString('plateforme');
        await interaction.deferReply();

        const apiKey = process.env.APEX_API_KEY;
        if (!apiKey) {
            return interaction.editReply('❌ La clé d\'API Apex Legends n\'est pas configurée dans le fichier `.env`.');
        }

        try {
            const apiInfo = config.apis.gaming.find(api => api.id === 'apex');
            const url = `${apiInfo.url}/bridge?auth=${apiKey}&player=${encodeURIComponent(pseudo)}&platform=${plateforme}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.Error) {
                return interaction.editReply(`❌ Erreur : ${data.Error}`);
            }

            const global = data.global;
            const classement = global.rank;

            const apexEmbed = new EmbedBuilder()
                .setColor(config.color || '#4A4A4A')
                .setTitle(`🧬 Profil Apex Legends : ${global.name}`)
                .setThumbnail(classement.rankImg)
                .addFields(
                    { name: '🔺 Niveau', value: `${global.level} (BP: ${global.battlepass.level})`, inline: true },
                    { name: '🏆 Rang', value: `${classement.rankName} ${classement.rankDiv}`, inline: true },
                    { name: '✨ Points de Score', value: `${classement.rankScore} RP`, inline: true },
                    { name: '👤 Légende active', value: `${data.realtime.selectedLegend}`, inline: true },
                    { name: '🟢 Statut', value: data.realtime.isOnline ? 'En ligne 🎮' : 'Hors ligne 🛑', inline: true }
                )
                .setFooter({ text: 'HAPPIS Bot • Données via Apex Legends Status API' })
                .setTimestamp();

            await interaction.editReply({ embeds: [apexEmbed] });

        } catch (error) {
            console.error('[ERREUR APEX]', error);
            await interaction.editReply('❌ Impossible de récupérer les statistiques du joueur Apex.');
        }
    },
};
