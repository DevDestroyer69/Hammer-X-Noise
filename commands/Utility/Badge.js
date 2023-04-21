const Command = require("../../abstract/Command.js");
const { EmbedBuilder } = require('discord.js');

module.exports = class Badge extends Command {
  constructor(client) {
    super(client, {
      name: "badge",
      description: "Shows the badges of the person!",
      category: 'Utility',
      aliases: ["profile", 'pr'],
    });
  }

  async run(msg, args) {
    const supportGuild = this.client.guilds.cache.get("1080767036747161610");
    const profileUser = msg.mentions.members.first() || msg.guild.members?.cache.get(args[0]) || msg.author;
    if(!supportGuild.members.cache.get(profileUser?.id)) return msg.reply({ content: `:x: | Join my support server first to get a badge.`});
    const fetchBadges = supportGuild.members.cache.get(profileUser?.id);
    const arr = [];

    if(fetchBadges.roles.cache.has("1088493604252684288")) arr.push("**<a:AG_CROWN2:1088514518541410314>  Owner**");
    if(fetchBadges.roles.cache.has("1088094977529221121")) arr.push("**<a:AG_CROWN2:1088514518541410314>  Owner**");
    if(fetchBadges.roles.cache.has("1088095821293170729")) arr.push("**<a:developer:1088513291841708202>  Developer**");
    if(fetchBadges.roles.cache.has("1088493921392402432")) arr.push("**<a:developer:1088513291841708202>  Developer**");
    if(fetchBadges.roles.cache.has("1088494123390095370")) arr.push("**<:cyn_Staff:1088515119799074918>  Admin**");
    if(fetchBadges.roles.cache.has("1088494438063558726")) arr.push("**<:sky_staff:1088515211914395770>  Staff**");
    if(fetchBadges.roles.cache.has("1088495452942512218")) arr.push("**<:Badge_bug_hunter_Gold:1088512428289044610>  Bug Hunter**");
    if(fetchBadges.roles.cache.has("1088495611571077170")) arr.push("**<a:early:1088512182402154527>  Supporters**");
    if(fetchBadges.roles.cache.has("1089426401461014558")) arr.push("**<:developer:1089427166648873081> Active Developer**");
    if(fetchBadges.roles.cache.has("1088496322765660272")) arr.push("**<:dollarZ:1088512900395696178>  Donator**");
    if(fetchBadges.roles.cache.has("1088495766919721021")) arr.push("**<:Friendship:1088513949730873425>  Buddies**");

    if(arr.length) {
        return msg.channel.send({ embeds: [{ 
            color: this.client.util.color.success, 
            author: { 
                name: `${fetchBadges.user.username}'s Profile`,
                icon_url: msg.author.displayAvatarURL({ dynamic: true})
            },
            description: `${arr.join('\n')}`,
            thumbnail: { url: msg.author.displayAvatarURL({ dynamic: true})}
        }]})
    } else return msg.channel.send({ 
        embeds: [{ 
            color: this.client.util.color.success, 
            author: { 
                name: `${fetchBadges.user.username}'s Profile`,
                icon_url: msg.author.displayAvatarURL({ dynamic: true})
            },
            description: `Looks like you don't have any badges in Hammer. Join our support server to get some badges [server](https://discord.gg/hammertech)`,
            thumbnail: { url: msg.author.displayAvatarURL({ dynamic: true})}
        }]
    })
  };
};
