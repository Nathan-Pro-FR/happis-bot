const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apis')
        .setDescription('Affiche la liste des APIs intégrées au bot classées par catégories.'),

    async execute(interaction) {
        // 1. Création de l'Embed principal avec la charte graphique de HAPPIS Bot
        const apisEmbed = new EmbedBuilder()
            .setColor(config.color || '#4A4A4A')
            .setTitle('📂 Catalogue des APIs de HAPPIS Bot')
            .setDescription('Voici la liste des services externes connectés au bot, classés par catégories d\'utilisation.')
            .setTimestamp()
            .setFooter({ text: 'HAPPIS Bot • Système de surveillance' });

        const categories = config.apis;

        // 2. Dictionnaire pour afficher de beaux titres et émojis pour chaque catégorie
        const categoryLabels = {
            gaming: '🎮 Catégorie : Gaming',
            anime: '🌸 Catégorie : Anime & Culture',
            utility: '🛠️ Catégorie : Utility / Outils'
        };

        // 3. Boucle dynamique sur chaque catégorie présente dans le config.json
        for (const [key, list] of Object.entries(categories)) {
            if (!Array.isArray(list) || list.length === 0) continue;

            // Construction du texte pour la catégorie en cours
            let categoryText = '';
            list.forEach(api => {
                categoryText += `• **${api.name}** (\`${api.id}\`)\n*${api.description}*\n\n`;
            });

            // Récupération du titre propre ou fallback sur la clé brute si non définie
            const fieldName = categoryLabels[key] || `📂 Catégorie : ${key.toUpperCase()}`;

            // Ajout de la catégorie sous forme de champ dans l'Embed
            apisEmbed.addFields({
                name: fieldName,
                value: categoryText || 'Aucun service enregistré.',
                inline: false
            });
        }

        // 4. Envoi de la réponse sur Discord
        await interaction.reply({ embeds: [apisEmbed] });
    },
};
