### Multi-sig wallet snap

You might have heard about a number of cases where the private keys of the users get compromised leading them to lose all their funds. Multi-sig functionality aims to remove these kinds of security breaches. **Multi-sig Wallets** refer to smart contract wallets having multiple owners and a number of threshold signatures required to execute a transaction. With multisig the users can add an additional layer of security since the attacker can not initiate any transaction from the smart contract account, without the required number of signatures. In this snap, we have applied the **Gnosis Safe**‘s implementation of multi-sig wallet. 

### Implementation
The following flow diagram shows our implementation of multi-sig wallet using metamask snap:
![](/multi-sig.png)
<br>
<br>


A multi-sig wallet consists of multiple auths and a minimum number of the auths need to sign the transaction to execute it. We aim to ease the use of multisigs for users, by providing them the following features:
- A user can easily have their multisig wallet generated, the owners and set the threshold. 
- Our snap runs a cron-job tracking the generated multisig wallet, and keeps track of its owners and the current threshold and updates a storage with it. 
- Now whenever any owner of the multisig wallet initiates/proposes a transaction by signing it, the cron-job running on each individual snap checks if the signature is intended for their multisig wallet. If the user is one of the owner of the multisig wallet, a pop-up will appear on metamask asking for their signature showing them all relevant details.
- As a signature is sent the global signature array is updated and the current_threshold increased.
- Now as the current threshold reaches threshold-1, the last user signs the transaction, and along with that execuutes the transaction.
- In this way, the user doesn't need to keep track of the safe-wallets manually, for every transaction intended for his safe-wallet, he'll get the notifications and any dapp can easily integrate the multi-sig functionality providing security to their users.
___
![safe](https://i.imgur.com/nUikv5I.png)
<br>
<br>
