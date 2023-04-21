const Command = require("../../abstract/Command.js");

module.exports = class Play extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      description: "Play a song, or add it to the queue if there's already one playing.",
      category: 'Music',
      aliases: ["p"],
      usage: ["<song-title/link>"],
      example: [
        "Neffex Cold"
      ]
    });
  }

  async run(msg, args) {
    let memberVoice = msg.member.voice.channel;

    if (!memberVoice) return this.client.send(msg.channel.id, {
      embeds: [{
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | You must be in a voice channel to use this command!`
      }]
    });

    if (!memberVoice.joinable) return (msg.channel.id, {
      embeds: [{
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | I don't have permission to connect to ${memberVoice.toString()}`
      }]
    });

    if (memberVoice.constructor.name !== "StageChannel" && !memberVoice.speakable) return this.client.send(msg.channel.id, {
      embeds: [{
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | I don't have permission to speak in ${memberVoice.toString()}`
      }]
    });

    let dispatcher = this.client.players.get(msg.guild.id);

    let voiceSize = msg.guild.members.me.voice.channel ? msg.guild.members.me.voice.channel.members.filter(m => m.user.bot ? !m.user.bot : m).size : 0;

    if (dispatcher && dispatcher.player && voiceSize && dispatcher.player.connection.channelId !== memberVoice.id) return this.client.send(msg.channel.id, {
      embeds: [{
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | You need to be in the same voice channel as me!`
      }]
    });
    else if (dispatcher && dispatcher.player && !voiceSize && dispatcher.player.connection.channelId !== memberVoice.id) {
      if (dispatcher && dispatcher.player && dispatcher.player.connection) dispatcher.destroy();
    }

    if (!args.length && dispatcher && dispatcher.player && dispatcher.player.paused) return dispatcher.pause(false);

    if (!args.length && !msg.attachments.size) return this.client.send(msg.channel.id, {
      embeds: [{
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | Provide a query to search!`
      }]
    });

    let playerOptions = {
      guildID: msg.guild.id,
      voiceChannelID: memberVoice.id,
      textChannelID: msg.channel.id,
      shardId: msg.guild.shardId || 0
    };

    const player = this.client.players;

    if (msg.guild.config.plugins.playerConfig.livePlayer) {
      msg.guild.config.plugins.playerConfig.voiceChannelID = memberVoice.id;
      msg.guild.config.markModified("plugins.playerConfig.voiceChannelID");
      msg.guild.config.save();
    }

    if (dispatcher && !dispatcher.playing && dispatcher.player && dispatcher.player.paused && dispatcher.current) await dispatcher.play();

    if (msg.attachments.size) return player.handle(playerOptions, { msg });

    if (args.length) {
      let query;
      if (this.client.util.validateURL(args.join(' '))) query = (args.join(" "))
      else query = `ytsearch:${args.join(" ")}`
      await player.handle(playerOptions, { msg, searchData: query, node: null })
    }
  }
};