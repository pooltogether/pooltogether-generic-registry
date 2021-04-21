const chalk = require('chalk');
const { getChainId } = require('hardhat');

function dim() {
  console.log(chalk.dim.call(chalk, ...arguments))
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments))
}


module.exports = async (hardhat) => {

    console.log("running deploy script")

    console.log("network id ", await getChainId())

    const { getNamedAccounts, deployments, ethers } = hardhat
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    dim(`deploying GenericRegistry contract from ${deployer}`)
    const prizePoolRegistry = await deploy('PrizePoolRegistry', {
      args: [],
      from: deployer,
      skipIfAlreadyDeployed: false
    })
    green(`Deployed GenericRegistry: ${prizePoolRegistry.address}`)  

}