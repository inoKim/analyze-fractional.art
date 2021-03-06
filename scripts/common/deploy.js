const hre = require('hardhat');
const fs = require('fs');
const { ethers } = require('hardhat');

const Utils = {
  Decimal: ethers.BigNumber.from(10).pow(18)
}

let Contracts = {
  Collection721: null,
  Collection1155: null,
  Settings: null,
  VaultFactory: null,
  TokenVault: null,
  BasketFactory: null,
  Proxy: null
}

async function deploySample721() {
  const Factory = await hre.ethers.getContractFactory("Sample721");
  const _factory = await Factory.deploy();
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

// async function deployERC721TokenVault(_settingAddress) {
//   const Factory = await hre.ethers.getContractFactory("TokenVault");
//   const _factory = await Factory.deploy(_settingAddress);
//   console.log("TokenVault deployed to:", _factory.address);
//   Contracts.TokenVault = _factory
//   return _factory
// }


async function deployVaultFactory(_settingAddress) { // Create a new TokeVault contract When during deploy vaultFactory 
  const Factory = await hre.ethers.getContractFactory("ERC721VaultFactory");
  const _factory = await Factory.deploy(_settingAddress);
  await _factory.deployed();
  console.log("ERC721VaultFactory deployed to:", _factory.address);
  Contracts.VaultFactory = _factory

  const tokenvaultaddress = await _factory.logic()
  const _vaultToken = _factory._tokenvault = await hre.ethers.getContractAt("TokenVault", tokenvaultaddress)
  Contracts.TokenVault = _vaultToken

  return [_factory, _vaultToken]
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

    const _721 = await deploySample721()
    const tx = await _721.Mint(user1.address, 100)
    await tx.wait()

    const _setting = await deploySetting()
    const [_vaultFactory, _tokenVault] = await deployVaultFactory(_setting.address)

    // const initializeCalldata = {
    // }
    // const _proxy = await deployInializeProxy(_tokenVault.address, initializeCalldata)

    const _basketFactory = await deployBasketFactory()
    const fileName = ".deployed"
    const data = `
COLLECTION721_ADDRESS=${_721.address}
SETTINGS_ADDRESS=${_setting.address}
VAULTFACTORY_ADDRESS=${_vaultFactory.address}
TOKENVAULT_ADDRESS=${_tokenVault.address}
BASKETFACTORY_ADDRESS=${_basketFactory.address}
`
    fs.writeFileSync(fileName, data)
  } catch (e) {
    console.error(e)
    return false
  }
  return true

}

const loadAll = async () => {
  try {
    Contracts.BasketFactory = await ethers.getContractAt((await hre.artifacts.readArtifact("BasketFactory")).abi, process.env.BASKETFACTORY_ADDRESS)
    Contracts.Settings = await ethers.getContractAt((await hre.artifacts.readArtifact("Settings")).abi, process.env.SETTINGS_ADDRESS)
    Contracts.Collection721 = await ethers.getContractAt((await hre.artifacts.readArtifact("Sample721")).abi, process.env.COLLECTION721_ADDRESS)
    Contracts.VaultFactory = await ethers.getContractAt((await hre.artifacts.readArtifact("ERC721VaultFactory")).abi, process.env.VAULTFACTORY_ADDRESS)

    const tokenVaultAddress = await Contracts.VaultFactory.logic()
    Contracts.TokenVault = await hre.ethers.getContractAt((await hre.artifacts.readArtifact("TokenVault")).abi, tokenVaultAddress)
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}


// let Contracts = {
//   Collection721 : null,
//   Collection1155 : null,
//   Settings :null,
//   VaultFactory:null,
//   TokenVault:null,
//   BasketFactory : null,
//   Proxy :null
// }
module.exports = {
  Contracts,
  Utils,
  deployBasketFactory,
  deployInializeProxy,
  deployVaultFactory,
  deployAll,
  loadAll
}
