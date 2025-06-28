const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ButtonBuilder,
  ButtonStyle,
  SectionBuilder,
  ActionRowBuilder,
  ContainerBuilder,
  InteractionResponseFlags
} = require("discord.js");

module.exports = {
  name: "formulario",
  description: "Mostra o formulário para se candidatar à equipe da Furina",
  type: 1, // CHAT_INPUT
  async execute(interaction) {
    const components = [
      new ContainerBuilder()
        .setAccentColor(0x66ccff) // Azul claro inspirado na Furina
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("# ⚖️ Torne-se Staff da Furina do Discord!")
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "A justiça precisa de bons servidores. Escolha sua vaga e preencha o formulário com sabedoria.\n\n" +
            "🔹 Vagas disponíveis:\n- **Moderador**\n- **Administrador** _(necessário já ser moderador)_\n\n" +
            "**⚠️ É obrigatório conhecer e saber usar a Furina do Discord.**"
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("form_cargo_furina")
              .setPlaceholder("Escolha sua vaga...")
              .addOptions(
                new StringSelectMenuOptionBuilder()
                  .setLabel("Seja Moderador")
                  .setValue("mod")
                  .setDescription("Candidate-se como Moderador da Furina Bot"),
                new StringSelectMenuOptionBuilder()
                  .setLabel("Seja Administrador")
                  .setValue("adm")
                  .setDescription("Candidate-se como Administrador (só para moderadores)")
              )
          )
        ),
    ];

    await interaction.reply({
      components,
      flags: 32768 
    });
  }
};
