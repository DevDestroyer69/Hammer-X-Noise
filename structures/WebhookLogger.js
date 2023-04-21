const { WebhookClient } = require('discord.js');

const errorLogs = new WebhookClient({ url: 'https://canary.discord.com/api/webhooks/1087810779522289716/2gREZGYQzb3Kuu2i-8LV42jcK0chsiojdYZEERksUN8cSOeKJ_zj2QyRYT-xsyOpLBvL' });

const guildLogs = new WebhookClient({ url: 'https://canary.discord.com/api/webhooks/1087810019002683565/P4pl85EHEojGqxGGzfoFocMxcA9jzN65M1TFJzcsmKNXv_KimXrYhpeGfZBo2bqn88SE' });

class WebhookLogger {
    constructor(client) {
        this.client = client;
    }

    guild(data) {
        guildLogs.send({content: typeof data === 'string' ? data : '\u200B', embeds: [typeof data === 'object' ? [data] : []]});
      return true;
    };

    error(data) {
        errorLogs.send({content: typeof data === 'string' ? data : '\u200B', embeds: [typeof data === 'object' ? [data] : []]});
      return true
    };

};

module.exports = WebhookLogger;