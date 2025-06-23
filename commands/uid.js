const User = require("../models/User");

module.exports = {
  name: "uid",
  description: "Verifica e registra o UID de um usuário.",
  type: 1, // CHAT_INPUT
  options: [
    {
      name: "usuario",
      description: "O ID do usuário a ser verificado",
      type: 3, // STRING
      required: true,
    },
    {
      name: "uid",
      description: "O UID a ser registrado",
      type: 3, // STRING
      required: true,
    },
    {
      name: "status",
      description: "Aprovar ou recusar a verificação",
      type: 3, // STRING
      required: true,
      choices: [
        { name: "Aprovado", value: "aprovado" },
        { name: "Recusado", value: "recusado" }
      ]
    }
  ],

  async execute(interaction) {
    if (!interaction.memberPermissions?.has("ManageGuild")) {
      return interaction.reply({
        content: "❌ Você precisa da permissão **Gerenciar Servidor** para usar este comando.",
        ephemeral: true
      });
    }

    const userId = interaction.options.getString("usuario");
    const uid = interaction.options.getString("uid");
    const status = interaction.options.getString("status");

    // Procura ou cria o usuário
    let userdb = await User.findOne({ id: userId });
    if (!userdb) {
      userdb = new User({ id: userId, primogemas: 0 });
      await userdb.save();
    }

    if (status === "aprovado") {
      userdb.uid = uid;
      userdb.primogemas += 1600;
      await userdb.save();

      await interaction.client.users.fetch(userId).then((user) =>
        user.send({
          embeds: [
            {
              title: "Verificação Concluída",
              description: `Oh là là! Seu UID foi verificado pelo distinto moderador ${interaction.user.username}! E como todo grande ato merece sua recompensa... receba agora 1600 primogemas pelo seu esplêndido desempenho!`,
              color: 0x00ff00
            }
          ]
        }).catch(() => {}) // ignora erro caso o usuário tenha DMs fechadas
      );

      return interaction.reply({ content: "✅ Verificação aprovada e UID registrado com sucesso." });
    } else if (status === "recusado") {
      await interaction.client.users.fetch(userId).then((user) =>
        user.send({
          embeds: [
            {
              title: "Verificação Concluída",
              description: `Tsc... que decepção trágica! Seu UID foi analisado pelo moderador ${interaction.user.username}, mas, infelizmente, não passou na verificação. O palco exige autenticidade, mon cher!`,
              color: 0xff0000
            }
          ]
        }).catch(() => {}) // ignora erro caso o usuário tenha DMs fechadas
      );

      return interaction.reply({ content: "❌ Verificação recusada." });
    }
  }
};
