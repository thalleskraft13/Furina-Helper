const {
  Client,
  GatewayIntentBits,
  Partials,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
  ChannelType
} = require('discord.js');
const mongoose = require('mongoose');
const Discord = require("discord.js");

const Servidores = require('./models/Servidores');
const MsgAutomatica = require('./models/Msg');
require("./deploy-commands");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Discord.Collection();

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('MongoDB conectado');
}).catch(console.error);

client.once('ready', () => {
  console.log(`Logado como ${client.user.tag}`);
});

require("./handlers/slashHandler")(client);

client.on('interactionCreate', async (interaction) => {
  // SELECT MENU DE STAFF
  if (interaction.isStringSelectMenu() && interaction.customId === "form_cargo_furina") {
    const cargo = interaction.values[0];

    if (cargo === "adm") {
      const temCargo = interaction.member.roles.cache.has("1374104022096805928");
      if (!temCargo) {
        return interaction.reply({
          ephemeral: true,
          content: "❌ Para se candidatar como **Administrador**, é necessário já ser um **Moderador aprovado**.",
        });
      }
    }

    const modal = new ModalBuilder()
      .setCustomId(`form_${cargo}`)
      .setTitle(`Formulário para ${cargo === "mod" ? "Moderador" : "Administrador"}`);

    // Campos do formulário de MODERADOR
    const modInputs = [
      new TextInputBuilder()
        .setCustomId("idade")
        .setLabel("Qual sua idade real?")
        .setStyle(TextInputStyle.Short)
        .setRequired(true),
      new TextInputBuilder()
        .setCustomId("experiencia")
        .setLabel("Você já foi staff antes? Conte um pouco.")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true),
      new TextInputBuilder()
        .setCustomId("briga")
        .setLabel("Como você lidaria com uma briga no chat?")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true),
    ];

    // Campos do formulário de ADMINISTRADOR
    const admInputs = [
      new TextInputBuilder()
        .setCustomId("experiencia")
        .setLabel("Você já foi staff antes? Conte um pouco.")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true),
      new TextInputBuilder()
        .setCustomId("config")
        .setLabel("Você sabe configurar bots/canais?")
        .setStyle(TextInputStyle.Short)
        .setRequired(true),
      new TextInputBuilder()
        .setCustomId("abuso")
        .setLabel("O que faria se um staff abusasse do cargo?")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true),
    ];

    const componentes = (cargo === "mod" ? modInputs : admInputs).map(input =>
      new ActionRowBuilder().addComponents(input)
    );

    modal.addComponents(...componentes);
    await interaction.showModal(modal);
  }

  // FORMULÁRIO DE STAFF ENVIADO
  if (
    interaction.isModalSubmit() &&
    (interaction.customId === "form_mod" || interaction.customId === "form_adm")
  ) {
    await interaction.deferReply({ ephemeral: true });

    const isAdm = interaction.customId === "form_adm";
    const guild = interaction.guild;

    // Obtenção de campos do formulário
    const campos = {
      idade: !isAdm ? interaction.fields.getTextInputValue("idade") : null,
      experiencia: interaction.fields.getTextInputValue("experiencia"),
      briga: !isAdm ? interaction.fields.getTextInputValue("briga") : null,
      config: isAdm ? interaction.fields.getTextInputValue("config") : null,
      abuso: isAdm ? interaction.fields.getTextInputValue("abuso") : null,
    };

    // Impede formulário duplicado
    const existingChannel = guild.channels.cache.find(c => c.name === `form-${interaction.user.id}`);
    if (existingChannel) {
      return interaction.editReply({ content: "❌ Você já possui uma candidatura ativa." });
    }

    // Criação do canal na categoria correta
    const channel = await guild.channels.create({
      name: `form-${interaction.user.id}`,
      type: ChannelType.GuildText,
      parent: "1388482265952288849", // Categoria de formulários
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: "1374104022096805928", // Cargo da staff
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
      ],
    });

    // Montagem da mensagem para a staff
    let mensagem = `📩 **Nova candidatura para ${isAdm ? "Administrador" : "Moderador"}**\nEnviado por <@${interaction.user.id}>\n\n`;

    if (!isAdm) {
      mensagem += `**Idade:** ${campos.idade}\n\n`;
    }

    mensagem += `**Experiência prévia:**\n${campos.experiencia}\n\n`;

    if (!isAdm) {
      mensagem += `**Como lidaria com brigas no chat:**\n${campos.briga}\n\n`;
    } else {
      mensagem += `**Sabe configurar bots/canais?:** ${campos.config}\n\n`;
      mensagem += `**Como agiria diante de abuso de outro staff:**\n${campos.abuso}\n\n`;
    }

    mensagem += `<@&1374104022096805928>`;

    await channel.send({ content: mensagem });

    await interaction.editReply({
      content: `✅ Formulário enviado com sucesso! Verifique o canal ${channel} para acompanhar.`,
    });
  }
});

client.login(process.env.TOKEN);