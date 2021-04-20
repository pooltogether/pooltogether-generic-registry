// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./utils/MappedSinglyLinkedList.sol";



///@notice A registry to hold Contract addresses.  Underlying data structure is a singly linked list. 
contract ContractRegistry is Ownable {


    // add a name for the contracts so its easier to see what it holds?

    using MappedSinglyLinkedList for MappedSinglyLinkedList.Mapping;

    event ContractAdded(address indexed _contract);
    event ContractRemoved(address indexed _contract);

    MappedSinglyLinkedList.Mapping internal contractList;

    constructor() Ownable(){
        contractList.initialize();
    }


    /// @notice Returns an array of all prizePools in the linked list
    ///@return Array of prize pool addresses
    function getContracts() view external returns(address[] memory){
        return contractList.addressArray();
    } 

    /// @notice Adds addresses to the linked list. Will revert if the address is already in the list.  Can only be called by the Registry owner.
    /// @param _prizePools Array of prizePool addresses
    function addContract(address[] calldata _contracts) public onlyOwner {
        for(uint256 _contract = 0; _contract < _contracts.length; _contract++ ){ 
            contractList.addAddress(_contracts[_contract]);
            emit ContractAdded(_contracts[_contract]);
        }
    }

    /// @notice Removes an address from the linked list. Can only be called by the Registry owner.
    /// @param _previousPrizePool The address positionally localed before the address that will be deleted. This may be the SENTINEL address if the list contains one prize pool address
    /// @param _prizePool The address to remove from the linked list. 
    function removeContract(address _previousContract, address _contract) public onlyOwner{
        contractList.removeAddress(_previousContract, _contract); 
        emit ContractRemoved(_contract);
    } 
}