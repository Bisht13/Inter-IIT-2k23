// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IParaswap, IERC20, IUniswapV2Factory, IUniswapV2Router02} from './Interfaces.sol';

//GOERLI: 0x89012390386aD3337dDd6735B9EAe5e2FAACb21f
contract SwapEvents {
  event SwappedWith1Inch(
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 amountOut
  );

  event SwappedWithParaswap(
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 amountOut
  );

  event SwappedWithZeroX(
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 amountOut
  );
  event SwappedWithUniswap(
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 amountOut
  );

  event Swapped(
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 amountOut
  );
}

contract SwapHelpers is SwapEvents {
  //TODO: switch to testnet address from mainnet address
  address internal constant oneInch =
    0x1111111254EEB25477B68fb85Ed929f73A960582;
  address internal constant paraswap =
    0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57;
  IUniswapV2Router02 internal constant router =
    IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
  address internal constant zeroX = 0xF91bB752490473B8342a3E964E855b9f9a2A668e;
  address internal constant ethAddr =
    0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
  address internal constant wethAddr =
    0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6;

  enum Dex {
    ZEROX,
    ONEINCH,
    PARASWAP,
    UNISWAPV2
  }

  function ethToWeth(
    bool isEth,
    address token,
    uint256 amount
  ) internal {
    if (isEth) IERC20(token).deposit{value: amount}();
  }

  function wethToEth(
    bool isEth,
    address token,
    uint256 amount
  ) internal {
    if (isEth) {
      IERC20(token).approve(token, amount);
      IERC20(token).withdraw(amount);
    }
  }

  /**
   *@dev calculates the slippage or the expected amount returned after successful swap with slippage.
   *@param decimalsIn_ decimals of the token swapped from.
   *@param decimalsOut_ decimals of the token swapped to.
   *@param amount_ amount of token swapped.
   *@param unitAmt_ the amount of amtIn/amtOut with slippage.
   */
  function calculateSlippage(
    uint256 decimalsIn_,
    uint256 decimalsOut_,
    uint256 amount_,
    uint256 unitAmt_
  ) public pure returns (uint256 slippage_) {
    uint256 inWeiAmt_ = (amount_ * 10**(18 - decimalsIn_));

    slippage_ = ((unitAmt_ * inWeiAmt_) + (10**18) / 2) / (10**18);
    slippage_ = (slippage_ / 10**(18 - decimalsOut_));
  }

  /**
   *@dev performs swap with OneInch.
   *@param tokenIn_ the token swap performed from.
   *@param tokenOut_ the token swap performed to.
   *@param amtIn_ amount of tokenIn_ to be swapped.
   *@param unitAmt_ the amount of amtIn/amtOut with slippage.
   *@param callData_ calldata for the swap on OneInch.
   */
  function swapWithOneInch(
    address tokenIn_,
    address tokenOut_,
    uint256 amtIn_,
    uint256 unitAmt_,
    bytes calldata callData_
  ) public payable returns (uint256 amtOut_, bool success_) {
    //approve the token to be swapped to one inch contract
    uint256 value_ = 0;
    if (tokenIn_ != ethAddr) {
      IERC20(tokenIn_).approve(oneInch, amtIn_);
    } else {
      value_ = amtIn_;
    }

    //TODO: check for msg.sender, delegate call logic
    uint256 initialBal_ = (tokenOut_) == ethAddr
      ? msg.sender.balance
      : IERC20(tokenOut_).balanceOf(msg.sender);

    (success_, ) = oneInch.call{value: value_}(callData_);
    require(success_, '1Inch-swap-failed');

    uint256 finalBal_ = (tokenOut_) == ethAddr
      ? msg.sender.balance
      : IERC20(tokenOut_).balanceOf(msg.sender);
    amtOut_ = (finalBal_ - initialBal_);

    uint256 slippage_ = calculateSlippage(
      IERC20(tokenIn_).decimals(),
      IERC20(tokenOut_).decimals(),
      amtIn_,
      unitAmt_
    );
    require(slippage_ <= amtOut_, 'high-slippage');
    emit SwappedWith1Inch(tokenIn_, tokenOut_, amtIn_, amtOut_);
  }

  /**
   *@dev performs swap with Paraswap.
   *@param tokenIn_ the token swap performed from.
   *@param tokenOut_ the token swap performed to.
   *@param amtIn_ amount of tokenIn_ to be swapped.
   *@param unitAmt_ the amount of amtIn/amtOut with slippage.
   *@param callData_ calldata for the swap on Praswap.
   */
  function swapWithParaswap(
    address tokenIn_,
    address tokenOut_,
    uint256 amtIn_,
    uint256 unitAmt_,
    bytes calldata callData_
  ) public payable returns (uint256 amtOut_, bool success_) {
    //approve the token to be swapped to one inch contract
    uint256 value_ = 0;
    if (tokenIn_ != ethAddr) {
      address tokenProxy_ = IParaswap(paraswap).getTokenTransferProxy();
      IERC20(tokenIn_).approve(tokenProxy_, amtIn_);
    } else {
      value_ = amtIn_;
    }

    //TODO: check for msg.sender, delegate call logic
    uint256 initialBal_ = (tokenOut_) == ethAddr
      ? msg.sender.balance
      : IERC20(tokenOut_).balanceOf(msg.sender);

    (success_, ) = paraswap.call{value: value_}(callData_);
    require(success_, 'paraswap-swap-failed');

    uint256 finalBal_ = (tokenOut_) == ethAddr
      ? msg.sender.balance
      : IERC20(tokenOut_).balanceOf(msg.sender);
    amtOut_ = (finalBal_ - initialBal_);

    uint256 slippage_ = calculateSlippage(
      IERC20(tokenIn_).decimals(),
      IERC20(tokenOut_).decimals(),
      amtIn_,
      unitAmt_
    );
    require(slippage_ <= amtOut_, 'high-slippage');
    emit SwappedWithParaswap(tokenIn_, tokenOut_, amtIn_, amtOut_);
  }

  /**
   *@dev performs swap with ZeroX.
   *@param tokenIn_ the token swap performed from.
   *@param tokenOut_ the token swap performed to.
   *@param amtIn_ amount of tokenIn_ to be swapped.
   *@param unitAmt_ the amount of amtIn/amtOut with slippage.
   *@param callData_ calldata for the swap on ZeroX.
   */
  function swapWithZeroX(
    address tokenIn_,
    address tokenOut_,
    uint256 amtIn_,
    uint256 unitAmt_,
    bytes calldata callData_
  ) public payable returns (uint256 amtOut_, bool success_) {
    //approve the token to be swapped to one inch contract
    uint256 value_ = 0;
    if (tokenIn_ != ethAddr) {
      IERC20(tokenIn_).approve(oneInch, amtIn_);
      value_ = amtIn_;
    }

    //TODO: check for msg.sender, delegate call logic
    uint256 initialBal_ = (tokenOut_) == ethAddr
      ? msg.sender.balance
      : IERC20(tokenOut_).balanceOf(msg.sender);

    (success_, ) = zeroX.call{value: value_}(callData_);
    require(success_, 'ZeroX-swap-failed');

    uint256 finalBal_ = (tokenOut_) == ethAddr
      ? msg.sender.balance
      : IERC20(tokenOut_).balanceOf(msg.sender);
    amtOut_ = (finalBal_ - initialBal_);

    uint256 slippage_ = calculateSlippage(
      IERC20(tokenIn_).decimals(),
      IERC20(tokenOut_).decimals(),
      amtIn_,
      unitAmt_
    );
    require(slippage_ <= amtOut_, 'high-slippage');
    emit SwappedWithZeroX(tokenIn_, tokenOut_, amtIn_, amtOut_);
  }

  /**
   *@dev performs swap with Uniswap.
   *@param tokenIn_ the token swap performed from.
   *@param tokenOut_ the token swap performed to.
   *@param amtIn_ amount of tokenIn_ to be swapped.
   *@param unitAmt_ the amount of amtIn/amtOut with slippage.
   *@param callData_ calldata for the swap, for uniswap = ''.
   */
  function swapWithUniswapV2(
    address tokenIn_,
    address tokenOut_,
    uint256 amtIn_,
    uint256 unitAmt_,
    bytes memory callData_
  ) public payable returns (uint256 amtOut_, bool success_) {
    tokenIn_ = tokenIn_ == ethAddr ? wethAddr : tokenIn_;
    tokenOut_ = tokenOut_ == ethAddr ? wethAddr : tokenOut_;
    address[] memory paths = new address[](2);
    paths[0] = tokenIn_;
    paths[1] = tokenOut_;

    uint256 _slippageAmt = calculateSlippage(
      IERC20(tokenIn_).decimals(),
      IERC20(tokenOut_).decimals(),
      amtIn_,
      unitAmt_
    );

    address pair = IUniswapV2Factory(router.factory()).getPair(
      paths[0],
      paths[1]
    );
    require(pair != address(0), 'No-exchange-address');

    uint256[] memory amts = router.getAmountsOut(amtIn_, paths);
    uint256 _expectedAmt = amts[1];

    require(_slippageAmt <= _expectedAmt, 'high-slippage');

    bool isEth = tokenIn_ == wethAddr;
    // ethToWeth(isEth, tokenIn_, amtIn_);
    IERC20(tokenIn_).approve(address(router), amtIn_);

    amtOut_ = router.swapExactTokensForTokens(
      amtIn_,
      _expectedAmt,
      paths,
      msg.sender,
      block.timestamp + 1
    )[1];

    isEth = (tokenOut_) == wethAddr;
    wethToEth(isEth, tokenOut_, amtOut_);
    success_ = true;
    emit SwappedWithUniswap(tokenIn_, tokenOut_, amtIn_, amtOut_);
  }
}

// MEV resistant swap(aggregator).
contract SafeSwap is SwapHelpers {
  /**
   *@dev performs safe swap in priority order of dex and passing to the next if swap in higher priority fails.
   *@param tokenIn_ the token swap performed from.
   *@param tokenOut_ the token swap performed to.
   *@param amtIn_ amount of tokenIn_ to be swapped.
   *@param unitAmt_ the amount of amtIn/amtOut with slippage.
   *@param callData_ calldata for the swap.
   *@param dexs order of dexs for the swap on.
   */
  function swap(
    uint256[] memory dexs,
    address tokenIn_,
    address tokenOut_,
    uint256 amtIn_,
    uint256 unitAmt_,
    bytes calldata callData_
  ) public payable returns (uint256 amtOut_) {
    bool success_;
    bool isEth = tokenIn_ == ethAddr;
    tokenIn_ = isEth ? wethAddr : tokenIn_;

    if (!isEth) {
      //approve on the script
      IERC20(tokenIn_).transferFrom(msg.sender, address(this), amtIn_);
    } else {
      ethToWeth(isEth, tokenIn_, amtIn_);
    }

    for (uint256 i = 0; i < dexs.length; ++i) {
      Dex dex = Dex(dexs[i]);
      if (dex == Dex.ONEINCH) {
        (amtOut_, success_) = swapWithOneInch(
          tokenIn_,
          tokenOut_,
          amtIn_,
          unitAmt_,
          callData_
        );
      } else if (dex == Dex.ZEROX) {
        (amtOut_, success_) = swapWithZeroX(
          tokenIn_,
          tokenOut_,
          amtIn_,
          unitAmt_,
          callData_
        );
      } else if (dex == Dex.PARASWAP) {
        (amtOut_, success_) = swapWithParaswap(
          tokenIn_,
          tokenOut_,
          amtIn_,
          unitAmt_,
          callData_
        );
      } else if (dex == Dex.UNISWAPV2) {
        (amtOut_, success_) = swapWithUniswapV2(
          tokenIn_,
          tokenOut_,
          amtIn_,
          unitAmt_,
          callData_
        );
      } else {
        revert('invalid-dex');
      }
      if (success_) break;
    }
    if (success_) {
      if (tokenOut_ == ethAddr) {
        if (address(this).balance > 0) {
          (bool sent, bytes memory data) = msg.sender.call{value: amtOut_}('');
          require(sent, 'transfer-failed');
        }
      } else {
        if (IERC20(tokenOut_).balanceOf(address(this)) > 0) {
          IERC20(tokenOut_).transfer(msg.sender, amtOut_);
        }
      }
    } else revert('swap-Aggregator-failed');

    emit Swapped(tokenIn_, tokenOut_, amtIn_, amtOut_);
  }
}
