const path = require("path");

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        develop: {
            port: 7545,
            gas: 9000000,
            network_id: 5777
        },
        ewVolta: {
            host: "https://volta-rpc.energyweb.org/",
            port: 8545,
            from: "0x6a6401AEb4a3beb93820904E761b0d86364bb39E", // default address to use for any transaction Truffle makes during migrations
            network_id: 73799,
        },
        ewMainnet: {
            host: "https://rpc.energyweb.org/",
            port: 8545,
            from: "0x6a6401AEb4a3beb93820904E761b0d86364bb39E", // default address to use for any transaction Truffle makes during migrations
            network_id: 246,
        },

        // test: {
        //   port: 7545,
        //   gas: 9000000,
        //   network_id: 4447
        // },
        vertigo_test_network_1: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*"
        },
        vertigo_test_network_2: {
            host: "127.0.0.1",
            port: 8546,
            network_id: "*"
        }
        // test: {
        //   gas: 9000000,
        //   network_id: 4447
        // },
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 1000
        },
    },
    // use native binaries rather than solc.js 
    compilers: {
        solc: {
            version: "0.6.11"
        }
    },
    // plugins: [
    //   'truffle-ganache-test'
    // ],
    // mocha: {
    //   reporter: 'eth-gas-reporter'
    // }
}