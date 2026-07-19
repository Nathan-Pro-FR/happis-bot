const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Affiche le cours d\'une crypto-monnaie en temps réel.')
        .addStringOption(option =>
            option.setName('monnaie')
                .setDescription('La crypto-monnaie à analyser')
                .setRequired(true)
                .addChoices(
                    { 
                        name: 'Bitcoin (BTC)', 
                        value: 'bitcoin' 
                    },
                    { 
                        name: 'Ethereum (ETH)',
                        value: 'ethereum' 
                    }
                )
        ),

    async execute(interaction) {
        const monnaie = interaction.options.getString('monnaie');
        await interaction.deferReply();

        try {
            const apiInfo = config.apis.utility.find(api => api.id === 'coingecko');
            
            // Requête vers le endpoint de prix simple
            const url = `${apiInfo.url}/simple/price?ids=${monnaie}&vs_currencies=eur&include_24hr_change=true`;
            const response = await fetch(url);
            const data = await response.json();

            const stats = data[monnaie];
            if (!stats) {
                return interaction.editReply('❌ Impossible de trouver les données de cette monnaie.');
            }

            const prix = stats.eur;
            const evolution24h = stats.eur_24h_change;
            const indicateur = evolution24h >= 0 ? '📈' : '📉';

            const cryptoEmbed = new EmbedBuilder()
                .setColor(config.color || '#4A4A4A')
                .setTitle(`💰 Cours du ${monnaie.toUpperCase()}`)
                .addFields(
                    { 
                        name: 'Prix actuel', 
                        value: `**${prix.toLocaleString('fr-FR')} €**`, 
                        inline: true 
                    },
                    { 
                        name: 'Évolution (24h)', 
                        value: `${indicateur} ${evolution24h.toFixed(2)}%`, 
                        inline: true 
                    }
                )
                .setFooter({ text: 'HAPPIS Bot • Données via CoinGecko' })
                .setTimestamp();

            await interaction.editReply({ embeds: [cryptoEmbed] });

        } catch (error) {
            console.error('[ERREUR COINGECKO]', error);
            await interaction.editReply('❌ Erreur lors de la récupération du cours de la crypto-monnaie.');
        }
    },
};
