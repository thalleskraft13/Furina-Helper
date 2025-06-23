const { Schema, model } = require("mongoose");

const MsgAutomaticaSchema = new Schema({
  serverId: { type: String, required: true },  // ID do servidor Discord
  chaveDeMsg: { type: String, required: true }, // palavra-chave que ativa a mensagem
  resposta: { type: String, required: true }   // resposta automática para a chave
});

module.exports = model("Msg-Automatica", MsgAutomaticaSchema);
