pragma solidity ^0.8.15;


contract Tracking_Process {
    address public manager;
    mapping(address => bool) public factories;
    mapping(address => address) public processes;

    constructor(){
        manager = msg.sender;
    }

    function addFactory(address factory) public {
        require(msg.sender == manager);
        factories[factory] = true;
    }

    function createTracker() public returns (address) {
        require(factories[msg.sender]);
        Process process = new Process(msg.sender, address(this));
        processes[msg.sender] = address(process);
        return address(process);
    }
}

contract Process{
    //Structures
    struct Information{
        uint units;
        string name;
        string origin;
    }

    //Fields
    address public factory;
    address private tracking_process;
    Information[] public inputs;
    Information[] public resources;
    Information[] public outputs;
    mapping(string => uint) public countOutput;

    //Modifier
    modifier restricted(){
        require(msg.sender == factory, "You don't have access to this function");
        _;
    }

    modifier protected() {
        Tracking_Process master = Tracking_Process(tracking_process);
        require(master.factories(tx.origin), "You don't have access to this function");
        _;
    }


    //Constructor
    constructor(address Factory, address tracking){
        factory = Factory;
        tracking_process = tracking;
    }


    //Methods
    function addInput(uint _units, string memory _name, string memory _origin) public protected{
        Information memory newInput = Information({
            units: _units,
            name: _name,
            origin: _origin
        });

        inputs.push(newInput);
    }

    function addResource(uint _units, string memory _name, string memory _origin) public restricted{
        Information memory newResource = Information({
            units: _units,
            name: _name,
            origin: _origin
        });
        
        resources.push(newResource);
    }

    function addOutput(uint _units, string memory _name, string memory _origin) public restricted{
        Information memory newOutput = Information({
            units: _units,
            name: _name,
            origin: _origin
        });
        
        outputs.push(newOutput);
        countOutput[_name] = _units;
    }

    function sendOutput(uint _units, string memory _name, string memory _origin,
                        address _addr) public restricted
    {
        require(countOutput[_name] >= _units);
        countOutput[_name] -= _units;
        Process(_addr).addInput(_units, _name, _origin);
    }
}

    /*struct Livraison{
        string transporterName;
        address receiver;
        mapping(string => uint) cargaison;
        uint expeditionDate;
        uint livraisonDate;
    }*/


    /*Livraison[] transport;

    /*function sendOutputs(string memory transporterName, string memory name,
                        uint quantity, address receiver) public restricted
    {
        Livraison storage livraison = transport.push();
        livraison.transporterName = transporterName;
        livraison.receiver = receiver;
        livraison.expeditionDate = block.timestamp;
        livraison.cargaison[name] = quantity;
    }*/