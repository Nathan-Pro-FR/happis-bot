const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meteo')
        .setDescription('Affiche la météo en temps réel pour une ville donnée.')
        .addStringOption(option =>
            option.setName('localisation')
                .setDescription('Le nom de la ville (ex: Paris, New-York...)')
                .setRequired(true)
        ),

    async execute(interaction) {
        const localisation = interaction.options.getString('localisation');
        
        // Récupération de la clé secrète stockée en toute sécurité dans le .env
        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey) {
            return interaction.reply({
                content: '⚠️ L\'API Météo n\'est pas configurée correctement (clé manquante dans le fichier .env).',
                ephemeral: true
            });
        }

        // Indiquer à Discord que le bot réfléchit (évite le timeout de 3 secondes)
        await interaction.deferReply();

        try {
            // Construction de l'URL sécurisée en combinant l'adresse publique et la clé privée
            const apiInfo = config.apis.utility.find(api => api.id === 'weather');
            const url = `${apiInfo.url}?key=${apiKey}&q=${encodeURIComponent(localisation)}&lang=fr`;

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Ville introuvable ou problème avec l\'API.');
            }

            const data = await response.json();

            // Extraction des données de WeatherAPI
            const ville = data.location.name;
            const pays = data.location.country;
            const temp = data.current.temp_c;
            const condition = data.current.condition.text;
            const humidite = data.current.humidity;
            const vent = data.current.wind_kph;
            const iconeUrl = `https:${data.current.condition.icon}`;

            // Création de l'Embed respectant la charte graphique grise et épurée du projet
            const meteoEmbed = new EmbedBuilder()
                .setColor(config.color || '#4A4A4A')
                .setTitle(`📊 Météo actuelle à ${ville}, ${pays}`)
                .setThumbnail(iconeUrl)
                .addFields(
                    { name: '🌡️ Température', value: `${temp}°C`, inline: true },
                    { name: '☁️ Condition', value: condition, inline: true },
                    { name: '💧 Humidité', value: `${humidite}%`, inline: true },
                    { name: '💨 Vent', value: `${vent} km/h`, inline: true }
                )
                .setFooter({ text: 'HAPPIS Bot • Système de surveillance des APIs' })
                .setTimestamp();

            // Envoi de la réponse finale
            await interaction.editReply({ embeds: [meteoEmbed] });

        } catch (error) {
            console.error(`[ERREUR API] Impossible de récupérer la météo pour ${localisation} :`, error);
            await interaction.editReply({
                content: `❌ Impossible de récupérer la météo pour **${localisation}**. Vérifiez le nom de la ville et réessayez.`
            });
        }
    },
};
