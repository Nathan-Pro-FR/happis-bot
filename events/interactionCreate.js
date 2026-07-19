const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // On s'assure que l'interaction est bien une commande Slash textuelle
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`[ATTENTION] Aucune commande correspondant à ${interaction.commandName} n'a été trouvée.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`[ERREUR] Erreur lors de l'exécution de /${interaction.commandName} :`, error);
            
            const errorMessage = { 
                content: '⚠️ Une erreur est survenue lors de l\'exécution de cette commande !', 
                ephemeral: true 
            };

            // On envoie un message éphémère (invisible pour les autres) pour avertir l'utilisateur
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};
