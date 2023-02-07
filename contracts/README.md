# Smart Contracts Account

The smart contracts have a modular structure, wherein each functionality is added as a module providing an ease to remove or add new features whenever the owner wishes. The factory contract clones the base contract each time a new user wishes to create his copy. This provides user with a given set of functionalities like batch transactions, MEV resistant swapping, multiple auths, etc. The modular and upgradeable structure of smart accounts allows the manager/owner to add or remove any module. The fallback method takes care of the all the calls and the implementations.
In future other functionalities like meta-tx, gas relayer etc can also be added to make it even more compatible with the upcoming developemnts.

The call structure:

```
EOA --> smart contract account --> search for function in contract --> if present execute the function on behalf of EOA.
                                               |
                                        if not present, go to fallback
                                        and check if implementation module
                                        exists, if yes make a delegatecall
                                        to the module, else revert.
```

As represented from the above,
the user's EOA first creates a contract wallet, the contract wallet is confirgured with some basic modules at the time of cloning which can be later modified also. Now whenever a call is made to the smart contract via the EOA, firstly the method is searched in the implementation of smart contract account itself and if found a call is made. If the function is not present in the smart contract implementation, the call goes to the `fallback` which then tries finding the suitable module corresponding to the function selector. If the module is found, a `delegatecall` is made to the module, otheriwse the call is reverted. Delegate call allows all actions to be performed on behalf of the user.

___

### To compile,
```
forge build
```
