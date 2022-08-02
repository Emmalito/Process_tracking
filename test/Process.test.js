const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const {abi, evm} = require("../compile_process");

let accounts;
let process;

beforeEach( async() => {
    accounts = await web3.eth.getAccounts();

    process = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object, arguments: [accounts[1], accounts[2]]})
        .send({ from: accounts[0], gas: 1500000});
});


describe("Contract Process", () => {
    describe("Good deployment", () =>{
        it("Deployed", ()=>{
            assert.ok(process.options.address);
        });

        it("Good factory address", async () =>{
            const addrFact = await process.methods.factory().call();
            assert.equal(addrFact, accounts[1]);
        });
    });


    describe("Test methods", () => {
        it("Try addResource", async () =>{
            await process.methods.addResource(15, "Eau", "Robinet 4")
                .send({from: accounts[1], gas: 1500000 });
            var resource = await process.methods.resources(0).call({arguments: [0]});
            assert.equal(resource.units, 15);
            assert.equal(resource.name, "Eau");
            assert.equal(resource.origin, "Robinet 4");
        });

        it("Try addOutput", async () =>{
            await process.methods.addOutput(4, "Fer", "RDC")
                .send({from: accounts[1], gas: 1500000 });
            var output = await process.methods.outputs(0).call({arguments: [0]});
            assert.equal(output.units, 4);
            assert.equal(output.name, "Fer");
            assert.equal(output.origin, "RDC");
        });
    });


    describe("Test restricted methods", () =>{
        it("Try modifier addResource", async () =>{
            try {
                await process.methods.addResource(15, "Eau", "Robinet 4")
                    .send({from: accounts[2], gas: 1500000 });
                assert(false)
            } catch (error) {
                assert.ok(error)
            }
        });

        it("Try modifier addOutput", async () =>{
            try {
                await process.methods.addOutput(15, "Fer", "Fes")
                    .send({from: accounts[2], gas: 1500000 });
                assert(false)
            } catch (error) {
                assert.ok(error)
            }
        });

        it("Try modifier sendOutput", async () =>{
            try {
                await process.methods.sendOutput(15, "Fer", "Fes")
                    .send({from: accounts[1], gas: 1500000 });
                assert(false)
            } catch (error) {
                assert.ok(error)
            }
        });
    });
});
