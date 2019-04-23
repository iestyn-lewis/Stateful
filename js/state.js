/*
    These are global objects that hold configuration and state.

    Configuration means values that will remain unchanging over the lifecycle of the application.
    State means values that will change over the lifetime of the application.

    These objects may be named anything you want.  

    The control's shard() methods should reference the global state object and return just the portions
    that the control cares about.
*/


var objConfig = {
    newItemTemplate: {
        text: "",
        complete: false
    }
};

var objState = {        
    items: [],
    newItemText: "",
    indexToEdit: "-1",
    textEntered: false,
    error: ""
};

