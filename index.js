const dotenv = require("dotenv");
dotenv.config();

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const token_bot = process.env.DISCORD_TOKEN;
const canale_embed_id = process.env.CANALE_EMBED_ID;
const canale_report_id = process.env.CANALE_REPORT_ID;
const canale_archivio_id = process.env.CANALE_ARCHIVIO_ID;

const id_bottone_report = "apri_modulo_report";
const id_bottone_step2 = "apri_modulo_step2";
const id_bottone_step3 = "apri_modulo_step3";
const id_modulo_step1 = "modulo_report_step1";
const id_modulo_step2 = "modulo_report_step2";
const id_modulo_step3 = "modulo_report_step3";
const id_agente_responsabile = "agente_responsabile";
const id_data_intervento = "data_intervento";
const id_classificazione = "classificazione_rapporto";
const id_tipo_operazione = "tipo_operazione";
const id_luogo_intervento = "luogo_intervento";
const id_agenti_coinvolti = "agenti_coinvolti";
const id_sospetti_coinvolti = "sospetti_coinvolti";
const id_descrizione_fatti = "descrizione_fatti";
const id_prove_raccolte = "prove_raccolte";
const id_azioni_intraprese = "azioni_intraprese";
const id_stato_caso = "stato_caso";
const id_note_aggiuntive = "note_aggiuntive";

const client_discord = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const report_pendenti = new Map();

const crea_embed_fisso = () => {
  return new EmbedBuilder()
    .setColor(0x2f3136)
    .setTitle("FEDERAL INVESTIGATION REPORT")
    .setDescription(
      "Compila il modulo per inviare un rapporto operativo ufficiale."
    );
};

const crea_riga_bottone = () => {
  const bottone_report = new ButtonBuilder()
    .setCustomId(id_bottone_report)
    .setLabel("Compila Report")
    .setStyle(ButtonStyle.Success);
  return new ActionRowBuilder().addComponents(bottone_report);
};

const crea_riga_continua = (customId, etichetta) => {
  const bottone_continua = new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(etichetta)
    .setStyle(ButtonStyle.Primary);
  return new ActionRowBuilder().addComponents(bottone_continua);
};

const crea_modulo_step1 = () => {
  const campo_agente = new TextInputBuilder()
    .setCustomId(id_agente_responsabile)
    .setLabel("Agente responsabile")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Nome e grado dell’agente")
    .setRequired(true);

  const campo_data = new TextInputBuilder()
    .setCustomId(id_data_intervento)
    .setLabel("Data")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("GG/MM/AAAA")
    .setRequired(true);

  const campo_classificazione = new TextInputBuilder()
    .setCustomId(id_classificazione)
    .setLabel("Classificazione del Rapporto")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Pubblico / Confid. / Riserv. / Strett. riservato")
    .setRequired(true);

  const campo_tipo_operazione = new TextInputBuilder()
    .setCustomId(id_tipo_operazione)
    .setLabel("Tipo di operazione")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Indagine / Arresto / Perquisizione / Supporto operativo")
    .setRequired(true);

  const campo_luogo = new TextInputBuilder()
    .setCustomId(id_luogo_intervento)
    .setLabel("Luogo dell’intervento")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Zona")
    .setRequired(true);

  return new ModalBuilder()
    .setCustomId(id_modulo_step1)
    .setTitle("Federal Investigation Report 1/3")
    .addComponents(
      new ActionRowBuilder().addComponents(campo_agente),
      new ActionRowBuilder().addComponents(campo_data),
      new ActionRowBuilder().addComponents(campo_classificazione),
      new ActionRowBuilder().addComponents(campo_tipo_operazione),
      new ActionRowBuilder().addComponents(campo_luogo)
    );
};

const crea_modulo_step2 = () => {
  const campo_agenti = new TextInputBuilder()
    .setCustomId(id_agenti_coinvolti)
    .setLabel("Agenti coinvolti")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Lista degli agenti presenti")
    .setRequired(true);

  const campo_sospetti = new TextInputBuilder()
    .setCustomId(id_sospetti_coinvolti)
    .setLabel("Sospetti coinvolti")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Nome dei soggetti")
    .setRequired(true);

  const campo_fatti = new TextInputBuilder()
    .setCustomId(id_descrizione_fatti)
    .setLabel("Descrizione dei fatti")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Descrizione dettagliata di ciò che è accaduto")
    .setRequired(true);

  const campo_prove = new TextInputBuilder()
    .setCustomId(id_prove_raccolte)
    .setLabel("Prove raccolte")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Foto / Video / Oggetti sequestrati / Testimonianze")
    .setRequired(true);

  const campo_azioni = new TextInputBuilder()
    .setCustomId(id_azioni_intraprese)
    .setLabel("Azioni intraprese")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Arresto, sequestro, interrogatorio ecc.")
    .setRequired(true);

  return new ModalBuilder()
    .setCustomId(id_modulo_step2)
    .setTitle("Federal Investigation Report 2/3")
    .addComponents(
      new ActionRowBuilder().addComponents(campo_agenti),
      new ActionRowBuilder().addComponents(campo_sospetti),
      new ActionRowBuilder().addComponents(campo_fatti),
      new ActionRowBuilder().addComponents(campo_prove),
      new ActionRowBuilder().addComponents(campo_azioni)
    );
};

const crea_modulo_step3 = () => {
  const campo_stato = new TextInputBuilder()
    .setCustomId(id_stato_caso)
    .setLabel("Stato del caso")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Aperto / In indagine / Chiuso")
    .setRequired(true);

  const campo_note = new TextInputBuilder()
    .setCustomId(id_note_aggiuntive)
    .setLabel("Note aggiuntive")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Informazioni utili per indagini future")
    .setRequired(false);

  return new ModalBuilder()
    .setCustomId(id_modulo_step3)
    .setTitle("Federal Investigation Report 3/3")
    .addComponents(
      new ActionRowBuilder().addComponents(campo_stato),
      new ActionRowBuilder().addComponents(campo_note)
    );
};

const invia_embed_fisso = async () => {
  if (!canale_embed_id) {
    console.warn("CANALE_EMBED_ID mancante");
    return;
  }

  const canale = await client_discord.channels.fetch(canale_embed_id).catch(() => null);
  if (!canale || !canale.isTextBased()) {
    console.warn("Canale embed non valido");
    return;
  }

  const messaggi = await canale.messages.fetch({ limit: 50 }).catch(() => null);
  const gia_presente =
    messaggi &&
    messaggi.some(
      (messaggio) =>
        messaggio.author?.id === client_discord.user?.id &&
        messaggio.embeds?.[0]?.title === "FEDERAL INVESTIGATION REPORT"
    );

  if (gia_presente) {
    return;
  }

  await canale.send({
    embeds: [crea_embed_fisso()],
    components: [crea_riga_bottone()],
  });
};

client_discord.once("ready", async () => {
  await invia_embed_fisso();
  console.log(`Connesso come ${client_discord.user?.tag}`);
});

client_discord.on("interactionCreate", async (interaction) => {
  if (interaction.isButton() && interaction.customId === id_bottone_report) {
    const modulo = crea_modulo_step1();
    await interaction.showModal(modulo);
    return;
  }

  if (interaction.isButton() && interaction.customId === id_bottone_step2) {
    const parziale = report_pendenti.get(interaction.user.id);
    if (!parziale) {
      await interaction.reply({
        content: "Sessione scaduta. Riapri il modulo dal bottone.",
        ephemeral: true,
      });
      return;
    }
    await interaction.showModal(crea_modulo_step2());
    return;
  }

  if (interaction.isButton() && interaction.customId === id_bottone_step3) {
    const parziale = report_pendenti.get(interaction.user.id);
    if (!parziale) {
      await interaction.reply({
        content: "Sessione scaduta. Riapri il modulo dal bottone.",
        ephemeral: true,
      });
      return;
    }
    await interaction.showModal(crea_modulo_step3());
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId === id_modulo_step1) {
    report_pendenti.set(interaction.user.id, {
      agente_responsabile: interaction.fields.getTextInputValue(
        id_agente_responsabile
      ),
      data_intervento: interaction.fields.getTextInputValue(id_data_intervento),
      classificazione: interaction.fields.getTextInputValue(id_classificazione),
      tipo_operazione: interaction.fields.getTextInputValue(id_tipo_operazione),
      luogo_intervento: interaction.fields.getTextInputValue(id_luogo_intervento),
    });
    await interaction.reply({
      content: "Step 1 completato. Continua con lo Step 2.",
      ephemeral: true,
      components: [crea_riga_continua(id_bottone_step2, "Continua Step 2")],
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId === id_modulo_step2) {
    const parziale = report_pendenti.get(interaction.user.id);
    if (!parziale) {
      await interaction.reply({
        content: "Sessione scaduta. Riapri il modulo dal bottone.",
        ephemeral: true,
      });
      return;
    }
    report_pendenti.set(interaction.user.id, {
      ...parziale,
      agenti_coinvolti: interaction.fields.getTextInputValue(
        id_agenti_coinvolti
      ),
      sospetti_coinvolti: interaction.fields.getTextInputValue(
        id_sospetti_coinvolti
      ),
      descrizione_fatti: interaction.fields.getTextInputValue(
        id_descrizione_fatti
      ),
      prove_raccolte: interaction.fields.getTextInputValue(id_prove_raccolte),
      azioni_intraprese: interaction.fields.getTextInputValue(
        id_azioni_intraprese
      ),
    });
    await interaction.reply({
      content: "Step 2 completato. Continua con lo Step 3.",
      ephemeral: true,
      components: [crea_riga_continua(id_bottone_step3, "Continua Step 3")],
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId === id_modulo_step3) {
    const parziale = report_pendenti.get(interaction.user.id);
    if (!parziale) {
      await interaction.reply({
        content: "Sessione scaduta. Riapri il modulo dal bottone.",
        ephemeral: true,
      });
      return;
    }
    report_pendenti.delete(interaction.user.id);

    const stato_caso = interaction.fields.getTextInputValue(id_stato_caso);
    const note_aggiuntive = interaction.fields.getTextInputValue(
      id_note_aggiuntive
    );

    const embed_report = new EmbedBuilder()
      .setColor(0x1abc9c)
      .setTitle("FEDERAL INVESTIGATION REPORT")
      .addFields(
        { name: "Agente responsabile", value: parziale.agente_responsabile },
        { name: "Data", value: parziale.data_intervento },
        {
          name: "Classificazione del Rapporto",
          value: parziale.classificazione,
        },
        { name: "Tipo di operazione", value: parziale.tipo_operazione },
        { name: "Luogo dell’intervento", value: parziale.luogo_intervento },
        { name: "Agenti coinvolti", value: parziale.agenti_coinvolti },
        { name: "Sospetti coinvolti", value: parziale.sospetti_coinvolti },
        { name: "Descrizione dei fatti", value: parziale.descrizione_fatti },
        { name: "Prove raccolte", value: parziale.prove_raccolte },
        { name: "Azioni intraprese", value: parziale.azioni_intraprese },
        { name: "Stato del caso", value: stato_caso },
        { name: "Note aggiuntive", value: note_aggiuntive || "N/A" }
      )
      .setTimestamp()
      .setFooter({
        text: `Inviato da ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    const canale_destinazione = canale_report_id
      ? await client_discord.channels.fetch(canale_report_id).catch(() => null)
      : interaction.channel;

    if (canale_destinazione && canale_destinazione.isTextBased()) {
      await canale_destinazione.send({ embeds: [embed_report] });
    }

    if (canale_archivio_id) {
      const canale_archivio = await client_discord.channels
        .fetch(canale_archivio_id)
        .catch(() => null);
      if (
        canale_archivio &&
        canale_archivio.isTextBased() &&
        canale_archivio.id !== canale_destinazione?.id
      ) {
        await canale_archivio.send({ embeds: [embed_report] });
      }
    }

    await interaction.reply({
      content: "Rapporto inviato con successo.",
      ephemeral: true,
    });
  }
});

if (!token_bot) {
  console.error("DISCORD_TOKEN mancante");
  process.exit(1);
}

client_discord.login(token_bot);
