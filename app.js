const { BaseCluster } = require('kurasuta');

module.exports = class extends BaseCluster {
	launch() {
		this.client.login();
	}
};

process.on('uncaughtException', err => console.error(err.stack));
process.on('unhandledRejection', err => console.error(err.stack));