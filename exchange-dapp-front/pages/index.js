import React, {useState, useEffect, useRef} from "react"
import {BigNumber, providers, utils} from "ethers"
import Web3Modal from "web3modal"
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { getMaverickTokenBalance , getEtherBalance, getLPTokensBalance, getReserveOfMavTokens} from "../utils/getAmounts"
import { getTokensAfterRemove, removeLiquidity } from "../utils/removeLiquidity"
import { swapTokens, getAmountOfTokensReceivedFromSwap } from "../utils/swap"
import { addLiquidity, calculateMAV } from "../utils/addLiquidity"

export default function Home() {

const [loading, setLoading] = useState(false)

const [liquidityTab, setLiquidityTab] = useState(true)

const zero = BigNumber.from(0)

const [ethBalance, setEtherBalance] = useState(zero)

const [reservedMAV, setReservedMAV] = useState(zero)

const [etherBalanceContract, setEtherBalanceContract] = useState(zero)

const [mavBalance, setMavBalance] = useState(zero)

const [lpBalance, setLPBalance] = useState(zero)

const [addEther, setAddEther] = useState(zero)

const [addMavTokens, setAddMavTokens] = useState(zero)

const [removeEther, setRemoveEther] = useState(zero)

const [removeMAV, setRemoveMAV] = useState(zero)

const [removeLPTokens, setRemoveLPTokens] = useState("0")

const [swapAmount, setSwapAmount] = useState("")

const [tokenToBeReceivedAfterSwap, settokenToBeReceivedAfterSwap] = useState(
  zero
);

const [ethSelected, setEthSelected] = useState(true);

const [walletConnected, setWalletConnected] = useState(false);

const web3ModalRef = useRef()


const getProviderOrSigner = async (needSigner=false) => {

  const provider = await web3ModalRef.current.connect()
  const web3Povider = new providers.Web3Provider(provider)

  const { chainId } = await web3Povider.getNetwork()

  if(chainId !== 4) {
    window.alert("Change the network to Rinkeby")
    throw new Error("Change network to Rinkeby")
  }

  if (needSigner) {
    const signer = web3Povider.getSigner()
    return signer
  }
  return web3Povider
}


const connectWallet = async () => {
  try {
    await getProviderOrSigner()
    setWalletConnected(true)
  } catch (err) {
    console.error(err)
  }
}


const getAmounts = async () => {
  try {
    const provider = await getProviderOrSigner(false)
    const signer = await getProviderOrSigner(true)
    const address = await signer.getAddress()

    const _ethBalance = await getEtherBalance(provider, address)

    const _mavBalance = await getMaverickTokenBalance(provider, address)

    const _lpBalance = await getLPTokensBalance(provider, address)

    const _reservedMAV = await getReserveOfMavTokens(provider)

    const _ethBalanceContract = await getEtherBalance(provider, null, true)
    setEtherBalance(_ethBalance)
    setMavBalance(_mavBalance)
    setLPBalance(_lpBalance)
    setReservedMAV(_reservedMAV)
    // setReservedMAV(_reservedMAV)
    setEtherBalanceContract(_ethBalanceContract)
  } catch(err) {
    console.error(err)
  }
}
  

const _swapTokens = async() => {
  try{
    const swapAmountWei = utils.parseEther(swapAmount)

    if (!swapAmountWei.eq(zero)) {
      const signer = await getProviderOrSigner(true)
      setLoading(true)

      await swapTokens(
        signer,
        swapAmountWei,
        tokenToBeReceivedAfterSwap,
        ethSelected
      )
      setLoading(false)

      await getAmounts()
      setSwapAmount("")
      settokenToBeReceivedAfterSwap(zero)
    }
  }catch(err) {
    console.error(err)
    setLoading(false)
    setSwapAmount("")
    settokenToBeReceivedAfterSwap(zero)
  }
}



const _getAmountOfTokensReceivedFromSwap = async (_swapAmount) => {
  try{

    const _swapAmountWei = utils.parseEther(_swapAmount.toString())

    if (!_swapAmountWei.eq(zero)) {
      const provider = await getProviderOrSigner()

      const _ethBalance = await getEtherBalance(provider, null, true)

      const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
        _swapAmountWei,
        provider,
        ethSelected,
        _ethBalance,
        reservedMAV
      )
      settokenToBeReceivedAfterSwap(amountOfTokens)
    } else {
      settokenToBeReceivedAfterSwap(zero)
    }
  } catch(err) {
    console.error(err)
  }
}



const _addLiquidity = async () => {
  try {
    const addEtherWei = utils.parseEther(addEther.toString())

    if(!addMavTokens.eq(zero) && !addEtherWei.eq(zero)) {
      const signer = await getProviderOrSigner(true)
      setLoading(true)

      await addLiquidity(signer, addMavTokens, addEtherWei)

      setLoading(false)

      setAddMavTokens(zero)

      await getAmounts()
    } else {
      setAddMavTokens(zero)
    }
  } catch(err) {
    console.error(err)
    setLoading(false)
    setAddMavTokens(zero)
  }
}



const _removeLiquidity = async () => {
  try {
    const signer = await getProviderOrSigner(true)

    const removeLPTokensWei = utils.parseEther(removeLPTokens)

    setLoading(true)
    
    await removeLiquidity(signer, removeLPTokensWei)
    setLoading(false)
    await getAmounts()
    setRemoveMAV(zero)
    setRemoveEther(zero)

  } catch(err) {
    console.error(err)
    setLoading(false)
    setRemoveMAV(zero)
    setRemoveEther(zero)
  }
}

const _getTokensAfterRemove = async (_removeLPTokens) => {
  try {
    const provider = await getProviderOrSigner()

    const removeLPTokensWei = utils.parseEther(_removeLPTokens)

    const _ethBalance = await getEtherBalance(provider, null, true)

    const mavTokenReserve = await getReserveOfMavTokens(provider)

    const { _removeEther, _removeMAV } = await getTokensAfterRemove(
      provider,
      removeLPTokensWei,
      _ethBalance,
      mavTokenReserve
    )
    setRemoveEther(_removeEther)
    setRemoveMAV(_removeMAV)
  } catch(err) {
    console.error(err)
  }
}


useEffect(() => {

  if(!walletConnected) {
    web3ModalRef.current = new Web3Modal({
      network: "rinkeby",
      providerOptions: {},
      disableInjectedProvider: false
    })
    connectWallet()
    getAmounts()
  }
}, [walletConnected])


const renderButton = () => {

  if(!walletConnected) {
    return(
      <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
    )
  }

  if (loading) {
    return <button className={styles.button}>Loading🎁...</button>
  }

  if(liquidityTab) {
    return(
      <div>
        <div className={styles.description}>
            You have:
            <br />
            {utils.formatEther(mavBalance)} Maverick Tokens
            <br />
            {utils.formatEther(ethBalance)} Ether
            <br />
            {utils.formatEther(lpBalance)} Maverick LP tokens
          </div>
          <div>
            {utils.parseEther(reservedMAV.toString()).eq(zero) ? (
              <div>
              <input
                type="number"
                placeholder="Amount of Ether"
                onChange={(e) => setAddEther(e.target.value || "0")}
                className={styles.input}
              />
              <input
                type="number"
                placeholder="Amount of Maverick tokens"
                onChange={(e) =>
                  setAddMavTokens(
                    BigNumber.from(utils.parseEther(e.target.value || "0"))
                  )
                }
                className={styles.input}
              />
              <button className={styles.button1} onClick={_addLiquidity}>
                Add
              </button>
            </div>
            ) : (
              <div>
              <input
                type="number"
                placeholder="Amount of Ether"
                onChange={async (e) => {
                  setAddEther(e.target.value || "0");
                  // calculate the number of CD tokens that
                  // can be added given  `e.target.value` amount of Eth
                  const _addMAVTokens = await calculateMAV(
                    e.target.value || "0",
                    etherBalanceContract,
                    reservedMAV
                  );
                  setAddMavTokens(_addMAVTokens);
                }}
                className={styles.input}
              />
              <div className={styles.inputDiv}>
                {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                {`You will need ${utils.formatEther(addMavTokens)} Maverick
                Tokens`}
              </div>
              <button className={styles.button1} onClick={_addLiquidity}>
                Add
              </button>
            </div>
            )}
            <div>
              <input
                type="number"
                placeholder="Amount of LP Tokens"
                onChange={async (e) => {
                  setRemoveLPTokens(e.target.value || "0");
                  await _getTokensAfterRemove(e.target.value || "0");
                }}
                className={styles.input}
              />
              <div className={styles.inputDiv}>
                {`You will get ${utils.formatEther(removeMAV)} Mavericks
              Tokens and ${utils.formatEther(removeEther)} Eth`}
              </div>
              <button className={styles.button1} onClick={_removeLiquidity}>
                Remove
              </button>
            </div>
          </div>
      </div>
    )
  } else {
      return (
        <div>
        <input
          type="number"
          placeholder="Amount"
          onChange={async (e) => {
            setSwapAmount(e.target.value || "");
            // Calculate the amount of tokens user would receive after the swap
            await _getAmountOfTokensReceivedFromSwap(e.target.value || "0");
          }}
          className={styles.input}
          value={swapAmount}
        />
        <select
          className={styles.select}
          name="dropdown"
          id="dropdown"
          onChange={async () => {
            setEthSelected(!ethSelected);
            // Initialize the values back to zero
            await _getAmountOfTokensReceivedFromSwap(0);
            setSwapAmount("");
          }}
        >
          <option value="eth">Ethereum</option>
          <option value="maverickToken">Maverick Token</option>
        </select>
        <br />
        <div className={styles.inputDiv} >
          {ethSelected
            ? `You will get ${utils.formatEther(
                tokenToBeReceivedAfterSwap
              )} Maverick Tokens`
            : `You will get ${utils.formatEther(
                tokenToBeReceivedAfterSwap
              )} Eth`}
        </div>
        <button className={styles.button1} onClick={_swapTokens}>
          Swap
        </button>
      </div>
      )
  }
}


  
  return (
    <div >
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Defi-Swap-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Mavericks Exchange!</h1>
          <div className={styles.description}>
            Exchange Ethereum &#60;&#62; Maverick Tokens
          </div>
          <div>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(true);
              }}
            >
              Liquidity
            </button>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(false);
              }}
            >
              Swap
            </button>
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./onboard.jpg" />
        </div>
      </div>
      <footer className={styles.footer}>
      Made with &#10084; by Bellz
      </footer>
    </div>
  )
}
