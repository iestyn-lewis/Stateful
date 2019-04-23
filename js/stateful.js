/*
    Why a state framework?

    In a typical event-driven JQuery application, application state tends to be scattered throughout the page,
    with some information residing in global variables, some as the values of the controls on the page, and others elsewhere.

    In addition, control event handlers tend to set properties of other controls directly, which quickly leads to confusion
    and bugs as event handlers overlap or are called unintentionally.

    A state framework attempts to address this by enforcing the following:
        * All application state must be contained in a single, document level state object.  
        * Control event handlers should call business-level logic functions.  These functions serve as an API to the state object.
        * Control event handlers never modify any control on the page themselves.
        * Business level logic functions should update the state object as appropriate, then call the framework's update() method.
        * The state framework then calls all of the controls on the page with the new state and gives the controls an opportunity
          to update themselves based on the new state.
        * For performance and refresh reasons, it's a good idea if the state framework has some method to tell which pieces of 
          state information each control cares about, so updates can be done intelligently only as information changes that affects 
          each control.
    
    The benefits of a state framework are:
        * Rather than an N-to-N communication graph, where every page element may potentially interact with every other page element,
          communication is now N-to-1 via the state object, and then 1-to-N back out to the controls.
        * Changes to the nature of the controls becomes much easier as new controls can be added or changed as needed by simply implementing
          the shard and update methods, and implementing event handlers that call well-defined business layer functions.
        * The entire state of the application can be inspected at any time, making debugging much easier.
*/

/*
    This is the state framework, here called "stateful".  It only knows about one thing: an array of control objects.
    You pass in the array of control objects in the init function.

    Each control object may implement any or all of these functions:
    * init - will be called by stateful once at application init
    * shard - will be called by stateful prior to an update.  shard should return the portion
              or portions of the global state object that the control is interested in.
              This will be used by stateful to determine whether or not to call the control's
              update method.
    * update - will be called by stateful when the control needs to update itself.
               If the control provided a shard method, the results of the shard() call
               will be passed to the control.  Otherwise the update method will be called
               whenever stateful.update is called.  
    Except for very simple controls, the usage of shard is recommended, as it ensures that the 
    control will only be asked to update when the state that it cares about has changed.
*/

var stateful = (function() {
    var statefulControls = {};
    return {
        // initialize stateful with the object containing the page control handlers
        init: function(controls) {
            statefulControls = controls;
            // call init() on each control that supports it
            Object.keys(statefulControls).forEach(function(key) {
                var control = statefulControls[key];
                if (control.init) {
                    control.init();
                }
            });
           this.update();
        },
        update: function() {
            // iterate over all control handlers
            Object.keys(statefulControls).forEach(function(key) {
                var control = statefulControls[key];
                // if the control implements shard(), call it.
                // The control will hand back the items from the state object that it cares about.
                if (control.shard) {
                    var newItem = control.shard();
                    var newItemHash = stateful._hashCode(newItem);
                    control.cache = control.cache || -1;
                    // compare the results that the control gave us last time with the cached value
                    // on the control.  If they differ, call update on the control.
                    if (newItemHash != control.cache) {
                        control.cache = newItemHash;
                        if (control.update) {
                            control.update(newItem);
                        }        
                    }
                } else {
                    // if the control does not implement shard(), simply call update().
                    if (control.update) {
                        control.update();
                    }    
                }
            })
        },
        // _hashCode is used to compare objects with one another.  
        _hashCode: function(obj) {
            var str = JSON.stringify({data:obj});
            var hash = -1;
            if (str.length == 0) return hash;
            for (var i = 0; i < str.length; i++) {
                var char = str.charCodeAt(i);
                hash = ((hash<<5)-hash)+char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
        }
    }
})();