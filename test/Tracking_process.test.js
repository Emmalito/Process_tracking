const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const compiledPT = require("../ethereum/build/Process_Tracking.json");
const Process = require("../ethereum/build/Process.json");

let accounts;
let manager;
let process1;
let process2;


describe("Interaction between the contracts", () => {
    beforeEach( async() => {
        accounts = await web3.eth.getAccounts();

        manager = await new web3.eth.Contract(compiledPT.abi)
            .deploy({ data: compiledPT.evm.bytecode.object})
            .send({ from: accounts[0], gas: 3000000});

        await manager.methods.addFactory(accounts[1])
            .send({from: accounts[0], gas: 3000000 });
        await manager.methods.addFactory(accounts[2])
            .send({from: accounts[0], gas: 3000000 });

        const addr1 = await manager.methods.processes(accounts[1]).call();
        process1 = await new web3.eth.Contract(Process.abi, addr1);

        const addr2 = await manager.methods.processes(accounts[2]).call();
        process2 = await new web3.eth.Contract(Process.abi, addr2);
    });

    describe("Deployment", () =>{
        it("Process Tracking contract deployed", ()=>{
            assert.ok(manager.options.address);
        });
        it("Process 1 contract deployed", ()=>{
            assert.ok(process1.options.address);
        });
        it("Process 2 contract deployed", ()=>{
            assert.ok(process2.options.address);
        });
    })


    describe("Test methods", () =>{
        it("sendOutput and addInput", async () =>{
            await process1.methods.addResource(0, 150, "Eau")
                .send({from: accounts[1], gas: 1500000 });
            await process1.methods.addResource(1, 150, "Travail")
                .send({from: accounts[1], gas: 1500000 });
            await process1.methods.addResource(2, 150, "Plastique")
                .send({from: accounts[1], gas: 1500000 });
            await process1.methods.addOutput([0,1], [40, 100], 50, "Bouteille")
                .send({from: accounts[1], gas: 1500000 });

            const res0 = await process2.methods.inputs(1000).call();
            assert.equal(res0.quantity, 0);

            await process1.methods.sendOutput(1000, 30, process2.options.address)
                .send({from: accounts[1], gas: 1500000 });

            const res1 = await process2.methods.inputs(1000).call();

            assert.equal(res1.quantity, 30);
            assert.equal(res1.name, "Bouteille");
            assert.equal(res1.origin, process1.options.address);
        });
    });

    describe("Test require", () =>{
        it("sendOutput outside the factories list", async () =>{
            const process3 = await new web3.eth.Contract(Process.abi)
                .deploy({ data: Process.evm.bytecode.object, arguments: [accounts[3], accounts[5]]})
                .send({ from: accounts[3], gas: 3000000});

            await process3.methods.addResource(0, 150, "Eau")
                .send({from: accounts[3], gas: 1500000 });
            await process3.methods.addResource(1, 150, "Travail")
                .send({from: accounts[3], gas: 1500000 });
            await process3.methods.addResource(2, 150, "Plastique")
                .send({from: accounts[3], gas: 1500000 });
            await process3.methods.addOutput([0,1], [40, 100], 50, "Bouteille")
                .send({from: accounts[3], gas: 1500000 });

            try {
                await process1.methods.sendOutput(1000, 30, process2.options.address)
                    .send({from: accounts[3], gas: 1500000 });
                assert(false);
            } catch (error) {
                const err = error.results[error.hashes[0]].reason;
                assert.equal(err, "You don't have access to this function");
            }
        });
    });
});
