const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Contracts, Utils, deployAll } = require("../scripts/common/deploy")


describe("franctional", function () {


  let _basket = ""

  let isDeployedSuccessful = false;

  before(async () => {
    isDeployedSuccessful = await deployAll()
  });
  
  it("Have to success basic deployment", async function () {
    expect(isDeployedSuccessful).to.equal(true);
  });

  it("Approve ERC721", async () => {
    // excute approvalForAll() for VAULTFactory
    const [master, user1, user2] = await ethers.getSigners()
    const _vFactory = Contracts.VaultFactory
    const _721 = Contracts.Collection721


    const _tx = await _721.connect(user1).setApprovalForAll(_vFactory.address, true)
    await _tx.wait()
    expect(await _721.isApprovedForAll(user1.address, user2.address)).to.equal(false)
    expect(await _721.isApprovedForAll(user1.address, _vFactory.address)).to.equal(true)
  })


  const createBasket = async (operator) => {
    const _bFactory = Contracts.BasketFactory
    let _tx = await _bFactory.connect(operator).createBasket()
    const _recipt = await _tx.wait()
    expect(_recipt.events[_recipt.events.length - 1].event).equal("NewBasket")
    return _recipt.events[_recipt.events.length - 1].args["_address"] // new basket address
  }

  it("Make Basket", async () => {
    const [master, user1, user2] = await ethers.getSigners()
    const _bFactory = Contracts.BasketFactory

    const _basketAddress = await createBasket(user1) // constructor에서 만들어진 721 토큰(basket)의 0번 토큰을 transfer 함, 내가 바스켓의 소유주라는 뜻? 일것으로 추측함
    _basket = await ethers.getContractAt("Basket", _basketAddress)

    // const balance = await _basket.balanceOf(user1.address)
    // console.log("\tbalance :" ,balance.toString())
    const ownerOfTokenZero = await _basket.ownerOf(0)
    console.log("\t TokenID(0)'s owner :", await _basket.ownerOf(0))
    expect(ownerOfTokenZero).equal(user1.address)
  })

  it("Deposit NFT to _basket & Fractional", async () => {

    const _tokenIDMintedAlready = 100

    const [master, user1, user2] = await ethers.getSigners()
    // check token's owner
    const _721 = Contracts.Collection721
    let owner = await _721.ownerOf(_tokenIDMintedAlready)
    expect(owner).equal(user1.address)

    //TODO have to change `TransferFrom` to `SafeTranferFrom`
    // Transfer owned token(100) for fractional
    const tx = await _721.connect(user1).transferFrom(user1.address, _basket.address, _tokenIDMintedAlready)
    const receipt = await tx.wait()

    owner = await _721.ownerOf(_tokenIDMintedAlready)
    expect(owner).equal(_basket.address)

    // Fraction
    const _vaultFactory = Contracts.VaultFactory
    _vaultFactory.mint(
      "Vault Name",
      "VAULTSYMBOL",
      _721.address,
      _tokenIDMintedAlready,
      ethers.BigNumber(10).mul(Utils.Decimal),
      ethers.BigNumber(10).mul(Utils.Decimal), // List price, i guess this price maybe displayed on opensea?
      ethers.BigNumber(100), //Fee paid to the curator yearly, 3decimal. 100 => 10% ?
      
    )
  })
  // it("Fraction a Token", async() => {
  //   const [master, user1, user2] = await ethers.getSigners()
  // })

});
