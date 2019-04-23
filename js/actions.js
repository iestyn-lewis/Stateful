/*
    Actions should take input and modify the state accordingly.  Usually the action
    will end with a call to stateful.update();

    There is nothing special about the name or organization of the actions.  In general:
    * Actions should take generic arguments (not the names of controls)
    * Actions should not "know" anything about controls, ie, do not query or update page controls in an action
    * Actions generally end with a call to stateful.update
*/


var actions = (function() {
    return {
        addItem() {
            if (objState.newItemText == "elephant") {
                objState.error = "The instructions regarding elephant were quite clear.  :)";
            } else {
                objState.items.push({text: objState.newItemText, complete: false});   
                objState.error = ""; 
            }
            objState.textEntered = false;
            objState.newItemText = "";
            stateful.update();
        },
        deleteItem() {
            objState.items.splice(objState.indexToDelete, 1);
            objState.indexToDelete = -1;
            stateful.update();
        },
        setTextEntered(text) {
            objState.textEntered = true;
            objState.newItemText = text;
            stateful.update();
        },
        completeItem(index) {
            objState.items[index].complete = !objState.items[index].complete;
            stateful.update();
        },
        editItem(index) {
            objState.indexToEdit = index;
            stateful.update();    
        },
        commitItemEdit(index, text) {
            objState.items[index].text = text;
            objState.indexToEdit = -1;
            stateful.update();
        },
        cancelItemEdit() {
            objState.indexToEdit = -1;
            stateful.update();
        }
    }
})();