const { ethers } = require('hardhat')
require('dotenv').config({ path: ".env"})
const { MAVERICK_TOKEN_CONTRACT_ADDRESS } = require("../constants")



async function main() {
  const maverickTokenAddress = MAVERICK_TOKEN_CONTRACT_ADDRESS

  const exchangeContract = await ethers.getContractFactory("Exchange")

  const deployedExchangeContract = await exchangeContract.deploy(maverickTokenAddress)

  await deployedExchangeContract.deployed()

  console.log("Exchange Contract Address:", deployedExchangeContract.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })