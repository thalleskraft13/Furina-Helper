const {
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
  name: "parceria",
  description: "Mostra informações sobre parcerias da Furina",
  type: 1, // CHAT_INPUT
  async execute(interaction) {
    const components = [
      new ContainerBuilder()
        .setAccentColor(16767744)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("# 💫 Parcerias com a Furina estão oficialmente ABERTAS! ")
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("Quer se tornar um parceiro oficial da @furina e desbloquear benefícios únicos para o seu servidor? A hora é agora — mas corra, **pois as vagas são limitadas**!")
        )
        .addSectionComponents(
          new SectionBuilder()
            .setButtonAccessory(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("Website")
                .setURL("https://furina-do-discord.onrender.com/")
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# ✅ Requisitos para se tornar parceiro:
- Ter a Furina adicionada ao servidor;

- Utilizar a Furina diariamente;

- Ter pelo menos 1 sistema ativo da Furina no servidor;

- Ter um representante presente no servidor de suporte;

- O servidor deve ser ativo e com membros engajados;

>>> 🔍 Todos os servidores passam por **análise de verificação para garantir que estão aptos à parceria.**`)
            )
        )
        .addSectionComponents(
          new SectionBuilder()
            .setButtonAccessory(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("Me adicione!")
                .setURL("https://discord.com/oauth2/authorize?client_id=1314904179680219136&permissions=8&response_type=code&redirect_uri=https%3A%2F%2Ffurina-do-discord.onrender.com%2Fauth%2Fdiscord%2Fcallback&integration_type=0&scope=bot+identify+applications.commands")
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# 🎁 Benefícios dos parceiros:
- 2 sistema personalizado, feitos exclusivamente para o seu servidor;

 > 🕒 Prazo estimado: até 7 dias úteis (podendo variar conforme a complexidade);

> 📅 Para eventos personalizados, o pedido deve ser feito com 1 mês de antecedência;

- Destaque no site oficial da Furina e nos status do bot;

- Bônus de primogemas dentro da experiência Furina!

## **📌 Vagas atuais: apenas 2 parcerias disponíveis!**

📝 Como solicitar parceria:
Abra um ticket no servidor de suporte e envie o seguinte formulário preenchido:

\`\`\`
 Dono do servidor:
 ID do servidor:
 Convite do servidor:
Tema do seu servidor:
 Por que deveríamos ter uma parceria com seu servidor?
\`\`\`

**Estamos ansiosos para te receber no palco principal da Furina! 🎭✨**`)
            )
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Primary)
              .setLabel("Quero ser parceiro!")
              .setCustomId("parceiro")
          )
        ),
    ];

    await interaction.reply({
      components,
      flags: 32768// mensagem apenas visível para quem executou
    });
  }
};
