sap.ui.define(["sap/ui/model/json/JSONModel"], function(JSONModel) {
    'use strict';
    
    return {
    	LENGTH_OF_COMMENTS: 58,
    	init: function(oComponent){
    		oComponent.setModel(new JSONModel(this), "const");
    	}
    };

});