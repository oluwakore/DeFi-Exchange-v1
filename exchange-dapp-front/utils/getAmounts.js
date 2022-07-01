import {Contract} from "ethers"
import {
EXCHANGE_CONTRACT_ADDRESS,
EXCHANGE_CONTRACT_ABI,
MAVERICK_TOKEN_CONTRACT_ADDRESS,
MAVERICK_TOKEN_CONTRACT_ABI
} from "../constants"

export const getEtherBalance = async (provider, address, contract = false) => {
  try{
      if(contract) {
        const balance = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS)
        return balance
      } else {
        const balance = await provider.getBalance(address)
        return balance
      }
  } catch(err){
    console.error(err)
    return 0
  }
}

export const getMaverickTokenBalance = async (provider, address) => {
  try {
    const tokenContract = new Contract(
      MAVERICK_TOKEN_CONTRACT_ADDRESS,
      MAVERICK_TOKEN_CONTRACT_ABI,
      provider
    )
    const balanceOfMaverickToken = await tokenContract.balanceOf(address)
    return balanceOfMaverickToken
  } catch(err) {
    console.error(err)
  }
}

export const getLPTokensBalance = async (provider, address) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    )
    const balanceOfLPTokens = await exchangeContract.balanceOf(address)
    return balanceOfLPTokens
  } catch (err) {
    console.error(err)
  }
}

export const getReserveOfMavTokens = async (provider) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    )
    const reserve = await exchangeContract.getReserve()
    return reserve
  } catch (err) {
    console.error(err)
  }
}


