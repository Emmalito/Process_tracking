const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const compiledProcess = require("../ethereum/build/Process_Tracking.json");

let accounts;
let tracking;


describe("Process tracking contract", () => {
    beforeEach( async() => {
        accounts = await web3.eth.getAccounts();

        tracking = await new web3.eth.Contract(compiledProcess.abi)
            .deploy({ data: compiledProcess.evm.bytecode.object})
            .send({ from: accounts[0], gas: 3000000});
    });

    describe("Good deployment", () =>{
        it("Deployed", () =>{
            assert.ok(tracking.options.address);
        })
    });

    describe("Add a factory", () =>{
        it("Added", async () =>{
            var factory1 = await tracking.methods.factories(accounts[1]).call();
            assert(!factory1);
            await tracking.methods.addFactory(accounts[1])
                .send({from: accounts[0], gas: 3000000 });
            factory1 = await tracking.methods.factories(accounts[1]).call();
            assert(factory1);
            const process = await tracking.methods.processes(accounts[1]).call();
            assert.notEqual(process, 0x0);
        })

        it("Try require", async () =>{
            try {
                await tracking.methods.addFactory(accounts[2])
                    .send({from: accounts[1], gas: 3000000 });
                assert(false);
            } catch (error) {
                const err = error.results[error.hashes[0]].reason;
                assert.equal(err, "Only the manager");
            }
        });
    });
});
