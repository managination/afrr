const externalAddrs = {
    // https://data.chain.link/eth-usd
    // CHAINLINK_ETHUSD_PROXY: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    CHAINLINK_ETHUSD_PROXY: "0x0000000000000000000000000000000000000000", // We will deploy our own ChainLinkBypass contract (which calls Tellor) and connect to that, so no address is needed here
    // https://docs.tellor.io/tellor/integration/reference-page
    TELLOR_MASTER: "0x855cCA512c81bfc217EDF8e56ab11211c997fFda", // tellor playground
    // https://uniswap.org/docs/v2/smart-contracts/factory/
    UNISWAP_V2_FACTORY: "0xD44463E5299dC807924Ff94B05aF53b3dF037301", // Using Carbonswap Address here
    UNISWAP_V2_ROUTER02: "0xbD30A7B53a75dBbA53f4f15af2650bB67A4B3665", // Using Carbonswap Address here
    WETH_ERC20: "0xDb8B4264b1777e046267b4Cc123f0C9E029cEB2c"
}

const liquityAddrs = {
    GENERAL_SAFE: "0x1095C1c3CbF6F5fc9225cda21c822b240DB91dD7", // Volta Acct 2
    LQTY_SAFE: "0x0D0149cd10a0aA6AD4c7b2819AF0F1044E6bf0A8", // Volta MultiSig Wallet
    DEPLOYER: "0xC49965F4F6f4eBe512f16916eaAEE8A3d822D03b", // Volta Acct 3
}

// EWC deployment will not use lockup/beneficiaries, so emptying this object causes the lockup contracts to not be created (i.e., the lockup factory is still created, but never used)
const beneficiaries = {}

const OUTPUT_FILE = './mainnetDeployment/ewVoltaDeploymentOutput.json'

const delay = ms => new Promise(res => setTimeout(res, ms));
const waitFunction = async() => {
    return delay(90000) // wait 90s
}

const GAS_PRICE = 0.01 * 10 ** 9 // Gwei
const TX_CONFIRMATIONS = 3
const EWT_EEUR_TELLOR_PAIR_ID = 1

// We don't have etherscan on ewc/volta, it uses blockscout, which doesn't have a verification API either, so setting this empty turns off auto contract valication by hardhat deploy script
const ETHERSCAN_BASE_URL = ''

module.exports = {
    externalAddrs,
    liquityAddrs,
    beneficiaries,
    OUTPUT_FILE,
    waitFunction,
    GAS_PRICE,
    EWT_EEUR_TELLOR_PAIR_ID,
    TX_CONFIRMATIONS,
    ETHERSCAN_BASE_URL,
};