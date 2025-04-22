import { readdirSync } from 'fs';
import path from 'path';
import { join } from 'path';
import { pathToFileURL } from 'url';

export const getAllCommandPaths = (commandFolderPath) => {
    const allCommandFiles = [];

    const commandFolders = readdirSync(commandFolderPath);

    for (const folder of commandFolders) {
        const commandPath = join(commandFolderPath, folder);
        const commandFiles = readdirSync(commandPath).filter(file => file.endsWith('.js'));
        allCommandFiles.push(...commandFiles.map(file => join(commandPath, file)));
    }

    return allCommandFiles;
}

export const loadCommands = async (commandFolderPath) => {
    const commandPaths = getAllCommandPaths(commandFolderPath);

    const commands = await Promise.all(
        commandPaths.map(async (file) => {
            const absolutePath = path.resolve(file);
            const fileUrl = pathToFileURL(absolutePath).href;
            const commandModule = await import(fileUrl);
            const command = commandModule.default || commandModule; // Default export or whole module

            // Validate command before pushing
            if ('data' in command && 'execute' in command && command.data?.name) {
                return command.data.toJSON();  // Return valid command
            } else {
                console.warn(`[WARNING] Invalid command at ${file}`);
                return null; // Return null for invalid commands
            }
        })
    );

    // Filter out any invalid or null commands
    return commands.filter(Boolean);  // Filter nulls
};

export const assignCommands = async(client, commandFolderPath) => {
    const commandFiles = getAllCommandPaths(commandFolderPath);
    
    for (const commandsPath of commandFiles) {
        const absolutePath = path.resolve(commandsPath);
        const fileUrl = pathToFileURL(absolutePath).href;
        const commandModule = await import(fileUrl);
        const command = commandModule.default || commandModule; // Default export or whole module

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${commandsPath} is missing a required "data" or "execute" property.`);
        }
    }
}