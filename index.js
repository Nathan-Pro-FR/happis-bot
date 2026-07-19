const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 🛠️ CHARGEMENT DES COMMANDES (Arborescence à 3 niveaux)
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

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
                            client.commands.set(command.data.name, command);
                        }
                    }
                }
            }
        }
    }
}

// 🛠️ CHARGEMENT AUTOMATIQUE DES EVENEMENTS (Dossier events/)
const eventsPath = path.join(__dirname, 'events');

if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

client.login(process.env.DISCORD_TOKEN);
