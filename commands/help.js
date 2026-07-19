const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { color } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes disponibles et l\'aide de HAPPIS Bot.'),
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🤖 Centre d\'Aide • HAPPIS Bot')
            .setDescription('Bienvenue sur l\'interface d\'aide. HAPPIS Bot est conçu pour surveiller et interagir avec les APIs externes.')
            .addFields(
                { name: '⚙️ Outils & APIs', value: '`/apis` : Liste les services web actuellement connectés au bot.\n`/statut` : Affiche l\'état de santé (ping/latence) des APIs connectées.' },
                { name: 'ℹ️ Général', value: '`/help` : Affiche ce menu d\'aide.' }
            )
            .setFooter({ text: 'HAPPIS Bot • Hexagones & Connexions', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [helpEmbed] });
    },
};
