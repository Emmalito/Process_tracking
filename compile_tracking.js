// Libraries
const path = require('path');  // To get the path
const fs = require('fs');      // File System
const solc = require('solc');


const directoryPath = path.resolve(__dirname, 'contracts', 'tracking_process.sol');  // Get the path of the lottery.sol file
const source = fs.readFileSync(directoryPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
      'Tracking.sol': {
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
   
const Tracking = JSON.parse(solc.compile(JSON.stringify(input))).contracts['Tracking.sol'].Tracking_Process;

module.exports = Tracking;
