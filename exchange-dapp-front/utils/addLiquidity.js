import { Contract, utils } from "ethers";
import {
  EXCHANGE_CONTRACT_ADDRESS,
  EXCHANGE_CONTRACT_ABI,
  MAVERICK_TOKEN_CONTRACT_ADDRESS,
  MAVERICK_TOKEN_CONTRACT_ABI,
} from "../constants";


export const addLiquidity = async (
  signer,
  addMAVAmoutWei,
  addEtherAmountWei
) => {
  try {
    const tokenContract = new Contract(
      MAVERICK_TOKEN_CONTRACT_ADDRESS,
      MAVERICK_TOKEN_CONTRACT_ABI,
      signer
    );

    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      signer
    );

    let tx = await tokenContract.approve(
      EXCHANGE_CONTRACT_ADDRESS,
      addMAVAmoutWei.toString()
    );
    await tx.wait();

    tx = await exchangeContract.addLiquidity(addMAVAmoutWei, {
      value: addEtherAmountWei,
    });
    await tx.wait();
  } catch (err) {
    console.error(err);
  }
};

export const calculateMAV = async (
  _addEther = "0",
  etherBalanceContract,
  mavTokenReserve
) => {
  const _addEtherAmountWei = utils.parseEther(_addEther);

  const maverickTokenAmount = _addEtherAmountWei
    .mul(mavTokenReserve)
    .div(etherBalanceContract);

  return maverickTokenAmount;
};
