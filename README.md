# Process_tracking

The address of the main contract is `0x224a66401E67904f52Cc94dB703d0AC5Ff644619`  You can find it via [etherscan](https://rinkeby.etherscan.io/address/0x224a66401E67904f52Cc94dB703d0AC5Ff644619) 


## Description

The aims of this project is to implement a process tracking using Ethereum blockchain and smart contract.

We code first the smart contract in solidity, then test all of its methods and finaly deploy it on the Rinkeby testnetwork thanks to a metamask account.

To run the project, make sure you have **Nodejs** **16.13.0** and **npm 8.1.0** installed. Then:

- To install the dependencies: ` npm run start`
- To compile the .sol file: `npm run compile`
- To deploy the compiled files: `npm run deploy`
- To compile and deploy: `npm run execute`
- To delete the dependencies: `npm run clean`
- To test the solidity program on a local network: `npm run test`

## Arborescence

The project folder has the folliwing arborescence:

- contracts/: Folder that contains the solidity code sources
- test/: Directory of JavaScript test files
- compile.js: Code source for compiling the solidity files
- deploy.js: Module which deploy the contract on the Rinkeby testnet
- package.json: File of the project structure and dependances
- README.md
