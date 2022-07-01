import {Contract} from 'ethers'
import { EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, MAVERICK_TOKEN_CONTRACT_ADDRESS, MAVERICK_TOKEN_CONTRACT_ABI } from '../constants'



export const getAmountOfTokensReceivedFromSwap = async (
  _swapAmountWei,
  provider,
  ethSelected,
  ethBalance,
  reservedMAV
) => {
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    provider
  )
  let amountOfTokens

  if (ethSelected) {
    amountOfTokens = await exchangeContract.getAmountOfTokens(
      _swapAmountWei,
      ethBalance,
      reservedMAV
    )
  } else {
    amountOfTokens = await exchangeContract.getAmountOfTokens(
      _swapAmountWei,
      reservedMAV,
      ethBalance
    )
  }
  return amountOfTokens
}

export const swapTokens = async (
  signer,
  swapAmountWei,
  tokensToBeReceivedAfterSwap,
  ethSelected
) => {
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    signer
  )
  const tokenContract = new Contract(
    MAVERICK_TOKEN_CONTRACT_ADDRESS, 
    MAVERICK_TOKEN_CONTRACT_ABI,
    signer
  )

  let tx

  if(ethSelected) {
    tx = await exchangeContract.ethToMaverickToken(
      tokensToBeReceivedAfterSwap,
      {
        value: swapAmountWei
      }
    )
  } else {
    tx = await tokenContract.approve(
      EXCHANGE_CONTRACT_ADDRESS,
      swapAmountWei.toString()
    )
    await tx.wait()

    tx = await exchangeContract.maverickTokenToEth(
      swapAmountWei,
      tokensToBeReceivedAfterSwap
    )
  }
  await tx.wait()
}