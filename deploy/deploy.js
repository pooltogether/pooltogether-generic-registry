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

    dim(`deploying Generic AddressRegistry contract from ${deployer}`)

    // deploy instance of implementation
    const genericRegistryDeployResult = await deploy('AddressRegistry', {
      args: [],
      from: deployer,
      skipIfAlreadyDeployed: true
    })

    green(`Deployed AddressRegistry: ${genericRegistryDeployResult.address}`)  

}