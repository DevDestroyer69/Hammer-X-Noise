const Command = require("../../abstract/Command.js");
const { EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = class Help extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      description: "Shows all the commands available",
      usage: ["[command]"],
      category: 'Utility',
      aliases: ["help", "h"],
    });
  }

  async run(msg, args) {

    const helpEmbed = new EmbedBuilder()
      .setColor(this.client.util.color.success).
      setAuthor({ name: `${this.client.user.username} Help section`, iconURL: this.client.user.displayAvatarURL() })
      .setDescription(
        `Hammer A Quality Music Bot With Good Music Features. 
      [Invite](https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot%20applications.commands) | [Support](https://discord.gg/hammer)`
      )
      .addFields({
        name: `Commands Section`,
        value: `
<:hammer_2:1088811460341284914> \`:\` Music 
<:hammer_7:1088833721454567605> \`:\` Filters 
<:hammer_1:1088811358511968316> \`:\` Configuration 
<:hammer_5:1088811571532275732> \`:\` Utility 
<:hammer_3:1088811498207461457> \`:\` Owner
      `
      })
      .setFooter({ text: `Developed by Hammer tech`, iconURL: msg.guild.iconURL({ dynamic: true }) })
      .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }));

    const b1 = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`m1`).setEmoji('<:hammer_2:1088811460341284914>');
    const b2 = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`m2`).setEmoji('<:hammer_7:1088833721454567605>');
    const b3 = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`m3`).setEmoji('<:hammer_1:1088811358511968316>');
    const b4 = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`m4`).setEmoji('<:hammer_5:1088811571532275732>');
    const b5 = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`m5`).setEmoji('<:hammer_3:1088811498207461457>');

    const selectMenu = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('helpop')
          .setMinValues(1)
          .setMaxValues(1)
          .setPlaceholder('Select Category')
          .addOptions([
            { label: 'Music', value: 'm1', emoji: '1088811460341284914' },
            { label: 'Filters', value: 'm2', emoji: '1088833721454567605' },
            { label: 'Configutration', value: 'm3', emoji: '1088811358511968316' },
            { label: 'Utility', value: 'm4', emoji: '1088811571532275732' },
            { label: 'Owner', value: 'm5', emoji: '1088811498207461457' },
          ]));

    const m1 = new EmbedBuilder().setColor(this.client.util.color.success).addFields({ name: `__Music Commands__ [${this.client.commands.filter(x => x.category && x.category === `Music`).size}]`, value: `${this.client.commands.filter(x => x.category && x.category === `Music`).map(r => `\`${r.name}\``).sort().join(`, `)}` });
    const m2 = new EmbedBuilder().setColor(this.client.util.color.success).addFields({ name: `__Filter Commands__ [${this.client.commands.filter(x => x.category && x.category === `Filters`).size}]`, value: `${this.client.commands.filter(x => x.category && x.category === `Filters`).map(r => `\`${r.name}\``).sort().join(`, `)}` });
    const m3 = new EmbedBuilder().setColor(this.client.util.color.success).addFields({ name: `__Configuration Commands__ [${this.client.commands.filter(x => x.category && x.category === `Configuration`).size}]`, value: `${this.client.commands.filter(x => x.category && x.category === `Configuration`).map(r => `\`${r.name}\``).sort().join(`, `)}` });
    const m4 = new EmbedBuilder().setColor(this.client.util.color.success).addFields({ name: `__Information Commands__ [${this.client.commands.filter(x => x.category && x.category === `Utility`).size}]`, value: `${this.client.commands.filter(x => x.category && x.category === `Utility`).map(r => `\`${r.name}\``).sort().join(`, `)}` });
    const m5 = new EmbedBuilder().setColor(this.client.util.color.success).addFields({ name: `__Owner Commands__ [${this.client.commands.filter(x => x.category && x.category === `Owner`).size}]`, value: `${this.client.commands.filter(x => x.category && x.category === `Owner`).map(r => `\`${r.name}\``).sort().join(`, `)}` });

    const selectButtons = new ActionRowBuilder().addComponents(b1, b2, b3, b4, b5)
    const mm = await msg.channel.send({ embeds: [helpEmbed], components: [selectMenu, selectButtons] });

    const collector = mm.createMessageComponentCollector({
      time: 50000,
      filter: (o) => {
        if (o.user.id === msg.author.id) return true;
        else {
          return o.reply({ content: `:x: | This is not your session run ${msg.guild.prefix}help instead.`, ephemeral: true })
        }
      },
    });

    collector.on('collect', async interaction => {
      if (interaction.isButton()) {
        if (interaction.customId === `m1`) return interaction.update({ embeds: [m1] });
        if (interaction.customId === `m2`) return interaction.update({ embeds: [m2] });
        if (interaction.customId === `m3`) return interaction.update({ embeds: [m3] });
        if (interaction.customId === `m4`) return interaction.update({ embeds: [m4] });
        if (interaction.customId === `m5`) return interaction.update({ embeds: [m5] });
      }
      if (interaction.isStringSelectMenu()) {
        for (const value of interaction.values) {
          if (value === `m1`) return interaction.update({ embeds: [m1] });
          if (value === `m2`) return interaction.update({ embeds: [m2] });
          if (value === `m3`) return interaction.update({ embeds: [m3] });
          if (value === `m4`) return interaction.update({ embeds: [m4] });
          if (value === `m5`) return interaction.update({ embeds: [m5] });
        }
      }

    })
  }
};