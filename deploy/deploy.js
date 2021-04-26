const chalk = require('chalk');
const { getChainId } = require('hardhat');
// const { factoryDeploy } = require('@pooltogether-proxy-factory-package')


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
    const genericRegistryDeployResult = await deploy('ContractRegistry', {
      args: [],
      from: deployer,
      skipIfAlreadyDeployed: true
    })

    green(`Deployed GenericRegistry: ${genericRegistryDeployResult.address}`)  

    // can then use factoryDeploy()

}