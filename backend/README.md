# Backend 

## Multisig and Transaction history

## Multisig
* It server the Multisig snap

### Working
* Working is explained below.
![](https://i.imgur.com/TV7TZzE.png)


## Transaction history
<hr>
* Approval and revoke snap fetches the list of the sender addresses that are given some allowance.

### Working
* It uses Etherscan API to fetch the latest transaction history of the user.
* The snap requests the backend with public address passed in query. Backend returns the latest transaction history of the user and it also keeps record of the latest fetched block and fetches only latest block.

## Summary Snap : 
<hr>
* This backend code serves the Contract summary snap.

### Working
* It receives the GET request form the snap with contract address and function Signature in the query.
* It fetches returns the summary of what the contract does using GPT3 and Selenium script.
