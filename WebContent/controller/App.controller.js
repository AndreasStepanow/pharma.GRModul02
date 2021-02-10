sap.ui.define([ "sap/ui/core/mvc/Controller", "sap/m/MessageToast" ], function(
		Controller, MessageToast) {
	"use strict";

	return Controller.extend("de.arvato.GRModul02.controller.App", {
		
//		onInit : function() {			
//			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
//			//var oStoreObject = oStorage.get("MyStorage");
//			oStorage.put("MyStorage", {
//				Printer: "GW01"
//			});
//			debugger;
//		}
		
		onInit: function() {
    		// Bestimmt keine optimale Loesung!
			
			var oShell = sap.ui.getCore().byId("shell");
			if (oShell){
				oShell.setHeaderHiding(false);
			}
		}
	});
});