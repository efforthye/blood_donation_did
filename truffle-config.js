const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

const { API_URI, PRIVATE_KEY, MNEMONIC, API_KEY, POLYGON_SCAN_KEY } = process.env;
// console.log({API_URI, PRIVATE_KEY});

module.exports = {
    development: {
        host: '127.0.0.1', // Localhost (default: none)
        port: 8545, // Standard Ethereum port (default: none)
        network_id: '*', // Any network (default: none)
    },
    networks: {
        polygon_mainnet: {
            provider: () => new HDWalletProvider(PRIVATE_KEY.toString(), API_URI),
            network_id: 137,
            gasPrice: 200000000000, // 200GWei
            gasLimit: 300, // 최대 가스 한도
            gas: 12000000, // 컨트랙트 배포 시 지불하는 가스 설정, 배포 시 1.1 Matic 정도 소모됨, 엄청 느림
        },
    },
    compilers: {
        solc: {
            version: '0.8.4', // 0.8.19 Fetch exact version from solc-bin (default: truffle's version)
        },
    },
    plugins: ['truffle-plugin-verify'],
    api_keys: {
      polygon_scan: POLYGON_SCAN_KEY,
    }
};