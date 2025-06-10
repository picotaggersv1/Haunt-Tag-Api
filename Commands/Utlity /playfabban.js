const { SlashCommandBuilder } = require('discord.js');
const PlayFab = require('playfab-sdk/Scripts/PlayFab/PlayFab');
const PlayFabAdmin = require('playfab-sdk/Scripts/PlayFab/PlayFabAdmin');

PlayFab.settings.titleId = '1605E6'; 
PlayFab.settings.developerSecretKey = '7N1IRQZ3HRF7O4KUW5T344YZX14SW45M4ODE9JHOISRQUFIRP4'; 


module.exports = {
  data: new SlashCommandBuilder()
    .setName('playfabban')
    .setDescription('Bans a player on playfab')
    .addStringOption(option =>
      option.setName('playerid')
        .setDescription('The ID of the player to ban')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('banduration')
        .setDescription('The ban duration in hours')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('banreason')
        .setDescription('The reason for the ban')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      return interaction.reply('no thanks');
    }

    const playerId = interaction.options.getString('playerid');
    const banDurationInHours = interaction.options.getInteger('banduration');
    const banReason = interaction.options.getString('banreason');

    try {

      const banResult = await PlayFabAdmin.BanUsers({
        Bans: [
          {
            PlayFabId: playerId,
            Reason: banReason,
            DurationInHours: banDurationInHours,
          },
        ],
      });


      await interaction.reply(`Okay, I banned ${playerId}. Result: ${JSON.stringify(banResult)}`);
    } catch (error) {
      console.error('Error banning user:', error);
      await interaction.reply(`Uh oh, an error occurred: ${error.errorMessage}`);
    }
  },
};
