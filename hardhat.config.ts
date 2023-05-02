import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();


// 더 자세한 설정법은 https://hardhat.org/config/ 에서 확인해주세요.
const config: HardhatUserConfig = {
  solidity: "0.8.10",
  networks: {
    klaytn: {
      url: 'https://api.baobab.klaytn.net:8651',
      accounts: ['0x1fdb7fc758de5954f8c84bf7f9f829a3c99d85a45fd0148094bb577a8a5825a1'],
    },
//    mainnet: {
//      url: 'https://api.cypress.klaytn.net:8651',
//      accounts: ['0x1fdb7fc758de5954f8c84bf7f9f829a3c99d85a45fd0148094bb577a8a5825a1'],
//    },  
    baobab: {
      url:'https://api.baobab.klaytn.net:8651',
      httpHeaders: {
        'Authorization': 'Basic ' + Buffer.from('KASKQF9JYCB33FY4BZZDIVKZ' + ':' + 'm8XcBqf00om-kz8BWPxX57nX8FLU9wV2939R9Cyx').toString('base64'),
        'x-chain-id': '1001',
      },
      accounts: [
        '0x1fdb7fc758de5954f8c84bf7f9f829a3c99d85a45fd0148094bb577a8a5825a1'
      ],
      chainId: 1001,
      gas: 8500000,
    },  
    cypress: {
      url: 'https://public-node-api.klaytnapi.com/v1/cypress',
      httpHeaders: {
        'Authorization': 'Basic ' + Buffer.from('KASKQF9JYCB33FY4BZZDIVKZ' + ':' + 'm8XcBqf00om-kz8BWPxX57nX8FLU9wV2939R9Cyx').toString('base64'),
        'x-chain-id': '8217',
      },
      accounts: [
        '0x1fdb7fc758de5954f8c84bf7f9f829a3c99d85a45fd0148094bb577a8a5825a1'
      ],
      chainId: 8217,
      gas: 8500000,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: 'KASKQF9JYCB33FY4BZZDIVKZ',
  },
};

export default config;