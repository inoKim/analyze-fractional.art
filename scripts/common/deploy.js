const hre = require('hardhat');
const fs = require('fs');

let Contracts = {
  Collection721 : null,
  Collection1155 : null,
  Settings :null,
  VaultFactory:null,
  TokenVault:null,
  BasketFactory : null,
  Proxy :null
}

async function deploySample721(tokenSpender) {
  const Factory = await hre.ethers.getContractFactory("Collection721");
  const _factory = await Factory.deploy(tokenSpender);
  await _factory.deployed();
  console.log("Collection721 deployed to:", _factory.address);
  Contracts.Collection721 = _factory
  return _factory
}

async function deploySetting() {
  const Factory = await hre.ethers.getContractFactory("Settings");
  const _factory = await Factory.deploy();
  await _factory.deployed();
  console.log("Settings deployed to:", _factory.address);
  Contracts.Settings = _factory
  return _factory
}

async function deployInializeProxy(vaultTokenAddress, initializeCalldata) {
  const Factory = await hre.ethers.getContractFactory("InitializedProxy");
  const _factory = await Factory.deploy(vaultTokenAddress, initializeCalldata);
  await _factory.deployed();
  console.log("initializeProxy deployed to:", _factory.address);
  Contracts.Proxy = _factory
  return _factory
}

async function deployERC721TokenVault(_settingAddress) {
  const Factory = await hre.ethers.getContractFactory("TokenVault");
  const _factory = await Factory.deploy(_settingAddress);
  console.log("TokenVault deployed to:", _factory.address);
  Contracts.TokenVault = _factory
  return _factory
}


async function deployVaultFactory(_settingAddress) {
  const Factory = await hre.ethers.getContractFactory("ERC721VaultFactory");
  const _factory = await Factory.deploy(_settingAddress);
  await _factory.deployed();
  console.log("ERC721VaultFactory deployed to:", _factory.address);
  Contracts.VaultFactory = _factory
  return _factory
}

async function deployBasketFactory() {
  const Factory = await hre.ethers.getContractFactory("BasketFactory");
  const _factory = await Factory.deploy();
  await _factory.deployed();
  console.log("BasketFactory deployed to:", _factory.address);
  Contracts.BasketFactory = _factory
  return _factory
}

const deployAll = async () => {
  try {
    const [master, user1] = await hre.ethers.getSigners()


    const _721 = await deploySample721(user1.address)
    const _setting = await deploySetting()
    const _vaultFactory = await deployVaultFactory(_setting.address)
    const _tokenVault = await deployERC721TokenVault(_setting.address)

    // const initializeCalldata = {
    // }
    // const _proxy = await deployInializeProxy(_tokenVault.address, initializeCalldata)

    const _basketFactory = await deployBasketFactory()

    const fileName = ".env_new"


    const data = `
  COLLECTION721_ADDRESS: ${_721.address},
  SETTINGS_ADDRESS: ${_setting.address}
  VAULTFACTORY_ADDRESS: ${_vaultFactory.address}

  TOKENVAULT_ADDRESS: ${_tokenVault.address}

  BASKETFACTORY_ADDRESS: ${_basketFactory.address}
  `
    fs.writeFileSync(fileName, data)
  } catch (e) {
    return false
  }
  return true

}

module.exports = {
  Contracts,
  deployBasketFactory,
  deployInializeProxy,
  deployERC721TokenVault,
  deployVaultFactory,
  deployAll
}
