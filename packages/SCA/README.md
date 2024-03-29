###  Smart Contract Wallet Snap
Smart Contract wallets are the wallets that control funds through code unlike Private Key as is the case with Externally Owned Accounts (EOAs) and provide a number of functionalities in a wrapper. The snap uses a factory contract to generate a smart contract account for each EOA with functions like whitelisting contracts, multiple authorities etc. 
The architecture we chose for the smart contract accounts is an upgradable one wherein any new functionality can be added easily depending on the choice of the master owner or the auths and any functionality can be easily removed. Some of the modules that we have added to the contract are - Role based multiple auths, Whitelisting smart contracts, MEV resistant swapping of tokens.
 **MEV Resistant Swap** - This feature allows the user to perform token swaps, using a aggregator consisting of various dexes such as Uniswap V2, Paraswap, 1Inch and ZerEx. The swaps are MEV resistant, as we are calculating the output amount off-chain and comparing it with the expected amount and incase the amount we are recieving is less than that of the calculated one, the transaction reverts and prevents the user from being front-runned.
* **Batch Transaction** - If the user wants to execute many transactions but does not have enough gas fees to do so. Then batch transaction comes in where the user can batch/compile many transactions into one and execute all by paying the gas fees for just one transaction. A perfect example of this is transaferring ethers or erc20 tokens to different addresses in a single click, let's say a payroll, leveraging which includes supplying, borrowing and then again supplying. All these transactions are done as a single batched transaction which helps users to save gas fees.
* **Multiple auths** - The owner becomes the master owner and can add multiple auths to handle his transactions using a role based system. Also, if an auth looses his rights, the other auths have the power to help him regain it.
* **Whitelisting** - The smart contract wallet allows user to whitelist specific contracts, for specific functionalities. This feature saves users' funds from any contract that might be trying to steal them .

<br>
 Demo
<img src = "/assets/sca.gif">
<br>
