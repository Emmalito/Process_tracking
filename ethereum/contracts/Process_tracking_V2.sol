pragma solidity ^0.8.15;


contract Process_Tracking {
    address public manager;
    mapping(address => bool) public factories;
    mapping(address => bool) public hauliers;
    mapping(address => address) public processes;

    //Constructor
    constructor(){
        manager = msg.sender;
    }


    //Method
    function addFactory(address factory) public returns (address){
        require(msg.sender == manager, "Only the manager");
        factories[factory] = true;
        Process process = new Process(factory, address(this));
        processes[factory] = address(process);
        return address(process);
    }

    function addHauliers(address haulier) public {
        require(msg.sender == manager, "Only the manager");
        hauliers[haulier] = true;
    }
}



contract Process{
     //Structures
    struct Information{
        uint idOutput;
        uint quantity;
        address origin;
    }

    struct Output{
        uint[] inputs;
        uint[] inputsQuantities;
        uint quantity;
    }

    //Fields
    address public factory;
    address private process_tracking;
    mapping(uint => Information) public inputs;
    mapping(uint => Output) public outputs;
    uint private outputIdx;

    //Modifier
    modifier restricted(){
        require(msg.sender == factory, "You don't have access to this function");
        _;
    }

    modifier protected() {
        Process_Tracking master = Process_Tracking(process_tracking);
        require(master.factories(tx.origin), "You don't have access to this function");
        _;
    }


    //Constructor
    constructor(address Factory, address tracking){
        factory = Factory;
        process_tracking = tracking;
        outputIdx = 1000;
    }


    //Event
    event Shipment(address _haulier, address _to, uint _quantity, uint _id);
    event Delivery(address _haulier, address _to, uint _quantity, uint _id);


    //Methods
    // This method can replace addResource
    function addInput(uint _idOutput, uint _quantity) external protected {
        require(inputs[_idOutput].quantity == 0, "This id is already used");
        inputs[_idOutput] = Information({
            idOutput: _idOutput,
            quantity: _quantity,
            origin: msg.sender
        });
    }

    function addOutput(uint[] memory _inputs, uint[] memory _quantities,
    uint _quantity) public restricted returns(uint)
    {
        require(_inputs.length == _quantities.length, "Not enougth arguments in the list");
        Output storage output = outputs[outputIdx];
        for(uint idx=0; idx <_inputs.length; idx++){
            require(inputs[_inputs[idx]].quantity >= _quantities[idx], "Not enougth quantity in the stock");
            inputs[_inputs[idx]].quantity -= _quantities[idx];
            output.inputs.push(_inputs[idx]);
            output.inputsQuantities.push(_quantities[idx]);
        }
        output.quantity = _quantity;
        outputIdx += 1;
        return outputIdx - 1;
    }

    function sendOutput(uint _id, uint _quantity, address _processAddr,
    address _haulier) public restricted
    {
        Output storage output = outputs[_id];
        Process_Tracking master = Process_Tracking(process_tracking);
        require(master.hauliers(_haulier));
        require(output.quantity >= _quantity, "Not enougth quantity in the stock");
        output.quantity -= _quantity;
        emit Shipment(_haulier, _processAddr, _quantity, _id);
    }

    function deliver (address _to, uint _quantity, uint _id) public restricted{
        Process_Tracking master = Process_Tracking(process_tracking);
        require(master.hauliers(msg.sender));
        Process(_to).addInput(_id, _quantity);
        emit Delivery(msg.sender, _to, _quantity, _id);
    }
}
