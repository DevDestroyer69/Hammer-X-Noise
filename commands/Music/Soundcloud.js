const Command = require("../../abstract/Command.js");
const Track = require('../../structures/player/Track');

module.exports = class Soundcloud extends Command {
  constructor(client) {
    super(client, {
      name: "soundcloud",
      description: "Searches tracks on soundcloud",
      category: 'Music',
      example: ["Fearless Pt. II"],
      aliases: ["scsearch"]
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

    if (!memberVoice.joinable) return this.client.send(msg.channel.id, {
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
    if(!dispatcher) return this.client.send(msg.channel.id, {
      embeds: [{
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | There is no song playing, please play a song first!`
      }]
    });
    let voiceSize = msg.guild.members.me.voice.channel ? msg.guild.members.me.voice.channel.members.filter(m => m.user.bot ? !m.user.bot : m).size : 0;

    if (dispatcher && dispatcher.player && voiceSize && dispatcher.player.connection.channelId !== memberVoice.id) return this.client.send(msg.channel.id, {
      embeds: [{
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | You need to be in the same voice channel as me!`
      }]
    });
    else if (dispatcher && dispatcher.player && !voiceSize && !dispatcher.player.connection.channelId !== memberVoice.id) {
      dispatcher.destroy();
    }

    if (!args.length) return this.client.send(msg.channel.id, {
      embeds: [{
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | Provide a query to search!`
      }]
    });

    dispatcher = await this.client.players.handle({
      guildID: msg.guild.id,
      voiceChannelID: memberVoice.id,
      textChannelID: msg.channel.id
    });

    dispatcher.setTextChannel(msg.channel.id);

    if (msg.guild.config.plugins.playerConfig.livePlayer) {
      msg.guild.config.plugins.playerConfig.voiceChannelID = memberVoice.id;
      msg.guild.config.markModified("plugins.playerConfig.voiceChannelID");
      msg.guild.config.save();
    }

    let query = args.join(" ");

    let result;
    let cacheLoad = false;

    let node = this.client.shoukaku.getNode();

    if (this.client.shoukaku.searchResults.has(query) && !this.client.shoukaku.searchResults.get(query).playlist) {
      result = this.client.shoukaku.searchResults.get(query);
      cacheLoad = true;
    }

    else result = await node.rest.resolve(`scsearch:${query}`).catch(() => {
      return this.client.send(msg.channel.id, {
        embeds: [{
          color: this.client.util.color.error,
          description: `${this.client.util.emoji.error} An error occured while searching tracks`
        }]
      });
    });

    if (!result || !result.tracks || (result.tracks && !result.tracks.length)) return this.client.send(msg.channel.id, {
      embeds: [{
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | No results found!`
      }]
    });

    let tracks = result.tracks.slice(0, 9);

    if (result && tracks && tracks.length) {
      if (!cacheLoad) this.client.shoukaku.searchResults.set(query, tracks.shift());

      switch (result.loadType) {
        case "LOAD_FAILED":
          this.client.send(msg.channel.id, {
            embeds: [{
              color: this.client.util.color.error,
              title: `${this.client.util.emoji.error} | Search failed!`,
              description: result.exception.message
            }]
          });
          break;
        case "NO_MATCHES":
          this.client.send(msg.channel.id, {
            embeds: [{
              color: this.client.util.color.error,
              description: `${this.client.util.emoji.error} | No results found!`
            }]
          });
          break;
        case "SEARCH_RESULT":
        case "TRACK_LOADED":
          let embed = await msg.channel.send({
            embeds: [{
              color: this.client.util.color.warning,
              title: `${this.client.util.emoji.search} | Track search`,
              description: tracks.map((track, i) => `\`${++i}.\` ${track.info.title}`).join("\n"),
              footer: { text: `Select a track from 1-${tracks.length} | \`c\` to cancel` }
            }]
          });

          const filter = msg.channel.createMessageCollector(m => { return (msg.author.id === m.author.id) && ((parseInt(m.content) >= 1 && parseInt(m.content) <= tracks.length || m.content.toLowerCase() === 'c'))}, { max: 1, time: 15000, errors: ['time'] })
          filter.on('collect', async x => { 
            if (x.content && isNaN(x.content)) return this.client.send(msg.channel.id, {
              embeds: [{
                color: this.client.util.color.error,
                description: `${this.client.util.emoji.error} | Track selection cancelled`
              }]
            });
            try {
              const entry = x.content.toLowerCase();
  
              if (entry === "c") {
                this.client.send(msg.channel.id, {
                  embeds: [{
                    color: this.client.util.color.error,
                    description: `${this.client.util.emoji.error} | Track selection cancelled`
                  }]
                });
  
                if (x.deletable && !x.deleted) x.delete().catch(() => false);
                if (embed.deletable && !embed.deleted) embed.delete().catch(() => false);
                if (msg.deletable && !msg.deleted) msg.delete().catch(() => false);
              } else if (!isNaN(entry)) {
                if (dispatcher.current) this.client.send(msg.channel.id, {
                  embeds: [{
                    color: this.client.util.color.primary,
                    description: `${this.client.util.emoji.success} | Added to queue ${tracks[entry - 1]?.info.title}`
                  }]
                }).catch(() => false)
  
                dispatcher.queue.push(new Track(tracks[entry - 1], msg.author))
                filter.stop('done');
                if (!dispatcher.playing && !dispatcher.player?.paused && dispatcher.queue?.length) await dispatcher.play();
  
                if (x.deletable && !x.deleted) x.delete().catch(() => false)
                if (msg.deletable && !msg.deleted) msg.delete().catch(() => false);
                if (embed.deletable && !embed.deleted) embed.delete().catch(() => false);
              }
            } catch (e) {
              this.client.logger.error(e);
              if (!dispatcher.current) dispatcher.destroy().catch(() => false)
              if (x.deletable && !x.deleted) x.delete().catch(() => false)
              if (msg.deletable && !msg.deleted) msg.delete().catch(() => false)
              if (embed.deletable && !embed.deleted) embed.delete().catch(() => false)
            }
          }).on('end', async (_, reason) => { 
            if (["time", "cancelled"].includes(reason)) {
              filter.stop('done'); return;
            }
          })
          break;
      }
    }
  }
}