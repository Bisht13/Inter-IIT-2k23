# Contract Structure

### BaseAccount
This is the basic implementation of the smart contract account which is cloned each time a new user asks for an account creation. It contains functionalities such as batch transactions, MEV resistant swapping, whitelisted contracts, multiple auths, etc.
It also contains the fallback handler for the handling different modules.

### Factory
This is the contract responsible for generating the clones of the base implementation which are actually the contract accounts of the different users.

### MultisigFactory
This is the contract responsible for making the clones of the gnosis safe which are used for the multisig functionality.
