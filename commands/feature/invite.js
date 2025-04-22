import { 
    MessageFlags, 
    SlashCommandBuilder, 
    UserSelectMenuBuilder, 
    ActionRowBuilder ,
    InteractionContextType,
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('DM invite message to people')
        .setContexts(InteractionContextType.Guild),
        
    async execute(interaction) {
        const userSelectMenu = new UserSelectMenuBuilder()
            .setCustomId('selected_users')
            .setPlaceholder('Select a user to invite')
            .setMinValues(1)
            .setMaxValues(25);
        const row = new ActionRowBuilder()
            .addComponents(userSelectMenu);

        await interaction.reply({
            content: 'Select up to 20 users to invite',
            components: [row],
            flags: MessageFlags.Ephemeral,
        });
    }
}