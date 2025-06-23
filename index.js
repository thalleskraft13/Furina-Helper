const { Client, GatewayIntentBits, Partials, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const mongoose = require('mongoose');
const Discord = require("discord.js")

// Importe seus models, ajuste os caminhos conforme seu projeto
const Servidores = require('./models/Servidores');
const MsgAutomatica = require('./models/Msg');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Discord.Collection();

// Conecte no MongoDB 
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('MongoDB conectado');
}).catch(console.error);

client.once('ready', () => {
  console.log(`Logado como ${client.user.tag}`);
});

require("./handlers/slashHandler")(client);

client.on('interactionCreate', async (interaction) => {
  // TRATAR CLIQUE NO BOTÃO "parceiro"
  if (interaction.isButton()) {
    if (interaction.customId === "parceiro") {
      const modal = new ModalBuilder()
        .setCustomId("formParceria")
        .setTitle("Formulário de Parceria");

      const nomeDonoInput = new TextInputBuilder()
        .setCustomId("nomeDono")
        .setLabel("Nome do dono do servidor")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const idServidorInput = new TextInputBuilder()
        .setCustomId("idServidor")
        .setLabel("ID do servidor")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const conviteServidorInput = new TextInputBuilder()
        .setCustomId("conviteServidor")
        .setLabel("Convite do servidor")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const temaServidorInput = new TextInputBuilder()
        .setCustomId("temaServidor")
        .setLabel("Tema do servidor")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const motivoInput = new TextInputBuilder()
        .setCustomId("motivo")
        .setLabel("Por que seu servidor merece parceria?") // 39 chars
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nomeDonoInput),
        new ActionRowBuilder().addComponents(idServidorInput),
        new ActionRowBuilder().addComponents(conviteServidorInput),
        new ActionRowBuilder().addComponents(temaServidorInput),
        new ActionRowBuilder().addComponents(motivoInput),
      );

      await interaction.showModal(modal);
    }
  }

  // TRATAR ENVIO DO MODAL
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "formParceria") {
      await interaction.deferReply({ ephemeral: true });

      const nomeDono = interaction.fields.getTextInputValue("nomeDono");
      const idServidor = interaction.fields.getTextInputValue("idServidor");
      const conviteServidor = interaction.fields.getTextInputValue("conviteServidor");
      const temaServidor = interaction.fields.getTextInputValue("temaServidor");
      const motivo = interaction.fields.getTextInputValue("motivo");

      const guild = interaction.guild;

      try {
        const servidorDB = await Servidores.findOne({ serverId: idServidor });
        const msgAutoCount = await MsgAutomatica.countDocuments({ serverId: idServidor });

        const temSistemaAtivo =
          (servidorDB && servidorDB.logs?.react?.ativado) || msgAutoCount > 0;

        if (!temSistemaAtivo) {
          return interaction.editReply({
            content:
              "❌ Este servidor não possui nenhum sistema ativo (logs de reação ou mensagens automáticas). A parceria não pode ser aceita.",
          });
        }

        let existingChannel = guild.channels.cache.find(
          (c) => c.name === interaction.user.id
        );
        if (existingChannel) {
          return interaction.editReply({
            content: "❌ Você já possui um canal de parceria aberto.",
          });
        }

        const categoryId = "1386802457367154789";

        const channel = await guild.channels.create({
          name: interaction.user.id,
          type: ChannelType.GuildText,
          parent: categoryId,
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
              id: "1374104022096805928",
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
          ],
        });

        const usoLogs = servidorDB?.logs?.react?.ativado ? "Ativado" : "Desativado";
        const usoMsgAuto = msgAutoCount;
        const usoComandos = servidorDB?.usoDeComandos ?? 0;

        const mensagem = `📢 **Novo pedido de parceria enviado por <@${interaction.user.id}>**\n\n` +
          `**Nome do dono do servidor:** ${nomeDono}\n` +
          `**ID do servidor:** ${idServidor}\n` +
          `**Convite do servidor:** ${conviteServidor}\n` +
          `**Tema do servidor:** ${temaServidor}\n` +
          `**Por que deveríamos ter parceria:**\n${motivo}\n\n` +
          `**Status dos sistemas no servidor:**\n- Logs de Reação: ${usoLogs}\n- Mensagens Automáticas cadastradas: ${usoMsgAuto}\n- Uso de comandos registrados: ${usoComandos}\n\n` +
          `<@&1374104022096805928>`;

        await channel.send({ content: mensagem });

        await interaction.editReply({
          content: `✅ Seu pedido foi enviado com sucesso! Confira no canal ${channel} para acompanhar.`,
        });
      } catch (error) {
        console.error(error);
        await interaction.editReply({
          content:
            "❌ Ocorreu um erro ao criar o canal ou verificar os sistemas. Por favor, tente novamente mais tarde.",
        });
      }
    }
  }
});

client.login(process.env.TOKEN);
