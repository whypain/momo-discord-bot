import { MessageFlags, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides user info'),
    async execute(interaction) {
        const user = interaction.user;
        const userInfo = `User ID: ${user.id}\nUsername: ${user.username}\nDiscriminator: ${user.discriminator}`;
        await interaction.reply({ content: userInfo, flags: MessageFlags.Ephemeral });
    }
}