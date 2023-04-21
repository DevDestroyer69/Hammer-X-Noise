module.exports = {
  token: "",
  prefix: "&",
  mongoURI: "",
  dbl: "",
  BFD: "",
  owners: [
    { name: "Destroyer", id: "1091708916045467688" },
    { name: "Ziron", id: "893478038107488276" },
    { name: "Sagar", id: "962660734892900404" },
    { name: "Harsh", id: "982960716413825085" }
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
