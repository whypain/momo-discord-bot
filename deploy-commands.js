import { REST, Routes } from 'discord.js';
import { loadCommands } from "./util.js";
import { join } from 'path';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const commandFolderPath = join(__dirname, 'commands');
const commands = await loadCommands(commandFolderPath);

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(

			Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID),       // GuildCommands
            // Routes.applicationCommands(process.env.APP_ID),                               // GlobalCommands

			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();