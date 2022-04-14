const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Contracts, Utils, deployAll, loadAll } = require("../scripts/common/deploy")


describe("franctional", function () {


  let _basket = ""

  let isDeployedSuccessful = false;

  const useDeployedContract = process.env.USE_DEPLOYED;
  before(async () => {
    this.timeout(1000 * 60 * 20);
    if (useDeployedContract) {

      isDeployedSuccessful = await loadAll()
    } else {
      isDeployedSuccessful = await deployAll()
    }
  });

  it.only("Have to success basic deployment", async function () {
    this.timeout(1000 * 60 * 20);
    expect(isDeployedSuccessful).to.equal(true);
  });

  it("Approve ERC721", async () => {
    this.timeout(1000 * 60 * 20);
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
    this.timeout(1000 * 60 * 20);
    const _bFactory = Contracts.BasketFactory
    let _tx = await _bFactory.connect(operator).createBasket()
    const _recipt = await _tx.wait()
    expect(_recipt.events[_recipt.events.length - 1].event).equal("NewBasket")
    return _recipt.events[_recipt.events.length - 1].args["_address"] // new basket address
  }

  it.only("Make Basket", async () => {
    this.timeout(1000 * 60 * 20);
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

  it.only("Deposit NFT to _basket & Fractional", async () => {
    this.timeout(1000 * 60 * 20);

    const _tokenIDMintedAlready = Math.floor(Math.random() *100 )
    console.log("try to minting... tokenID is : ", _tokenIDMintedAlready)

    const [master, user1, user2] = await ethers.getSigners()

    const _721 = Contracts.Collection721
    // mint a new token for fraction
    try{
      let tx = await _721.Mint(user1.address, _tokenIDMintedAlready )
      await tx.wait()

    } catch(err){
      console.error(err)
    }

    // check token's owner
    let owner = await _721.ownerOf(_tokenIDMintedAlready)
    expect(owner).equal(user1.address)

    //TODO have to change `TransferFrom` to `SafeTranferFrom`
    // Transfer owned token(100) for fractional
    let tx = await _721.connect(user1).transferFrom(user1.address, _basket.address, _tokenIDMintedAlready)
    let receipt = await tx.wait()
    owner = await _721.ownerOf(_tokenIDMintedAlready)
    console.log("basket's address: ", _basket.address)
    console.log("Current NFT owner :", owner)
    expect(owner).equal(_basket.address)

    const _vaultFactory = Contracts.VaultFactory
    //Approve 
    tx = await _basket.connect(user1).setApprovalForAll(_vaultFactory.address, true);
    receipt = await tx.wait()
    // Fraction

    const preCount = await _vaultFactory.vaultCount();

    tx = await _vaultFactory.connect(user1).mint(
      "Vault Name",
      "VAULTSYMBOL",
      _basket.address,
      ethers.BigNumber.from(0),
      ethers.BigNumber.from(10).mul(Utils.Decimal),
      ethers.BigNumber.from(10).mul(Utils.Decimal), // List price, i guess this price maybe displayed on opensea?
      ethers.BigNumber.from(100).mul(Utils.Decimal), //Fee paid to the curator yearly, 3decimal. 100 => 10% ?
    )

    await tx.wait()
    const currentCount = await _vaultFactory.vaultCount();
    console.log("Counts of vaults:", currentCount)

    expect(Number(preCount) + 1).equal(currentCount)



  })
  // it("Fraction a Token", async() => {
  //   this.timeout(1000*60*20);
  //   const [master, user1, user2] = await ethers.getSigners()
  // })

});
