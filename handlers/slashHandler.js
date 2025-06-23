const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  const commandFiles = fs.readdirSync(path.join(__dirname, "../commands")).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    client.commands.set(command.name, command); // aqui foi corrigido
  }

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (!interaction.memberPermissions?.has("ManageGuild")) {
      return interaction.reply({
        content: "❌ Você precisa da permissão **Gerenciar Servidor** para usar este comando.",
        ephemeral: true,
      });
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "❌ Ocorreu um erro ao executar este comando.", ephemeral: true });
    }
  });
};
