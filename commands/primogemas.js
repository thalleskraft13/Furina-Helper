const User = require("../models/User");
const { PermissionsBitField } = require("discord.js")
module.exports = {
  name: "primogemas",
  description: "Gerencie as primogemas de um usuário.",
  type: 1, // CHAT_INPUT
  options: [
    {
      name: "adicionar",
      description: "Adiciona primogemas a um usuário.",
      type: 1, // SUB_COMMAND
      options: [
        {
          name: "usuario",
          description: "ID do usuário que receberá as primogemas",
          type: 3, // STRING
          required: true
        },
        {
          name: "quantidade",
          description: "Quantidade de primogemas a adicionar",
          type: 10, // INTEGER
          required: true
        }
      ]
    },
    {
      name: "remover",
      description: "Remove primogemas de um usuário.",
      type: 1, // SUB_COMMAND
      options: [
        {
          name: "usuario",
          description: "ID do usuário que perderá as primogemas",
          type: 3, // STRING
          required: true
        },
        {
          name: "quantidade",
          description: "Quantidade de primogemas a remover",
          type: 10, // INTEGER
          required: true
        }
      ]
    }
  ],

  async execute(interaction) {
    if (!interaction.memberPermissions?.has("ManageGuild")) {
      return interaction.reply({
        content: "❌ Você precisa da permissão **Gerenciar Servidor**.",
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.options.getString("usuario");
    const quantidade = interaction.options.getNumber("quantidade");

    console.log(userId, quantidade)

    if (quantidade <= 0) {
      return interaction.reply({
        content: "A quantidade deve ser maior que 0.",
        ephemeral: true
      });
    }

    let userdb = await User.findOne({ id: userId });
    if (!userdb) {
      let newuser = new User({ id: userId});
      await newuser.save();

      userdb = await User.findOne({ id: userId })
    }

    console.log(userdb.primogemas)

    if (subcommand === "adicionar") {
      userdb.primogemas += quantidade;
      
      await userdb.save();
      console.log(userdb.primogemas)
      return interaction.reply({
        content: `✅ <@${userId}> recebeu **${quantidade} primogemas**.`,
        ephemeral: false
      });
    }

    if (subcommand === "remover") {
      userdb.primogemas = userdb.primogemas - quantidade;
      console.log(userdb.primogemas)
      if (userdb.primogemas < 0) userdb.primogemas = 0;
      await userdb.save();
      return interaction.reply({
        content: `❌ <@${userId}> perdeu **${quantidade} primogemas**.`,
        ephemeral: false
      });
    }
  }
};
