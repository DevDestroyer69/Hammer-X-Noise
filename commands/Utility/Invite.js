const Command = require("../../abstract/Command.js");
const { EmbedBuilder } = require('discord.js');

module.exports = class Invite extends Command {
  constructor(client) {
    super(client, {
      name: "invite",
      description: "Gives you the invite and support server link",
      category: 'Utility',
      aliases: ["support", "inv"],
    });
  }

  async run(msg) {
    const embed = new EmbedBuilder()
      .setColor(this.client.util.color.primary)
      .setAuthor({ name: (this.client.user.tag), iconURL: this.client.user.avatarURL({ size: 1024 }) })
      .setDescription(
        `Want to invite Hammer to your server: [Click here](https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot)\n` +
        `Need support or encountered a bug, join my server: [Click here](https://discord.gg/hammertech)\n`)
    return msg.channel.send({embeds: [embed]});
  }
};
