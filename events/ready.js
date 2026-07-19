const { Events, ActivityType } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`🟢 ${client.user.tag} est en ligne et opérationnel !`);
        
        // Configuration de l'activité dynamique à partir du fichier config.json
        if (config.clientOptions && config.clientOptions.activity) {
            client.user.setPresence({
                activities: [{ 
                    name: config.clientOptions.activity, 
                    type: ActivityType.Custom 
                }],
                status: config.clientOptions.status || 'online',
            });
        }
    },
};
