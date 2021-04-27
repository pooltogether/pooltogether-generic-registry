require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy')
require('hardhat-deploy-ethers')
require('solidity-coverage')
require('hardhat-abi-exporter')

const networks = require('./hardhat.networks')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers:[
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
          evmVersion: "istanbul"
        }
      },
      {
        version: "0.6.12",
        settings:{
          optimizer: {
            enabled: true,
            runs: 200
          },
          evmVersion:"istanbul"
        }
      }
    ]

  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    MultiSig: {
      default : 0,
      1: "0x77383BaDb05049806d53e9def0C8128de0D56D90",
      4: "0x72c9aA4c753fc36cbF3d1fF6fEc0bC44ad41D7f2"
    },
    genericProxyFactory: {
      1: "0x14e09c3319244a84e7c1E7B52634f5220FA96623",
      4: "0x594069c560D260F90C21Be25fD2C8684efbb5628",
      42: "0x713edC7728C4F0BCc135D48fF96282444d77E604",
      137: "0xd1797D46C3E825fce5215a0259D3426a5c49455C",
      80001: "0xd1797D46C3E825fce5215a0259D3426a5c49455C"
    }
  },
  networks,
  abiExporter: {
    path: './abis',
    clear: true,
    flat: true
  }
};
