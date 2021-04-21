const chalk = require('chalk');
const { getChainId } = require('hardhat');

function dim() {
  console.log(chalk.dim.call(chalk, ...arguments))
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments))
}


module.exports = async (hardhat) => {

    dim("running deploy script")

    dim("network id ", await getChainId())

    const { getNamedAccounts, deployments, ethers } = hardhat
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    dim(`deploying GenericRegistry contract from ${deployer}`)

    // use GenericProxyFactory deploy function?

    const registryContractName = "PrizePools" // for example

    const genericRegistryDeployResult = await deploy('GenericRegistry', {
      args: [registryContractName],
      from: deployer,
      skipIfAlreadyDeployed: false
    })

    
    green(`Deployed GenericRegistry: ${genericRegistryDeployResult.address}`)  

}