// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {


  address public maverickTokenAddress;


  constructor(address _MaverickToken) ERC20("_Maverick LP Token", "MAVLP") {
    require(_MaverickToken != address(0), "Token address passed is a null address");
    maverickTokenAddress = _MaverickToken;
  }


  function getReserve() public view returns (uint) {
    return ERC20(maverickTokenAddress).balanceOf(address(this));
  }



  function addLiquidity(uint _amount) public payable returns (uint) {
    uint liquidity;
    uint ethBalance = address(this).balance;
    uint maverickTokenReserve = getReserve();
    ERC20 maverickToken = ERC20(maverickTokenAddress);


    if(maverickTokenReserve == 0) {
      
       maverickToken.transferFrom(msg.sender, address(this), _amount);

      liquidity = ethBalance;
      _mint(msg.sender, liquidity);
    } else {
      uint ethReserve = ethBalance - msg.value;

      uint maverickTokenAmount = (msg.value * maverickTokenReserve)/(ethReserve);

      require(_amount >= maverickTokenAmount, "Amount of tokens sent is less than the minimum tokens required");

      maverickToken.transferFrom(msg.sender, address(this),maverickTokenAmount);


      liquidity = (totalSupply() * msg.value)/ ethReserve;
      _mint(msg.sender, liquidity);
    }
      return liquidity;
  }
  

  function removeLiquidity(uint _amount) public returns(uint, uint) {
    require(_amount > 0, "_amount should be greater than zero");
    uint ethReserve = address(this).balance;
    uint _totalSupply = totalSupply();


    uint ethAmount = (ethReserve * _amount)/_totalSupply;

    uint maverickTokenAmount = (getReserve() * _amount) /_totalSupply;

    _burn(msg.sender, _amount);

    payable(msg.sender).transfer(ethAmount);

    ERC20(maverickTokenAddress).transfer(msg.sender, maverickTokenAmount);

    return (ethAmount, maverickTokenAmount);

  }

  function getAmountOfTokens(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) public pure returns (uint256) {
    require(inputReserve > 0 && outputReserve > 0, "invalid reserves!");

    uint256 inputAmountWithFee = inputAmount * 99;

    uint256 numerator = inputAmountWithFee * outputReserve;
    uint256 denominator = (inputReserve * 100) + inputAmountWithFee;

    return numerator / denominator;
  }



  function ethToMaverickToken(uint _minTokens) public payable {
    uint256 tokenReserve = getReserve();

    uint256 tokensBought = getAmountOfTokens(
      msg.value, 
      address(this).balance - msg.value,
      tokenReserve
    );

    require(tokensBought >= _minTokens, "insufficient output amount");

    ERC20(maverickTokenAddress).transfer(msg.sender, tokensBought);
  }


  function maverickTokenToEth(uint _tokensSold, uint _minEth) public{
      uint256 tokenReserve = getReserve();


      uint256 ethBought = getAmountOfTokens(
        _tokensSold,
        tokenReserve,
        address(this).balance
      );

      require(ethBought >= _minEth, "insufficient output amount");

      ERC20(maverickTokenAddress).transferFrom(
        msg.sender,
        address(this),
        _tokensSold
        );

      payable(msg.sender).transfer(ethBought);
  }










}
