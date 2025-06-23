require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");

const commands = [];
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Empurra o comando com o formato esperado pela API
  commands.push({
    name: command.name,
    description: command.description,
    options: command.options || [],
    type: command.type || 1
  });
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("⏳ Registrando os comandos...");
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("✅ Comandos registrados com sucesso!");
  } catch (err) {
    console.error("Erro ao registrar comandos:", err);
  }
})();
