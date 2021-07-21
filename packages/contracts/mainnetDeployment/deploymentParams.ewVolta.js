const externalAddrs = {
    // https://data.chain.link/eth-usd
    // CHAINLINK_ETHUSD_PROXY: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    CHAINLINK_ETHUSD_PROXY: "0x0000000000000000000000000000000000000000", // TODO: LINK NOT SUPPORTED ON EWC
    // https://docs.tellor.io/tellor/integration/reference-page
    TELLOR_MASTER: "0x855cCA512c81bfc217EDF8e56ab11211c997fFda", // tellor playground
    // https://uniswap.org/docs/v2/smart-contracts/factory/
    UNISWAP_V2_FACTORY: "0xD44463E5299dC807924Ff94B05aF53b3dF037301", // RJA: Using Carbonswap Address here
    UNISWAP_V2_ROUTER02: "0xbD30A7B53a75dBbA53f4f15af2650bB67A4B3665", // RJA: Using Carbonswap Address here
    WETH_ERC20: "0xDb8B4264b1777e046267b4Cc123f0C9E029cEB2c",
}

const liquityAddrsTest = {
    GENERAL_SAFE: "0x8be7e24263c199ebfcfd6aebca83f8d7ed85a5dd", // Hardhat dev address
    LQTY_SAFE: "0x20c81d658aae3a8580d990e441a9ef2c9809be74", //  Hardhat dev address
    // LQTY_SAFE:"0x66aB6D9362d4F35596279692F0251Db635165871",
    DEPLOYER: "0xC49965F4F6f4eBe512f16916eaAEE8A3d822D03b" // Mainnet test deployment address
}

const liquityAddrs = {
    GENERAL_SAFE: "0x3c198B7f3bA594804aEeA8894d0a58BCc345b8ce", // TODO ?
    LQTY_SAFE: "0xbFdECf1Db5c22d4CD3B0Bb970cF867BEFd2caE27", // TODO ?
    DEPLOYER: "0xC49965F4F6f4eBe512f16916eaAEE8A3d822D03b",
}

const beneficiaries = {
    TEST_INVESTOR_A: "0xdad05aa3bd5a4904eb2a9482757be5da8d554b3d",
    TEST_INVESTOR_B: "0x625b473f33b37058bf8b9d4c3d3f9ab5b896996a",
    TEST_INVESTOR_C: "0x9ea530178b9660d0fae34a41a02ec949e209142e",
    TEST_INVESTOR_D: "0xffbb4f4b113b05597298b9d8a7d79e6629e726e8",
    TEST_INVESTOR_E: "0x89ff871dbcd0a456fe92db98d190c38bc10d1cc1"
}

const OUTPUT_FILE = './mainnetDeployment/ewVoltaDeploymentOutput.json'

const delay = ms => new Promise(res => setTimeout(res, ms));
const waitFunction = async() => {
    return delay(90000) // wait 90s
}

const GAS_PRICE = 1000000000 // 1 Gwei
const TX_CONFIRMATIONS = 1

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