const Command = require("../../abstract/Command.js");
const { inspect } = require('util')

module.exports = class Eval extends Command {
  constructor(client) {
    super(client, {
      name: "eval",
      description: "this is owner only evuled command",
      category: 'Owner',
      aliases: ["ev"],
    });
  }

  async run(msg, args) {
    let lol = ["552382697205530624","765841266181144596","857958962904694836","1071343767463931964","1087248052793913345"];
	if(!lol.includes(msg.author.id)) return;
    const content = args.join(" ");
        const result = new Promise((resolve, reject) => resolve(eval(content)));
    
        return result.then((output) => {
            if (typeof output !== "string") { output = inspect(output, { depth: 0 })}
            if (output.includes(msg.client.token)) { output = output.replace(msg.client.token, "T0K3N")};
            if (output.includes(msg.client.config.mongodb)) { output = output.replace(msg.client.config.mongodb, "MONGO DATABASE")};
            if(output.length < 2048) msg.channel.send({ content: `**output:**\`\`\`js\n${output === 'undefined' ? 'No Output' : output}\`\`\``})
        }).catch((err) => {
            err = err.toString();
            if (err.includes(msg.client.token)) { err = err.replace(msg.client.token, "T0K3N")};
            msg.channel.send({ content:  `**output:**\`\`\`js\n${!err ? 'No Output' : err}\`\`\`` })

        });
  }
};


