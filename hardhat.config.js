require("hardhat-klaytn-patch");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("dotenv/config");
require("@nomiclabs/hardhat-etherscan");
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    zodium: {
      url: "http://ec2-52-79-249-69.ap-northeast-2.compute.amazonaws.com:8545",
      accounts: [
        process.env.OWNER,
        process.env.ADDR1,
      ]
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/19630f650f234a8aa67ad8b705f9d9ab",
      accounts: [
        process.env.OWNER,
        process.env.ADDR1,
      ]
    },
    ethmainnet: {
      url: "https://mainnet.infura.io/v3/19630f650f234a8aa67ad8b705f9d9ab",
      accounts: [
        process.env.OWNER,
        process.env.ADDR1,
      ]
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/19630f650f234a8aa67ad8b705f9d9ab",
      accounts: [
        process.env.OWNER,
        process.env.ADDR1,
      ]
    },
    bscmainnet: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: [
        process.env.OWNER,
        process.env.ADDR1,
      ]
    },
    bsctestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: [
        process.env.OWNER,
        process.env.ADDR1,
      ]
    },
    klaytntest: {
      url: "https://api.baobab.klaytn.net:8651",
      accounts: [
        process.env.OWNER,
        process.env.ADDR1,
      ],
      gasPrice: 750000000000,
    }
  },
  gasReporter: {
    currency: 'WON',
    gasPrice: 21
  },
  solidity: {
    compilers: [
      {
        version: "0.5.4",
        optimizer: {
          enabled: true,
          runs: 1000,
        },
      },
      {
        version: "0.8.0",
        optimizer: {
          enabled: true,
          runs: 1000,
        },
      },
      {
        version: "0.8.4",
        optimizer: {
          enabled: true,
          runs: 1000,
        },
      },
      {
        version: "0.5.5",
        optimizer: {
          enabled: true,
          runs: 1000,
        },
      },
      {
        version: "0.6.7",
        optimizer: {
          enabled: true,
          runs: 1000,
        },
        settings: {},
      },
    ],
  },
  etherscan:{
  apiKey: "VTEDGIHRZN5222AD5V2DYB5V8G6DBAXIDG" // etherscan
  // apiKey: "IHH1D4CN7K2Q452TG6FQBQXTXINKP9J12X" // bscscan
  },
  mocha: {
    timeout: 20000
  },
};
