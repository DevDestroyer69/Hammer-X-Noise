const Queue = require('./Queue');
const Track = require('./Track');
const { WebhookClient, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const nodeStatus = new WebhookClient({ url: 'https://canary.discord.com/api/webhooks/1087808547187859627/woip2VsA9L-eK_0GW-6meoBcwWnPQh3pP7cp8eybwOQkA_eEHQUgHBfH6qH23YNi4dLY' });

const Filter = require('./Filter');

module.exports = class TysonDispatcher {
  constructor({ client, guildID, textChannelID, voiceChannelID, node, player, guildData, livePlayer }) {
    this.client = client;
    this.guildID = guildID;
    this.textChannelID = textChannelID;
    this.voiceChannelID = voiceChannelID;
    this.node = node;
    this.player = player;
    this.guildData = guildData;
    this.queue = new Queue(this);
    this.current = this.queue.current;
    this.previous = [];
    this.skips = new Set();
    this.trackRepeat = false;
    this.queueRepeat = false;
    this.queueEnded = false;
    this.playing = false;
    this.currentPosition = 0;
    this.triggeredClosed = false;
    this.autoPlay = false;

    this.filter = new Filter(this.player);

    this.livePlayer = livePlayer;
    this.checkTime = Date.now() + 60000 * 3;

    if (this.player) this.firePlayerEvents();
  }

  get exists() {
    return this.client.players.has(this.guildID);
  }

  get isPlaying() {
    return this.exists && this.playing;
  }

  get isQueueEmpty() {
    return !this.queue.length && !this.current && !this.trackRepeat && !this.queueRepeat;
  }

  checkCache() {
    let check = this.client.shoukaku.getNode([...this.client.shoukaku.nodes.values()].filter(n => n.players.has(this.guildID)));
    if (check) check.players.get(this.guildID).connection.disconnect();
  }

  setTextChannel(channel) {
    this.textChannelID = channel;
  }

  setPlayer(player) {
    this.player = player;
  }

  voteSkip(userID) {
    this.skips.add(userID);
    return this.skips.size;
  }

  setTrackRepeat(value) {
    if (typeof value !== "boolean") throw new RangeError(`Player#setTrackRepeat(), Value must be true or false`);

    if (value) {
      this.trackRepeat = true;
      this.queueRepeat = false;
    } else {
      this.trackRepeat = false;
      this.queueRepeat = false;
    }
  }

  setQueueRepeat(value) {
    if (typeof value !== "boolean") throw new RangeError(`Player#setQueueRepeat(), Value must be true or false`);

    if (value) {
      this.trackRepeat = false;
      this.queueRepeat = true;
    } else {
      this.trackRepeat = false;
      this.queueRepeat = false;
    }
  }

  storePosition(reason) {
    if (reason) return this.currentPosition;
    this.interval = setInterval(() => {
      if (this.player && this.current) this.currentPosition = this.player.position;
    }, 5000);
  }

  stop() {
    if (!this.exists) this.destroy();

    //this.current = null;
    this.skips.clear();
    this.player.stopTrack();
  }

  async pause(value = true) {
    await this.player.setPaused(value);
    return true;
  }

  async startAutoPlay() {
    if (!this.previous.length) return;
    let baseTrack;
    if (this.previous.length > 0) baseTrack = this.previous.shift();
    else if (this.previous.length > 1) baseTrack = this.previous.pop();
    let searchURI = `https://www.youtube.com/watch?v=${baseTrack.info.identifier}&list=RD${baseTrack.info.identifier}`;
    let search = await this.node.rest.resolve(searchURI).catch(e => this.client.logger.debug("Autoplay", e));
    if (!search) return;
    if (["LOAD_FAILED", "NO_MATCHES"].includes(search.loadType)) return;
    let tracks = search.tracks.slice(1, 5);
    for (let track of tracks) this.queue.push(new Track(track, this.client.user, true));
    if (!this.playing && !this.player.paused && this.queue.length) this.play();
  }

  async play() {
    if (!this.exists) return this.destroy();

    if (this.queueEnded) {
      this.queue.shift();
      this.queueEnded = false;
    }

    const track = this.previous[this.previous.length - 1];

    if (this.trackRepeat && track) {
      this.current = track;

      await this.player.playTrack({ track: this.current.track })//.setVolume(0.4)
      this.playing = true;
    } else if (this.queueRepeat && (this.queue.length || track)) {
      if (track) this.queue.push(track);

      this.current = this.queue.shift();

      await this.player.playTrack({ track: this.current.track })//.setVolume(0.4)
      this.playing = true;
    } else if (this.queue.length) {
      this.current = this.queue.shift();
      await this.player.playTrack({ track: this.current.track })//.setVolume(0.4)
      this.playing = true;
    } else {
      if (this.current) {
        this.queue.unshift(this.current);
        this.current = null;
        this.queueEnded = true;
      }

      if (this.live) return this;

      this.destroy();
    }
  }

  async destroy(reason) {
    if (!this.exists) return;

    if (reason === "EMPTY_QUEUE") {
      await this.client.util.delay(this.client.config.timers.checkQueueDelay);

      if (!this.isQueueEmpty) return;

      clearInterval(this.interval);

      this.client.send(this.textChannelID, {
        embeds: [{
          description: "My Playlist Is Empty.",
          color: this.client.util.color.primary
        }]
      });
      if (this.livePlayer) return;
      return this.destroy();
    } else if (reason === "COMPLETE" || !reason) {
      this.queue.clear();
      if (this.player) this.player.connection.disconnect();
      this.checkCache();
      this.client.players.delete(this.guildID);
    }
  }

  firePlayerEvents() {
    if (!this.player) return;

    /* Fires when a track starts playing */
    this.player.on("start", async () => {
      if (this.trackRepeat || this.queueRepeat) return;
      if (this.current) {
        this.storePosition();
        this.client.send(this.textChannelID, {
          embeds: [
            new EmbedBuilder()
              .setColor(this.client.util.color.primary)
              .setDescription(`${this.current.info.title || 'No title available.'} \`:\` ${this.current.requestedBy.mention}`)
              .setAuthor({ name: " | Now Playing", iconURL: this.client.util.assets.clientPicture })
              .setThumbnail(`https://i.ytimg.com/vi/${this.current.info.identifier}/default.jpg`)
          ],
          components : [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId(`p1`).setEmoji(`<:hammer_pause:1089550993731096646>`),
              new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId(`p2`).setEmoji(`<:hammer_stop:1089551042997403668>`),
              new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId(`p3`).setEmoji(`<:hammer_loop:1089554839027077180>`),
              new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId(`p4`).setEmoji(`<:hammer_skip:1089554936657887362>`)
            )
          ]
        }).catch(e => this.logger.error(e));
      }

      if (Date.now() > this.checkTime) {
        this.checkTime = 7.2e+6;
        let channel = this.client.channels.cache.get(this.textChannelID);
        let m = await channel.send({
          embeds: [{
            color: this.client.util.color.primary,
            description: `Enjoying using Hammer, Join us on our support server. [Click here](https://discord.gg/hammertech) to Join`
          }]
        });
        await this.client.util.delay(20000);
        m.delete();
      }
    });

    /* Fires when a track ends */
    this.player.on("end", () => {
      if (this.triggeredClosed) return;
      this.previous.push(this.current);
      this.current = null;
      this.skips.clear();
      this.playing = false;

      if (!this.current && !this.queue.length && this.autoPlay) this.startAutoPlay();

      if (this.isQueueEmpty) return this.destroy("EMPTY_QUEUE");

      this.play()
        .catch(e => {
          this.client.logger.error(e);
          this.destroy();
        });
    });

    this.player.on("trackException", e => {
      if (!this.current.info.playlist) this.client.send({
        embeds: [{
          color: this.client.util.color.error,
          description: `This track cannot be played: ${e.error}`
        }]
      });

      this.client.logger.debug(`TrackException`, e);
      if (e.error === "This IP address has been blocked by YouTube (429).") {
        if (nodeStatus) nodeStatus.send({ content: `${this.node.name}, has been blocked by YouTube for 1 week` });
        this.client.shoukaku.removeNode(this.node.name, "This node has been banned");
      }
    });

    this.player.on("closed", async payload => {
      if (payload.code === 4014) return this.destroy();

      this.triggeredClosed = true;

      let position = this.storePosition("GET");

      await this.client.util.delay(2000);

      if (this.player) {
        let reconnectedPlayer = await this.player.connection.connect({
          voiceChannelID: this.voiceChannelID,
          forceReconnect: true
        }).catch(e => {
          if (!["The voice connection is not established in 15 seconds", "This player is not yet connected, please wait for it to connect"].includes(e.message)) {
            this.client.logger.error(e);
            this.destroy();
          }
        });

        if (reconnectedPlayer) {
          reconnectedPlayer.resume();
          if (!this.player) this.player = reconnectedPlayer;
          await this.client.util.delay(3000);
          if (this.player) this.player.seekTo(position);
          this.triggeredClosed = false;
        }
      }
    });
    this.player.on("error", e => {
      this.client.logger.error(e);
      this.destroy();
    });

  }

  async loadTracks(trackData) {

    if (!this.player) this.destroy();

    if (!this.client.shoukaku.nodes.size) return;

    let { msg, searchData, node, playlist, tracks: spotifyTracks } = trackData;

    node = node || this.client.shoukaku.getNode();

    let results = this.client.shoukaku.searchResults;
    let cacheLoad = false;

    let result = null;

    if (msg.attachments.size) {
      let result = await node.rest.resolve(msg.attachments.first().proxyURL);

      switch (result.loadType) {
        case 'TRACK_LOADED':
        case 'SEARCH_RESULT':
          if (this.current) this.client.send(this.textChannelID, {
            embeds: [{
              color: this.client.util.color.primary,
              description: `${this.client.util.emoji.success} Added to queue | ${result.tracks[0].info.title}`
            }]
          });
          this.queue.push(new Track(result.tracks[0], msg.author));
          if (!this.playing && !this.player.paused && this.queue.length) await this.play();
          return;
      }
    }

    if (results.has(searchData.toLowerCase()) && !results.get(searchData.toLowerCase()).playlist) {
      result = results.get(searchData.toLowerCase());
      cacheLoad = true;
    } else result = await node.rest.resolve(this.client.util.validateURL(searchData) ? searchData : `${searchData}`);

    if (!result) return this.client.send(this.textChannelID, {
      embeds: [{
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | No results found!`
      }]
    });

    if (result && result.tracks && result.tracks.length) {
      if (!cacheLoad && result.loadType === "SEARCH_RESULT") results.set(searchData.toLowerCase(), result);

      let { loadType, tracks, playlistInfo: { name } } = result;

      switch (loadType) {
        case "LOAD_FAILED":
          this.client.send(this.textChannelID, {
            embeds: [{
              color: this.client.util.color.error,
              title: `${this.client.util.emoji.error} | Search failed!`,
              description: result.exception.message
            }]
          });
          break;
        case "NO_MATCHES":
          this.client.send(this.textChannelID, {
            embeds: [{
              color: this.client.util.color.error,
              description: `${this.client.util.emoji.error} | No results found!`
            }]
          });
          break;
        case "PLAYLIST_LOADED":
          for (let track of tracks) this.queue.push(new Track(track, msg.author, true));
          this.client.send(this.textChannelID, {
            embeds: [{
              color: this.client.util.color.primary,
              title: `${this.client.util.emoji.success} | Added to queue ${name}`,
              description: `Total \`${tracks.length}\` are Added to queue`
            }]
          });

          if (!this.playing && !this.player.paused && this.queue.length) await this.play();
          break;
        case "SEARCH_RESULT":
        case "TRACK_LOADED":
          this.queue.push(new Track(result.tracks[0], msg.author));
          if (this.current) this.client.send(this.textChannelID, {
            embeds: [{
              color: this.client.util.color.primary,
              description: `${this.client.util.emoji.success} | Added to queue ${tracks[0].info.title}`
            }]
          });
          if (!this.playing && !this.player.paused && this.queue.length) await this.play();
          break;
      }
      if (!this.playing && !this.player.paused && this.queue.length) await this.play();
    }
  };
};
