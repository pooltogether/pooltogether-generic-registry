const { deployMockContract } = require('ethereum-waffle')
const { expect } = require('chai')
const hre = require('hardhat')

const SENTINAL = '0x0000000000000000000000000000000000000001'

let overrides = { gasLimit: 200000000 }

describe('GenericContractRegistry', function() {


  let wallet, wallet2, wallet3, wallet4
  let addressRegistry;


  let contract1, contract2, contract3
  let prizeStrategy

  before(async () => {

    [wallet, wallet2, wallet3, wallet4] = await hre.ethers.getSigners()
    const contractRegistryContractFactory = await hre.ethers.getContractFactory("AddressRegistry", wallet, overrides)
    addressRegistry = await contractRegistryContractFactory.deploy()
    

    const PrizePool = await hre.artifacts.readArtifact("PrizePool")
    contract1 = await deployMockContract(wallet, PrizePool.abi, overrides)
    contract2 = await deployMockContract(wallet, PrizePool.abi, overrides)
    contract3 = await deployMockContract(wallet, PrizePool.abi, overrides)
    
    const PeriodicPrizeStrategy = await hre.artifacts.readArtifact("PeriodicPrizeStrategy")
    prizeStrategy = await deployMockContract(wallet, PeriodicPrizeStrategy.abi, overrides)
 
    await contract1.mock.prizeStrategy.returns(prizeStrategy.address)
    await contract2.mock.prizeStrategy.returns(prizeStrategy.address)

  })

  describe('Owner able to add/remove prize pools to the registry', () => {
    
    it('initializes the registry', async () => {
      await expect(addressRegistry.initialize("prizePools", wallet.address))
      .to.emit(addressRegistry, "OwnershipTransferred")
      expect(await addressRegistry.addressType()).to.equal("prizePools")
    })

    it('adds Addresses to the registry', async () => {
      await expect(addressRegistry.addAddresses([contract1.address, contract2.address]))
      .to.emit(addressRegistry, "AddressAdded")
      .withArgs(contract1.address)
    })

    it('returns all contract addresses registered', async () => {
      const resultArr = await addressRegistry.callStatic.getAddresses()
      expect(resultArr).to.deep.equal([contract2.address, contract1.address])
    })

    it('removes a contract from the registry', async () => {
      await expect(addressRegistry.removeAddress(contract2.address, contract1.address))
      .to.emit(addressRegistry, "AddressRemoved").withArgs(contract1.address)
    })

    it('reverts when non-owner tries to add a contract', async () => {
      await expect(addressRegistry.connect(wallet2).addAddresses([prizeStrategy.address])).to.be.revertedWith("Ownable: caller is not the owner")    
    })
    
    it('reverts when non-owner tries to remove a contract', async () => {
      await expect(addressRegistry.connect(wallet2).removeAddress(prizeStrategy.address, SENTINAL)).to.be.revertedWith("Ownable: caller is not the owner")    
    })

    it('reverts when contract already added', async () => {      
      await addressRegistry.addAddresses([contract3.address])
      await expect(addressRegistry.addAddresses([contract3.address])).to.be.revertedWith("Already added")    
    })

  })

});
