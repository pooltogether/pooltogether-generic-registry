const { deployMockContract } = require('ethereum-waffle')
const { expect } = require('chai')
const hre = require('hardhat')

const SENTINAL = '0x0000000000000000000000000000000000000001'

let overrides = { gasLimit: 200000000 }

describe('GenericContractRegistry', function() {


  let wallet, wallet2, wallet3, wallet4
  let contractRegistry;


  let contract1, contract2
  let prizeStrategy

  before(async () => {

    [wallet, wallet2, wallet3, wallet4] = await hre.ethers.getSigners()
    const contractRegistryContractFactory = await hre.ethers.getContractFactory("ContractRegistry", wallet, overrides)
    contractRegistry = await contractRegistryContractFactory.deploy()
    

    const PrizePool = await hre.artifacts.readArtifact("PrizePool")
    contract1 = await deployMockContract(wallet, PrizePool.abi, overrides)
    contract2 = await deployMockContract(wallet, PrizePool.abi, overrides)
    
    const PeriodicPrizeStrategy = await hre.artifacts.readArtifact("PeriodicPrizeStrategy")
    prizeStrategy = await deployMockContract(wallet, PeriodicPrizeStrategy.abi, overrides)
 
    await contract1.mock.prizeStrategy.returns(prizeStrategy.address)
    await contract2.mock.prizeStrategy.returns(prizeStrategy.address)

  })

  describe('Owner able to add/remove prize pools to the registry', () => {
    it('adds Contracts to the registry', async () => {
      await expect(contractRegistry.addContracts([contract1.address, contract2.address]))
      .to.emit(contractRegistry, "ContractAdded")
      .withArgs(contract1.address)
    })

    it('returns all contract addresses registered', async () => {
      const resultArr = await contractRegistry.callStatic.getContracts()
      expect(resultArr).to.deep.equal([contract2.address, contract1.address])
    })

    it('removes a contract from the registry', async () => {
      await expect(contractRegistry.removeContract(contract2.address, contract1.address))
      .to.emit(contractRegistry, "ContractRemoved").withArgs(contract1.address)
    })

    it('reverts when non-owner tries to add a contract', async () => {
      await expect(contractRegistry.connect(wallet2).addContracts([prizeStrategy.address])).to.be.revertedWith("Ownable: caller is not the owner")    
    })
    
    it('reverts when non-owner tries to remove a contract', async () => {
      await expect(contractRegistry.connect(wallet2).removeContract(prizeStrategy.address, SENTINAL)).to.be.revertedWith("Ownable: caller is not the owner")    
    })

    // it('reverts when contract already added', async () => {      
    //   console.log("all contracts ", await contractRegistry.getContracts())
    //   console.log("adding ", contract2.address)
    //   await expect(contractRegistry.addContracts([contract2.address])).to.be.revertedWith("Already added")    
    // })

  })

});
