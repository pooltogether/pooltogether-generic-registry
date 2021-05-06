// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import "../AddressRegistry.sol";

contract RegistryCallingContract {

    AddressRegistry registry;

    constructor(AddressRegistry _registry){
        registry = _registry;
    }

    function getAddresses() external returns (address [] memory){

        address [] memory localRegistry = registry.getAddresses();

        return localRegistry;
    }

}