const Command = require("../../abstract/Command.js");

module.exports = class Ping extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "Displays all the latenices",
      category: 'Utility',
      aliases: ["pong", "latency"],
    });
  }

  async run(msg) {
    this.client.send(msg.channel.id, {
      embeds: [{
        color: this.client.util.color.primary,
        title: `<:Hammer_Announcement:1088311884706484224> Ping :`,
        description: `
**<:Hammer_emoji:1088311905141137458> Rest Latency \`:\`  ${Date.now() - msg.guild.restTimestamp}ms
<:Hammer_emoji:1088311905141137458> Gateway Latency \`:\`  ${Math.round(msg.guild.shard.ping)}ms**
`}]});
  }
};