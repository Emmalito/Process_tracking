// Libraries
const path = require('path');  // To get the path
const fs = require('fs-extra');      // File System
const solc = require('solc');

//Delete the build directory and its files
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

//Recreate the build directory
fs.ensureDirSync(buildPath);

//Get the contract path
const directoryPath = path.resolve(__dirname, 'contracts', 'Process_tracking.sol');
const source = fs.readFileSync(directoryPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
      'Process.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
};

//Compile the source code
const Process = JSON.parse(solc.compile(JSON.stringify(input))).contracts['Process.sol'];

//Store the compiled contracts
for(let contract in Process){
    fs.outputJSONSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        Process[contract]
    );
}
