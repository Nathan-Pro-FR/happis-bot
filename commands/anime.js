const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setDescription('Recherche un animé et affiche ses informations.')
        .addStringOption(option =>
            option.setName('titre')
                .setDescription('Le nom de l\'animé (ex: Lycoris Recoil, Bleach...)')
                .setRequired(true)
        ),

    async execute(interaction) {
        const titre = interaction.options.getString('titre');

        // Indiquer à Discord que le bot cherche l'information
        await interaction.deferReply();

        try {
            // Récupération de l'URL de base depuis le config.json
            const apiInfo = config.apis.anime.find(api => api.id === 'jikan');
            
            // Construction de l'URL de recherche : /v4/anime?q=titre&limit=1
            const url = `${apiInfo.url}/anime?q=${encodeURIComponent(titre)}&limit=1`;

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Erreur lors de la requête vers Jikan API.');
            }

            const body = await response.json();

            // Si aucun résultat n'est trouvé
            if (!body.data || body.data.length === 0) {
                return interaction.editReply({
                    content: `❌ Aucun animé trouvé pour la recherche : **${titre}**.`
                });
            }

            // On récupère le premier résultat retourné
            const anime = body.data[0];

            // Traduction rapide ou secours pour le statut de diffusion
            let statut = anime.status;
            if (statut === 'Finished Airing') statut = '🔴 Terminé';
            if (statut === 'Currently Airing') statut = '🟢 En cours de diffusion';
            if (statut === 'Not yet aired') statut = '📭 Non encore diffusé';

            // Limiter la taille du synopsis pour éviter de casser l'Embed de Discord (max 4096)
            const synopsis = anime.synopsis 
                ? (anime.synopsis.length > 350 ? anime.synopsis.substring(0, 350) + '...' : anime.synopsis)
                : 'Aucun synopsis disponible.';

            // Création de l'Embed (Charte graphique HAPPIS Bot #4A4A4A)
            const animeEmbed = new EmbedBuilder()
                .setColor(config.color || '#4A4A4A')
                .setTitle(anime.title_english || anime.title)
                .setURL(anime.url)
                .setDescription(synopsis)
                .setThumbnail(anime.images.jpg.image_url)
                .addFields(
                    { 
                        name: '⭐ Note', 
                        value: anime.score ? `${anime.score}/10` : 'N/A', 
                        inline: true 
                    },
                    { 
                        name: '🎬 Épisodes', 
                        value: anime.episodes ? `${anime.episodes}` : 'Inconnu', 
                        inline: true 
                    },
                    { 
                        name: '📅 Statut', 
                        value: statut, 
                        inline: true 
                    },
                    { 
                        name: '🏷️ Genres', 
                        value: anime.genres.map(g => g.name).join(', ') || 'Aucun genre spécifié', 
                        inline: false 
                    }
                )
                .setFooter({ text: 'HAPPIS Bot • Données via Jikan API' })
                .setTimestamp();

            // Envoi de la réponse
            await interaction.editReply({ embeds: [animeEmbed] });

        } catch (error) {
            console.error(`[ERREUR API] Impossible de récupérer l'animé ${titre} :`, error);
            await interaction.editReply({
                content: `❌ Une erreur est survenue lors de la recherche de l'animé **${titre}**. Réessayez plus tard.`
            });
        }
    },
};
