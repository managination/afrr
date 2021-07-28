const externalAddrs = {
    // https://data.chain.link/eth-usd
    // CHAINLINK_ETHUSD_PROXY: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    CHAINLINK_ETHUSD_PROXY: "0x0000000000000000000000000000000000000000", // RJA: We will deploy our own ChainLinkBypass contract (which calls Tellor) and connect to that, so no address is needed here
    // https://docs.tellor.io/tellor/integration/reference-page
    TELLOR_MASTER: "0x55553e916DCe04d91Ac9E45c71CEaFFA4317FDFB", // tellor playground
    // https://uniswap.org/docs/v2/smart-contracts/factory/
    UNISWAP_V2_FACTORY: "0x17854c8d5a41d5A89B275386E24B2F38FD0AfbDd", // RJA: Using Carbonswap Address here
    UNISWAP_V2_ROUTER02: "0x3b932c3f73A9Eb6836Cd31145F2D47561e21DeCB", // RJA: Using Carbonswap Address here
    WETH_ERC20: "0x6b3bd0478DF0eC4984b168Db0E12A539Cc0c83cd",
}

const liquityAddrs = {
    GENERAL_SAFE: "0x3c198B7f3bA594804aEeA8894d0a58BCc345b8ce", // TODO RJA: GET FROM MICHA
    LQTY_SAFE: "0xbFdECf1Db5c22d4CD3B0Bb970cF867BEFd2caE27", // TODO RJA: GET FROM MICHA
    DEPLOYER: "0xC49965F4F6f4eBe512f16916eaAEE8A3d822D03b",
}

// RJA: EWC deployment will not use lockup/beneficiaries, so emptying this object causes the lockup contracts to not be created (i.e., the lockup factory is still created, but never used)
const beneficiaries = {}

const OUTPUT_FILE = './mainnetDeployment/ewMainnetDeploymentOutput.json'

const delay = ms => new Promise(res => setTimeout(res, ms));
const waitFunction = async() => {
    return delay(90000) // wait 90s
}

const GAS_PRICE = 1000000000 // 1 Gwei
const TX_CONFIRMATIONS = 3

// RJA We don't have etherscan on ewc/volta, it uses blockscout, which doesn't have a verification API either, so setting this empty turns off auto contract valication by hardhat deploy script
const ETHERSCAN_BASE_URL = ''

module.exports = {
    externalAddrs,
    liquityAddrs,
    beneficiaries,
    OUTPUT_FILE,
    waitFunction,
    GAS_PRICE,
    TX_CONFIRMATIONS,
    ETHERSCAN_BASE_URL,
};