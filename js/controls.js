/*
    This is an object containing all of the control objects for the application.  There are only a few rules:
    * If an object contains an init() function, it will be called once when the application starts.
    * If an object contains a shard() function, that function should return the piece of the global state object that the control cares about.
            For instance, if a control is responsible for rendering someone's first name, the shard object should return objState.firstName.
    * If an object contains an update() function, it will be called whenever the control needs to update itself.  
            If the object has provided a shard() function, the update function will be called whenever the return value of 
            the shard function differs from the previous value returned by the control's shard function.  Additionally, the 
            value returned by the shard() function will be passed into the update() function.
            If the object has not provided a shard() function, update() will be called each time stateful updates.
    Everything else is a recommendation or convention:
        * It is best practice to use the shard function for efficient updating and clarity
        * It is best practice to use only the value passed into update by the shard function to update the control, rather than directly referencing
          the state object in the update function.
        * If a control is responsible for a page element, it is best practice to name the control after the element's id.
        * It is convenient to provide an el() function that returns the jquery page element.
        * It is best practice to place all business logic in a separate set of "actions" functions that can be called as one-liners from event handlers
          defined at the control level.  The actions can then call stateful.update() as necessary.
        * By convention, controls that represeent page elements dynamically at run time should expose methods:
                * html() - create and return the html necessary to place the control on the page
                * bind() - bind necessary event handlers to the newly created control.
*/

var objControls = {
    btnAdd: {
        el: function() {
            return $("#btnAdd");
        },
        init: function() {
            this.el().on('click', function() {
                actions.addItem();
            });
        },
        shard: function() {
            return objState.textEntered;
        },
        update: function(textEntered) {
            console.log("rerender add");
            this.el().prop('disabled', textEntered == false);
        }
    },
    txtInput: {
        el: function() {
            return $("#txtInput");
        },
        init: function() {
            var me = this;
            this.el().on('keyup', function(e) {
                if (e.keyCode == 13) {
                    actions.addItem();
                } else {
                    actions.setTextEntered(me.el().val());
                }
            });
        },
        shard: function() {
            return objState.newItemText;
        },
        update: function(newItemText) {    
            console.log("rerender input");
            this.el().val(newItemText);
        }
    },
    spanError: {
        el: function() {
            return $("#spanError");
        },
        shard: function() {
            return objState.error;
        },
        update: function(error) {
            if (error) {
                this.el().show();
                this.el().text(error);
            } else {
                this.el().hide();
            }
        }
    },
    itemCount: {
        el: function() {
            return $("#itemCount");
        },
        shard: function() {
            return objState.items.length;
        },
        update: function(numItems) {
            console.log("rerender count");
            if (numItems == 0) {
                this.el().text("No items in list.");
            } else {
                this.el().text(`${numItems} items in list.`);
            }
        }
    },
    tblList: {
        el: function() {
            return $("#tblList");
        },
        shard: function() {
            return {
                items: objState.items,
                editIndex: objState.indexToEdit
            };
        },
        update: function(shard) {
            console.log("rerender list");
            var rows = "";
            shard.items.forEach(function(item, index){
                rows += objControls.rowListItem.html(index, shard.editIndex);
            })
            var html = "";
            if (objState.items.length > 0) {
                html = `<table class="table">
                            <tr>
                                <th>Item (Click to Edit)</th>
                                <th>Complete</th>
                                <th>Delete</th>
                            </tr>
                            ${rows}
                        </table>`;
            }
            this.el().html(html);
            objControls.rowListItem.bind();
        }
    },
    rowListItem: {
        klass: "rowItem",
        el: function() {
            return $("." + this.klass);
        },
        bind: function() {
            objControls.listItemText.bind();
            objControls.btnDelete.bind();
            objControls.btnComplete.bind();
        },
        html: function(index, editIndex) {
            return `<tr class="${this.klass}" id="${this.klass}_${index}">
                <td>${objControls.listItemText.html(index, editIndex)}</td>
                <td>${objControls.btnComplete.html(index)}</td>
                <td>${objControls.btnDelete.html(index)}</td>
            </tr>`;
        }
    },
    listItemText: {
        klass: "itemText",
        el: function() {
            return $("." + this.klass);
        },
        bind: function() {
            objControls.listItemDisplay.bind();
            objControls.listItemInput.bind();
        },
        html: function(index, editIndex) {
            if (index == editIndex) {
                return `${objControls.listItemInput.html(index)}`;
            } else {
                return `${objControls.listItemDisplay.html(index)}`;
            }
        }
    },
    listItemDisplay: {
        klass: "itemDisplay",
        el: function() {
            return $("." + this.klass);
        },
        bind: function() {
            console.log ("bind display");
            this.el().on('click', function() {
                console.log("click display");
                actions.editItem(this.id.split("_")[1]);
            })
        },
        html: function(index) {
            var text = `${objState.items[index].text}`;
            if (objState.items[index].complete) {
                text = `<del>${text}</del>`;
            }
            return `<span id="${this.klass}_${index}" class="${this.klass}">${text}</span>`;
        }
    },
    listItemInput: {
        klass: "itemInput",
        el: function() {
            return $("." + this.klass);
        },
        bind: function() {
            var me = this;
            this.el().on('keyup', function(e) {
                var index = this.id.split("_")[1];
                switch (e.keyCode) {
                    case 13:
                        actions.commitItemEdit(index, me.el().val());
                        break;
                    case 27:
                        actions.cancelItemEdit();
                        break;
                }
            });
            this.el().focus();
            this.el().select();
        },
        html: function(index) {
            return `<input id="${this.klass}_${index}" class="form form-control ${this.klass}" value="${objState.items[index].text}" /">`;
        }
    },
    btnDelete: {
        klass: "btnDelete",
        el: function() {
            return $("." + this.klass);
        },
        bind: function() {
            this.el().on('click', function() {
                actions.deleteItem(this.id.split("_")[1]);
            })
        },
        html: function(index) {
            return `<button class="btn btn-sm ${this.klass}" id="${this.klass}_${index}">Del</button>`;
        }
    },
    btnComplete: {
        klass: "btnComplete",
        el: function() {
            return $("." + this.klass);
        },
        bind: function() {
            this.el().on('click', function() {
                actions.completeItem(this.id.split("_")[1]);
            })
        },
        html: function(index) {
            var checked = objState.items[index].complete ? "checked" : "";
            return `<input type=checkbox ${checked} class="${this.klass}" id="${this.klass}_${index}" />`;
        }
    },
    stateViewer: {
        el: function() {
            return $("#stateViewer");
        },
        update: function() {
            this.el().val(JSON.stringify(objState, null, 4));
        }
    }
}

$(document).ready(function() {
    stateful.init(objControls);
});