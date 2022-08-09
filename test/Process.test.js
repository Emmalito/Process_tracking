const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const compiledProcess = require("../ethereum/build/Process.json");

let accounts;
let process;


describe("Contract Process", () => {

    beforeEach( async() => {
        accounts = await web3.eth.getAccounts();

        process = await new web3.eth.Contract(compiledProcess.abi)
            .deploy({ data: compiledProcess.evm.bytecode.object, arguments: [accounts[1], accounts[2]]})
            .send({ from: accounts[0], gas: 3000000});

        await process.methods.addResource(0, 150, "Eau")
            .send({from: accounts[1], gas: 1500000 });
        await process.methods.addResource(1, 150, "Travail")
            .send({from: accounts[1], gas: 1500000 });
        await process.methods.addResource(2, 150, "Plastique")
            .send({from: accounts[1], gas: 1500000 });
        await process.methods.addOutput([0,1], [40, 100], 50, "Bouteille")
            .send({from: accounts[1], gas: 1500000 });
    });

    describe("Good deployment", () =>{
        it("Deployed", ()=>{
            assert.ok(process.options.address);
        });
    });

    describe("Test methods", () => {
        it("Try addResource", async () =>{
            var resource = await process.methods.inputs(0).call();
            assert.equal(resource.quantity, 110);
            assert.equal(resource.name, "Eau");
            assert.equal(resource.origin, process.options.address);
        });

        it("Try addOutput and getOutputItem", async () =>{
            var output = await process.methods.outputs(1000).call();
            var outputItems = await process.methods.getOutputItem(1000).call();

            assert.equal(output.name, "Bouteille");
            assert.equal(output.quantity, 50);
            assert.equal(outputItems['0'][0], '0');
            assert.equal(outputItems['0'][1], '1');
            assert.equal(outputItems['1'][0], '40');
            assert.equal(outputItems['1'][1], '100');
        });
    });


    describe("Test restricted methods", () =>{
        it("Try modifier restricted", async () =>{
            try {
                await process.methods.addResource(5, 150, "Eau")
                    .send({from: accounts[2], gas: 1500000 });
                assert(false)
            } catch (error) {
                const err = error.results[error.hashes[0]].reason;
                assert.equal(err, "You don't have access to this function");
            }
            try {
                await process.methods.addOutput([0], [0], 50, "Bouteille")
                    .send({from: accounts[2], gas: 1500000 });
                assert(false)
            } catch (error) {
                const err = error.results[error.hashes[0]].reason;
                assert.equal(err, "You don't have access to this function");
            }
            try {
                await process.methods.sendOutput(0, 0, accounts[0])
                    .send({from: accounts[2], gas: 1500000 });
                assert(false)
            } catch (error) {
                const err = error.results[error.hashes[0]].reason;
                assert.equal(err, "You don't have access to this function");
            }
        });

        it("Try require in addResource", async () => {
            try {
                await process.methods.addResource(0, 50, "Bouteille")
                    .send({from: accounts[1], gas: 1500000 });
                assert(false);
            } catch (error) {
                const err = error.results[error.hashes[0]].reason;
                assert.equal(err, "This id is already used")
            }
        });

        it("Try require in addOutput", async () =>{
            try {
                await process.methods.addOutput([0], [0,0], 50, "Bouteille")
                    .send({from: accounts[1], gas: 1500000 });
                assert(false);
            } catch (error) {
                const err = error.results[error.hashes[0]].reason;
                assert.equal(err, "Not enougth arguments in the list");
            }
            try {
                await process.methods.addOutput([0,0], [0], 50, "Bouteille")
                    .send({from: accounts[1], gas: 1500000 });
                assert(false);
            } catch (error) {
                const err = error.results[error.hashes[0]].reason;
                assert.equal(err, "Not enougth arguments in the list");
            }

            try {
                await process.methods.addOutput([0,1,2], [10,15, 200], 50, "Bouteille")
                    .send({from: accounts[1], gas: 1500000 });
                assert(false);
            } catch (error) {
                const err = error.results[error.hashes[0]].reason;
                assert.equal(err, "Not enougth quantity in the stock");
            }
            var resource = await process.methods.inputs(0).call();
            assert.equal(resource.quantity, 110);
            resource = await process.methods.inputs(1).call();
            assert.equal(resource.quantity, 50);
            resource = await process.methods.inputs(2).call();
            assert.equal(resource.quantity, 150);
        });

        it("Try require in sendOutput", async () =>{

            try {
                await process.methods.sendOutput(1000, 55, accounts[3])
                    .send({from: accounts[1], gas: 1500000 });
                assert(false);
            } catch (error) {
                const err = error.results[error.hashes[0]].reason;
                assert.equal(err, "Not enougth quantity in the stock");
            }
            var output = await process.methods.outputs(1000).call();
            assert.equal(output.quantity, 50);
        });
    });
});
