const Command = require("../../abstract/Command.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const lodash = require(`lodash`);
module.exports = class Queue extends Command {
  constructor(client) {
    super(client, {
      name: "queue",
      description: "Shows information about the queue, if none returns the information about current playing track",
      category: 'Music',
      aliases: ["q"],
      clientPerms: ["MANAGE_MESSAGES"]
    });
  }

  async run(msg) {

    let dispatcher = this.client.players.get(msg.guild.id);

    const { current } = dispatcher;
    const Duration = this.client.util.formatDuration(current.info.length);
    const queue = dispatcher.queue;

    let songs = queue.map((track,index) => `\`[${index + 1}]\` [${track.info.title.substring(0,50)}](https://discord.gg/hammertech) • ${this.client.util.formatDuration(track.info.length)}`);
    let maps = lodash.chunk(songs,10);
    let pages = maps.map(x => x.join("\n"));
    let page = 0;
    if(!queue.length || queue.length === 1){
	 return msg.channel.send({
        embeds : [
          new EmbedBuilder()
            .setColor(this.client.util.color.primary)
            .setTitle(`${msg.guild.name}'s Queue`)
            .setThumbnail(msg.guild.iconURL({dynamic:true}))
            .setDescription(`**Now Playing** \n > [${dispatcher.current.info.title}](https://discord.gg/hammertech)`)
        ]
      })
}
    if(queue.length < 11)
    {
      return msg.channel.send({
        embeds : [
          new EmbedBuilder()
            .setColor(this.client.util.color.primary)
            .setTitle(`${msg.guild.name}'s Queue`)
            .setThumbnail(msg.guild.iconURL({dynamic:true}))
            .setDescription(`**Now Playing** \n > [${dispatcher.current.info.title}](https://discord.gg/hammertech)\n \n **Coming Up** \n ${pages[page]}`).setFooter({text : `Page ${page + 1} out of ${pages.length}`})
        ]
      })
    }

    let em = new EmbedBuilder()
        .setColor(this.client.util.color.primary)
        .setTitle(`${msg.guild.name}'s Queue`)
        .setThumbnail(msg.guild.iconURL({dynamic:true}))
        .setDescription(`**Now Playing** \n > [${dispatcher.current.info.title}](https://discord.gg/hammertech)\n \n **Coming Up** \n ${pages[page]}`).setFooter({text : `Page ${page + 1} out of ${pages.length}`})

    let b1 = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId(`prev`).setEmoji(`<:hammer_queue:1089554979586592839>`);
    let b2 = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId(`stop`).setEmoji(`<:hammer_stop:1089551042997403668>`);
    let b3 = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId(`next`).setEmoji(`<:hammer_skip:1089554936657887362>`);

    let ro = new ActionRowBuilder().addComponents([b1,b2,b3]);

    let message = await msg.channel.send({
      embeds : [
        em
      ],
      components : [
        ro
      ]
    });

    let collector = await message.createMessageComponentCollector({
      filter :(b) => {
        if(b.user.id === msg.author.id) return true;
        else{
          return b.reply({
            content : `:x: You are not the commmand author`,ephemeral : true
          })
        }
      },
      time : 100000 * 7,
      idle : 100000 * 7 /2 
    });

    collector.on("collect",async(interaction) => {
      if(interaction.isButton())
      {
        if(interaction.customId === `prev`)
        {
          page = page > 0 ? --page : pages.length - 1;
          return interaction.update({
            embeds : [
              new EmbedBuilder()
              .setColor(this.client.util.color.primary)
              .setTitle(`${msg.guild.name}'s Queue`)
              .setThumbnail(msg.guild.iconURL({dynamic:true}))
              .setDescription(`**Now Playing** \n > [${dispatcher.current.info.title}](https://discord.gg/hammertech)\n \n **Coming Up** \n ${pages[page]}`).setFooter({text : `Page ${page + 1} out of ${pages.length}`})
            ]
          })
        }
        if(interaction.customId === `stop`)
        {
          let row = new ActionRowBuilder().addComponents(b1.setDisabled(true),b2.setDisabled(true),b3.setDisabled(true));
          return interaction.update({
            components : [row]
          })
        }
        if(interaction.customId === `next`)
        {
          page = page + 1 < pages.length ? ++page : 0;
          return interaction.update({
            embeds : [
              new EmbedBuilder()
              .setColor(this.client.util.color.primary)
              .setTitle(`${msg.guild.name}'s Queue`)
              .setThumbnail(msg.guild.iconURL({dynamic:true}))
              .setDescription(`**Now Playing** \n > [${dispatcher.current.info.title}](https://discord.gg/hammertech)\n \n **Coming Up** \n ${pages[page]}`).setFooter({text : `Page ${page + 1} out of ${pages.length}`})
            ]
          })
        }
      }
    });

    collector.on("end",() => {
      let row = new ActionRowBuilder().addComponents(b1.setDisabled(true),b2.setDisabled(true),b3.setDisabled(true));
      if(!message) return;
      else message.edit({
        components : [row]
      })
    })



    // const embed = new EmbedBuilder()
    //   .setColor(this.client.util.color.primary)
    //   .setTitle('Now Playing')
    //   .setThumbnail(`https://img.youtube.com/vi/${dispatcher.current.info.identifier}/default.jpg`)
    //   .setDescription(`[${dispatcher.current.info.title}](${dispatcher.current.info.uri}) [${Duration}]`)
    //   .setFooter({text: `• ${dispatcher.queue.length} total songs in queue`});
    // if (queue.length) embed.addFields({ name: 'Up Next', value: (queue.map((track, index) => `**${index + 1}.)** \`${track.info.title}\``).join('\n')) });
    // return msg.channel.send({embeds: [embed]});
  }
};