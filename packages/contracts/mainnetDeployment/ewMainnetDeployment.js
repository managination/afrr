const configParams = require("./deploymentParams.ewMainnet.js")
const { mainnetDeploy } = require('./mainnetDeployment.js')

async function main() {
    await mainnetDeploy(configParams)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });