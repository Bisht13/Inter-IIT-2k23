# Modules

As of present, following modules are added in the smart contract wallet.

### Safe Swap Module
This contains the functionlity for the swap aggregator and MEV resistance. UniswapV2, 1Inch, ZeroEx, and paraswap are supported as of now and offchain calculation is done to protect the users from any chances of MEV.

### Batch Module
This contains the logic for batching the transactions by making delegatecalls to the respective addresses with the calldata.

### Helper Module
Helper contracts for the modules and base implementations.
