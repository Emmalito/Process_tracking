// Libraries
const path = require('path');  // To get the path
const fs = require('fs');      // File System
const solc = require('solc');


const directoryPath = path.resolve(__dirname, 'contracts', 'Process_tracking.sol');  // Get the path of the lottery.sol file
const source = fs.readFileSync(directoryPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
      'Process_Tracking.sol': {
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
   
const Tracking = JSON.parse(solc.compile(JSON.stringify(input))).contracts['Process_Tracking.sol'].Process_Tracking;

module.exports = Tracking;
