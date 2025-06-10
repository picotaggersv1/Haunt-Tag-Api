const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('check')
		.setDescription('Checks to see if the bot is online by replying'),
	async execute(interaction) {
		await interaction.reply('Hello');
	},
};
const { SlashCommandBuilder } = require('discord.js');
const PlayFab = require('playfab-sdk/Scripts/PlayFab/PlayFab');
const PlayFabAdmin = require('playfab-sdk/Scripts/PlayFab/PlayFabAdmin');

PlayFab.settings.titleId = ''; // Replace with your PlayFab Title ID
PlayFab.settings.developerSecretKey = ''; // Replace with your PlayFab Secret Key


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
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Changes my status')
    .addStringOption(option =>
      option.setName('change')
        .setDescription('Choose DND, Online, or Idle')
        .setRequired(true)),
  async execute(interaction) {

    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      return interaction.reply('No thanks');
    }

    const allowedStatuses = ['dnd', 'online', 'idle'];
    const selectedStatus = interaction.options.getString('change').toLowerCase();

    if (!allowedStatuses.includes(selectedStatus)) {
      return interaction.reply('Please choose dnd, online, or idle.');
    }

    try {
      if (selectedStatus === 'dnd') {
        await interaction.client.user.setPresence({ status: 'dnd' });
      } else if (selectedStatus === 'online') {
        await interaction.client.user.setPresence({ status: 'online' });
      } else if (selectedStatus === 'idle') {
        await interaction.client.user.setPresence({ status: 'idle' });
      }
      interaction.reply(`I am now ${selectedStatus}.`);
    } catch (error) {
      console.error('Something went wrong', error);
      interaction.reply('Something went wrong.');
    }
  }
};

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('I know everything about you.'),
	async execute(interaction) {
		await interaction.reply(`ok ${interaction.user.username}, You joined on ${interaction.member.joinedAt}.`);
	},
};

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
