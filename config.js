module.exports = {
  token: "MTA4NzczNDQwNDI1Mzc0OTM3OQ.G3vgNf.ALUJ60NOfUSeQpcZ03FyG0iC8agdaKnjZIrego",
  prefix: "&",
  mongoURI: "mongodb+srv://hammer:oZfyBHxRJ5yA9l00@hammer.qwukouw.mongodb.net/hammerDatabase?retryWrites=true&w=majority",
  dbl: "",
  BFD: "",
  owners: [
    { name: "Void", id: "857958962904694836" },
    { name: "Nitro", id: "552382697205530624" },
    { name: "Zeus", id: "903713389749088317" },
    { name: "Viper", id: "1035438706351419514" },
    { name : `Punit`, id : "765841266181144596"}
  ],
  supporter: [
    { name: ".", id: "979400321870737490" },
    { name: "..", id: "1085976714687037493" }
  ],
  supportServer: (code) => `https://discord.gg/${code}`,
  inviteURL: (id) => `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=8&scope=bot`,
  credentials: {
    spotify: {
      clientID: "ce960e609de2441b8187389e71e8f083",
      clientSecret: "852600ebe6964b73b1ec7ac3c3d11b9d"
    }
  },
  timers: {
    playerDeployer: 10000,
    checkQueueDelay: 20000,
    memorySweeper: 60000 * 15,
  },
  regex: {
    spotify: /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track)(?:[/:])([A-Za-z0-9]+).*$/,
    youtube: /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/,
    channel: /<#(\d{17,19})>/
  }
}
