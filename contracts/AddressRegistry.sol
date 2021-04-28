// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12 <=0.7.6;


import "@openzeppelin/contracts/access/Ownable.sol";

import "./utils/MappedSinglyLinkedList.sol";

///@notice A registry to hold Contract addresses.  Underlying data structure is a singly linked list. 
contract AddressRegistry is Ownable {

    using MappedSinglyLinkedList for MappedSinglyLinkedList.Mapping;

    event AddressAdded(address indexed _address);
    event AddressRemoved(address indexed _address);

    MappedSinglyLinkedList.Mapping internal addressList;

    /// @notice Storage field for what type of contract this Registry is storing 
    string public addressType;    
    
    /// @notice Contract constructor sets addressType, intializes list and transfers ownership
    /// @param _addressType The type of contracts stored in this registry 
    /// @param _owner The address to set as owner of the contract
    constructor(string memory _addressType, address _owner) Ownable() {
        addressType = _addressType;
        addressList.initialize();
        transferOwnership(_owner);
    }

    /// @notice Returns an array of all contract addresses in the linked list
    /// @return Array of contract addresses
    function getAddresses() view external returns(address[] memory) {
        return addressList.addressArray();
    } 

    /// @notice Adds addresses to the linked list. Will revert if the address is already in the list.  Can only be called by the Registry owner.
    /// @param _addresses Array of contract addresses to be added
    function addAddresses(address[] calldata _addresses) public onlyOwner {
        for(uint256 _address = 0; _address < _addresses.length; _address++ ){
            addressList.addAddress(_addresses[_address]);
            emit AddressAdded(_addresses[_address]);
        }
    }

    /// @notice Removes an address from the linked list. Can only be called by the Registry owner.
    /// @param _previousContract The address positionally located before the address that will be deleted. This may be the SENTINEL address if the list contains one contract address
    /// @param _address The address to remove from the linked list. 
    function removeAddress(address _previousContract, address _address) public onlyOwner {
        addressList.removeAddress(_previousContract, _address); 
        emit AddressRemoved(_address);
    } 
}