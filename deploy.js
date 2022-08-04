const HDWalletProvide = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const readline = require('readline');
const {abi, evm} = require('./compile_tracking');



const deploy = async(mnemonic) => {
    //Provider with metamask account
    const provider = new HDWalletProvide(mnemonic,
        "https://rinkeby.infura.io/v3/5e0b1b98ecb640c796f7c68f39d6a3ea");
    const web3 = new Web3(provider);

    const accounts = await web3.eth.getAccounts(); 
    console.log("Attempting to deploy contract on account ", accounts[0]);
    
    const receipe = await new web3.eth.Contract(abi)
        .deploy({data: evm.bytecode.object})
        .send({from: accounts[0], gas: '3000000'});

    console.log(receipe);
    console.log("Process tracking contract deploy on ", receipe.options.address);
    provider.engine.stop(); // To prevent hanging deployment
};


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let mnemonic;

rl.question('Enter your mnemonic: ', (answer) => {
    mnemonic = answer;
    console.log("Your mnemonic is: ", answer);
    rl.close();
    deploy(mnemonic);
});
