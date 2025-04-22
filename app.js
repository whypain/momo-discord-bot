import { 
	Client, 
	Collection, 
	Events, 
	GatewayIntentBits, 
	MessageFlags, 
	EmbedBuilder ,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

import { fileURLToPath } from 'url';
import { assignCommands } from './util.js';
import express from 'express';
import path from 'path'
import dotenv from 'dotenv';

dotenv.config();




const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: ['CHANNEL'],
});

client.commands = new Collection();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandFolderPath = path.join(__dirname, 'commands');

await assignCommands(client, commandFolderPath);




client.once(Events.ClientReady, readyClient => {
  console.log(`${readyClient.user.tag} Ready!`);
});


client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);

  if (command) command.execute(interaction).catch(console.error);
  else console.log(`[WARNING] No command matching ${interaction.commandName} was found.`);
})


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isAnySelectMenu()) return;
	if (interaction.customId === 'selected_users') {

		try {
			const voiceChannel = interaction.member.voice.channel;
			if (voiceChannel === null) {
				await interaction.reply({ content: 'You must be in a voice channel to send invites!', flags: MessageFlags.Ephemeral });
				return;
			}
		} catch (error) {
			await interaction.reply({ content: 'Probably doesn\'t have permissions.\nBeg admins then try again.', flags: MessageFlags.Ephemeral });
			return;
		}

		const selectedUsers = interaction.values;

		try
		{	
			const modal = new ModalBuilder()
				.setCustomId(`invite_modal|${selectedUsers}`)
				.setTitle("Message to send")

			const titleInput = new TextInputBuilder()
				.setCustomId("invite_title")
				.setLabel("Title")
				.setMinLength(1)
				.setMaxLength(40)
				.setValue(`Message from ${interaction.user.tag}!`)
				.setStyle(TextInputStyle.Short);
				
			const descriptionInput = new TextInputBuilder()
				.setCustomId("invite_description")
				.setLabel("Description")
				.setMinLength(1)
				.setMaxLength(200)
				.setValue("Hop on you filthy casuals.")
				.setStyle(TextInputStyle.Paragraph);

			const titleInputRow = new ActionRowBuilder().addComponents(titleInput);
			const descriptionInputRow = new ActionRowBuilder().addComponents(descriptionInput);

			modal.addComponents(titleInputRow, descriptionInputRow);

			await interaction.showModal(modal);

		} catch (error) {
			console.error('Error showing modal:', error);
			return;
		}
	}
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isModalSubmit()) return;
	if (!interaction.customId.startsWith('invite_modal'))  return;
	
	const [ modalId, selectedUsers ] = interaction.customId.split('|');
	
	const selected_users = selectedUsers.split(',');
	const title = interaction.fields.getTextInputValue('invite_title');
	const description = interaction.fields.getTextInputValue('invite_description');

	const userGlobal = await client.users.fetch(interaction.user.id, { force: true });
	
	try
	{	
		const joinButton = new ButtonBuilder()
			.setLabel('Go to VC')
			.setStyle(ButtonStyle.Link)
			.setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.member.voice.channel.id}`)
			.setEmoji('🔊');
		
		const embed = new EmbedBuilder()
			.setTitle(title)
			.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
			.setThumbnail(interaction.guild.iconURL())
			.setDescription(description)
			.setColor(parseInt(userGlobal.accentColor.toString(16).padStart(6, '0'), 16));
		
		const buttonRow = new ActionRowBuilder().addComponents(joinButton);
		
		selected_users.map(async userId => {
			const user = await interaction.guild.members.fetch(userId);
			await user.send({ embeds: [embed], components: [buttonRow] });
		});
		
		await interaction.reply({ content: 'DMs sent to selected users!', flags: MessageFlags.Ephemeral });
	} catch (error) {
		console.error('Error sending DM:', error);
		return;
	}
	
})

const app = express();

app.get('/', (req, res) => {
	res.send('🤖 Bot is alive and kicking!');
});

app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});


client.login(process.env.DISCORD_TOKEN);