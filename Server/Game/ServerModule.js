ServerModule = function(moduleId, data, piece) {
    this.id = moduleId;
    this.data = data;
    this.piece = piece;
    this.appliedCallback = function() {};
    this.state = {value:null};
    this.lastValue = 'noValue';
};

ServerModule.prototype.setModuleState = function(state) {

    if (this.id == 'shield')  {
        //    console.log("Set Shield module state: ", state)
    }

    if (state == undefined) {
        return;

    };

    this.state.value = state;
};

ServerModule.prototype.setApplyCallback = function(callback) {
    this.appliedCallback = callback;
};

ServerModule.prototype.processModuleState = function(serverState) {
    this.setModuleState(serverState.value);


    switch (this.data.applies.type) {
        case "toggle":
            //       console.log("Toggle type", this);
            if (this.state.value == this.data.applies.state) {
                //        this.appliedCallback(this.data.applies.message)
            }
            break;

        case "boolean":
            if (this.state.value == this.data.applies.state) {
                this.appliedCallback(this.data.applies.message)
            }
            break;
        case "array":
            this.appliedCallback(this.data.applies.message+' _ '+this.id+' _ '+this.state.value);
            break;
        case "string":
            this.appliedCallback(this.data.applies.message+' _ '+this.id+' _ '+this.state.value);
            break;
        case "float":
            this.appliedCallback(this.data.applies.message+' _ '+this.id+' _ '+this.state.value);
            break;
        default:
            if (this.state.value > Math.abs(this.data.applies.threshold)) {
                this.appliedCallback(this.data.applies.message+' _ '+this.id+' _ '+this.state.value)
            }
    }
};

ServerModule.prototype.updateControlConstants = function(controls, constants, onOff) {
    for (var key in constants) {
        this.modifyControlConstants(controls, key, constants[key], onOff);
    }
};


ServerModule.prototype.modifyControlConstants = function(controls, constant, modifier, onOff) {

    if (onOff) {

        if (this.lastValue === 'noValue' && onOff === false) {
            console.log("Add noValue", constant, modifier)
            return;
        }

        console.log("Add modifier", constant, modifier)
        controls.constants[constant] += modifier;
    } else {

        if (this.lastValue === 'noValue' && onOff === false) {
            console.log("Remove noValue", constant, modifier)
            return;
        }

        console.log("Remove modifier", constant, modifier)
        controls.constants[constant] -= modifier;
    }

    this.lastValue = onOff;

};

ServerModule.prototype.processInputState = function(controls, actionCallback) {

    if (this.data.applies.type === 'toggle') {
        if (this.state.value != this.lastValue) {

            if (this.data.applies.control_constants) {
                if (this.state.value == false) console.log("is false")
                this.updateControlConstants(controls, this.data.applies.control_constants, this.state.value)
            }
        }


        // module controls itself...
        //    console.log(controls.inputState[this.data.source])
        //    if (this.id == 'shield')  console.log("Process Shield state: ", this.state.value)
        this.lastValue = this.state.value;
        return;
    }

    this.setModuleState(controls.inputState[this.data.source]);

    if (typeof(controls.actions[this.data.applies.action]) != undefined) {
        controls.actions[this.data.applies.action] = this.state.value;

        if (typeof(actionCallback) == 'function') {
            actionCallback(this.data.applies.action, this.state.value, this.data);
        }
    }

    this.lastValue = this.state.value;
};