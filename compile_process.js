// Libraries
const path = require('path');  // To get the path
const fs = require('fs');      // File System
const solc = require('solc');


const directoryPath = path.resolve(__dirname, 'contracts', 'tracking_process.sol');  // Get the path of the lottery.sol file
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
   
const Process = JSON.parse(solc.compile(JSON.stringify(input))).contracts['Process.sol'].Process;

module.exports = Process;