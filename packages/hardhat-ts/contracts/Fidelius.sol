pragma solidity ^0.7.6;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
//import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract Fidelius {

  mapping (address => bytes32) names;
  mapping (address => bytes) encryptionPublicKeys;
  Secret[] secrets;
  uint secretsLength;

  struct Secret {
    bytes ciphertext;
    address[] keepers; // A mapping (address => bool) isKeeper mapping would be more efficient, but this is more convenient
    address[] grantees;
    bytes reencryptions;
  }

  function register(bytes32 name, bytes calldata encryptionPublicKey) external {
    names[msg.sender] = name;
    encryptionPublicKeys[msg.sender] = encryptionPublicKey;
  }

  function addSecret(uint256 parentId, bytes calldata ciphertext, address[] calldata grantees, bytes calldata reencryptions) external returns (uint) {
    require(parentId == 0 || isKeeper(msg.sender, parentId));
    address[] memory keepers = new address[](1);
    keepers[0] = msg.sender;
    secrets[secretsLength] = Secret(ciphertext, keepers, grantees, reencryptions);
    return secretsLength++;
  }

  function editSecret(uint256 secretId, bytes calldata ciphertext, address[] calldata grantees, bytes calldata reencryptions) external {
    require(isKeeper(msg.sender, secretId));
    secrets[secretId].ciphertext = ciphertext;
    secrets[secretId].grantees = grantees;
    secrets[secretId].reencryptions = reencryptions;
  }

  function removeSecret(uint256 secretId) external {
    require(isKeeper(msg.sender, secretId));
    delete secrets[secretId];
  }

  function updateKeepers(uint256 secretId, address[] calldata keepers) external {
    require(isKeeper(msg.sender, secretId));
    secrets[secretId].keepers = keepers;
  }

  function isKeeper(address entity, uint256 secretId) public view returns (bool) {
    return true; // TODO
  }
}