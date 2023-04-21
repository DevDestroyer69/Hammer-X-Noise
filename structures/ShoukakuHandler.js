const { Shoukaku, Connectors } = require('shoukaku');
const { shoukakuNodes } = require('../lavalinkConf.js');
const { Collection } = require('discord.js');

const options = {
  moveOnDisconnect: false,
  resumable: true,
  resumableKey: 'tysonop',
  resumableTimeout: 30,
  reconnectTries: 2,
  restTimeout: 10000
};

module.exports = class ShoukakuHandler extends Shoukaku {
  constructor(client) {
    super(new Connectors.DiscordJS(client), shoukakuNodes, options)
    this.searchResults = new Collection();
    this.on('ready', (name, resumed) => client.logger.log(`Node: ${name} is now connected`, `This connection is ${resumed ? 'resumed' : 'a new connection'}`));
    this.on('error', (name, error) => client.logger.error(`Node: ${name} ${error ? `\n${error}` : ""}`));
    this.on('close', (name, code, reason) => client.logger.log(`Node: ${name} closed with code ${code}`, reason || 'No reason'));
    this.on('disconnected', (name, reason) => client.logger.log(`Node: ${name} disconnected`, reason || 'No reason'));
  }
}
