const { deployMockContract } = require('ethereum-waffle')
const { expect } = require('chai')
const hre = require('hardhat')
const { TASK_COMPILE_SOLIDITY_HANDLE_COMPILATION_JOBS_FAILURES } = require('hardhat/builtin-tasks/task-names')
const { ethers } = require('hardhat')

const SENTINAL = '0x0000000000000000000000000000000000000001'

let overrides = { gasLimit: 200000000 }

describe('GenericContractRegistry', function() {


  let wallet, wallet2, wallet3, wallet4
  let addressRegistry;


  let contract1, contract2, contract3
  let prizeStrategy

  beforeEach(async () => {

    [wallet, wallet2, wallet3, wallet4] = await hre.ethers.getSigners()
    const contractRegistryContractFactory = await hre.ethers.getContractFactory("AddressRegistry", wallet, overrides)
    addressRegistry = await contractRegistryContractFactory.deploy("prizePools", wallet.address)
    
    

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
      expect(await addressRegistry.addressType()).to.equal("prizePools")
    })

    it('adds Addresses to the registry', async () => {
      await expect(addressRegistry.addAddresses([contract1.address, contract2.address]))
      .to.emit(addressRegistry, "AddressAdded")
      .withArgs(contract1.address)
    })

    it('returns all contract addresses registered', async () => {
      await addressRegistry.addAddresses([contract1.address, contract2.address])
      const resultArr = await addressRegistry.callStatic.getAddresses()
      expect(resultArr).to.deep.equal([contract2.address, contract1.address])
    })

    it('checks if an address exists in the list', async () => {
      await addressRegistry.addAddresses([contract1.address, contract2.address])
      const resultArr = await addressRegistry.callStatic.contains(contract2.address)
      expect(resultArr).to.equal(true)
    })
    
    it('checks that an address does not exist in the list', async () => {
      await addressRegistry.addAddresses([contract1.address])
      const resultArr = await addressRegistry.callStatic.contains(contract2.address)
      expect(resultArr).to.equal(false)
    })

    it('removes a contract from the registry', async () => {
      await addressRegistry.addAddresses([contract1.address, contract2.address])
      await expect(addressRegistry.removeAddress(contract2.address, contract1.address))
      .to.emit(addressRegistry, "AddressRemoved").withArgs(contract1.address)
    })

    it('owner clears all addresses from registry', async () => {
      await addressRegistry.addAddresses([contract1.address, contract2.address])
      await addressRegistry.clearAll()
      const allAddressesLengthAfterClear = (await addressRegistry.callStatic.getAddresses()).length

      expect(allAddressesLengthAfterClear).to.equal(0)
    })

    it('clear all event emitted', async () => {
      await addressRegistry.addAddresses([contract1.address, contract2.address])
      expect(await addressRegistry.clearAll()).to.emit(addressRegistry, "AllAddressesCleared")
    })

    it('reverts when non-owner tries to clear', async () => {
      await expect(addressRegistry.connect(wallet2).clearAll()).
      to.be.revertedWith("Ownable: caller is not the owner")    
    })

    it('returns the start of the list', async () => {
       expect(await addressRegistry.start()).to.equal(SENTINAL)    
    })

    it('returns the end of the list (sentinal)', async () => {
      expect(await addressRegistry.end()).to.equal(SENTINAL)    
    })

    it('gives the next address in the list', async () => {
      await addressRegistry.addAddresses([contract1.address, contract2.address])
      expect(await addressRegistry.next(contract2.address)).to.equal(contract1.address)    
    })

    it('reverts when non-owner tries to add a contract', async () => {
      await expect(addressRegistry.connect(wallet2).addAddresses([prizeStrategy.address])).
      to.be.revertedWith("Ownable: caller is not the owner")    
    })
    
    it('reverts when non-owner tries to remove a contract', async () => {
      await expect(addressRegistry.connect(wallet2).removeAddress(prizeStrategy.address, SENTINAL)).
      to.be.revertedWith("Ownable: caller is not the owner")    
    })

    it('reverts when contract already added', async () => {      
      await addressRegistry.addAddresses([contract3.address])
      await expect(addressRegistry.addAddresses([contract3.address])).to.be.revertedWith("Already added")    
    })

  })

  describe('Test capacity of Registry', () => {
    let callingContract

    it('Places 100 pools in registry', async () => {

      const zeroAddress = ethers.constants.AddressZero
      
      console.log("Putting random addresses in registry")

      let addresses = []

      for(i = 2; i < 200;  i++){
        const address = (zeroAddress.substr(0, zeroAddress.length - i.toString().length)) + i.toString()
        addresses.push(address)
      }

      const gasEstimateToAdd = await addressRegistry.estimateGas.addAddresses(addresses)
      await addressRegistry.addAddresses(addresses)
      console.log(gasEstimateToAdd.toString()) // 2481508 for 98 pods, 4972962 for 198 pods
      
      const gasEstimateToGet = await addressRegistry.estimateGas.getAddresses()
      console.log("getAddresses() gas estimate ", 
      gasEstimateToGet.toString()) // 270604 for 98 pods, 520241 for 198 pods
      
      console.log("getAddresses() gas estimate from calling contract ", 
      (await callingContract.estimateGas.getAddresses()).toString()) // 290759 for 98, 555527 for 198 pods

      const callingContractFactory = await ethers.getContractFactory("RegistryCallingContract")
      callingContract = await callingContractFactory.deploy(addressRegistry.address)
    })
  })

});
