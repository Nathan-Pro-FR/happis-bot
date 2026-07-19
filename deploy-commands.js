const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// 🛠️ EXTRACTION DES COMMANDES (Arborescence à 3 niveaux)
if (fs.existsSync(commandsPath)) {
    const categoryFolders = fs.readdirSync(commandsPath);

    for (const category of categoryFolders) {
        const categoryPath = path.join(commandsPath, category);
        
        if (fs.lstatSync(categoryPath).isDirectory()) {
            const apiFolders = fs.readdirSync(categoryPath);
            
            for (const apiFolder of apiFolders) {
                const apiPath = path.join(categoryPath, apiFolder);
                
                if (fs.lstatSync(apiPath).isDirectory()) {
                    const commandFiles = fs.readdirSync(apiPath).filter(file => file.endsWith('.js'));
                    
                    for (const file of commandFiles) {
                        const filePath = path.join(apiPath, file);
                        const command = require(filePath);
                        
                        if ('data' in command && 'execute' in command) {
                            commands.push(command.data.toJSON());
                        }
                    }
                }
            }
        }
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`🚀 Début du rafraîchissement des ${commands.length} commandes Slash (/) locales...`);
        
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );
        
        console.log('✅ Commandes Slash enregistrées avec succès sur le serveur de test !');
    } catch (error) {
        console.error(error);
    }
})();
