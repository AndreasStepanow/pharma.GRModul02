sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent", "sap/m/MessageBox", "sap/m/MessageToast"
], function(Controller, UIComponent, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("de.arvato.GRModul02.controller.GEOData", {

	onInit : function() {

	    this.getOwnerComponent().registerMassageManager(this.getView());
	    this._oAppModel = this.getOwnerComponent().getModel("app");
	    this._oI18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
	},

	onNavBack : function() {
	    var oRouter = UIComponent.getRouterFor(this);
	    oRouter.navTo("RoutePalletizing");
	},

	onNavForward : function() {

	    var that = this;
	    var oOwner = this.getOwnerComponent();
	    
	    oOwner._saveGEOData().then(oOwner._createTransferOrder()
	    .then(function(oData) {
		
		if (!oData.PrintingSuccessful) {

		    MessageToast.show(this._oI18nBundle.getText("General.TOPrintFaulty", [
			oData.Tanum
		    ]), {
			autoClose: false,
			at: "center center",
			onClose : function() {
			    this.showMessageForNextProcess();
			}.bind(this)
		    });
		}
		else {
		    this.showMessageForNextProcess();		    
		}
	
	    }.bind(this)));    
	 
	},
	
	showMessageForNextProcess : function() {
	    
	    var oOwner = this.getOwnerComponent();

	    var sMessage = this._oI18nBundle.getText("General.MoreArticles");
	    var sCapture = this._oI18nBundle.getText("General.Capture");
	    var sCompleted = this._oI18nBundle.getText("General.Completed");

	    MessageBox.confirm(sMessage, {
		actions : [
			sCapture, sCompleted
		],
		onClose : function(oAction) {
		    switch (oAction) {
		    case sCapture:

			oOwner._clearFormular({
			    full : false
			}).then(function() {
			    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			    oRouter.navTo("RouteArticleData");
			}.bind(this));
			break;
		    case sCompleted:

			oOwner._updateCheck({
			    CheckId : this._oAppModel.getProperty("/CheckId"),
			    State : this._oAppModel.getProperty("/Check/State/PalletizingCompleted"),
			    StateDate: new Date()
			}).then(oOwner._clearFormular({
			    full : true
			}).then(function() {
			    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			    oRouter.navTo("RouteMain");
			}.bind(this)));

			break;
		    }
		}.bind(this)
	    });
	},

	onGoToSemanticObject : function(oEvent) {

	    this.getOwnerComponent().goToSemanticObject({
		SemanticObject : oEvent.getSource().data("SemanticObject"),
		Action : oEvent.getSource().data("action"),
		Parameters : {
		    "EmployeeID" : this._oAppModel.getProperty("/Employee/ID")
		}
	    });
	},

	onGEODataButtonPress : function(oEvent) {

	    var oToggleButton = oEvent.getSource();
	    // var oFlexBox = oToggleButton.getParent();
	    // var aButtons = oFlexBox.getItems();
	    //	    
	    // var sIndex;
	    // for (sIndex in aButtons){
	    // var oButton = aButtons[sIndex];
	    // if (oButton.getId() !== oToggleButton.getId()){
	    // oButton.setPressed(false);
	    // }
	    // }

	    var sPath = oToggleButton.getBindingContext("app").getPath();
	    var oFlex = this.getView().byId("idFormLoading1");
	    oFlex.bindElement({
		path : sPath,
		model : "app"
	    });
	},

	onGEODataSelectionChange : function(oEvent) {

	    var oSelectedItem = oEvent.getSource().getSelectedItem();
	    var sPath = oSelectedItem.getBindingContext("app").getPath();

	    var oFlex = this.getView().byId("idFormLoading1");
	    oFlex.bindElement({
		path : sPath,
		model : "app"
	    });

	},

	onMessagePopoverPress : function(oEvent) {
	    this.getOwnerComponent()._getMessagePopover(this.getView()).openBy(oEvent.getSource());
	},
    });
});
