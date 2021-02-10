sap.ui.define([
	"sap/ui/core/mvc/Controller", "de/arvato/GRModul02/libs/Helper", 'sap/m/MessageToast', 'sap/m/MessageBox'
], function(Controller, Helper, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("de.arvato.GRModul02.controller.Confirmation", {

	onInit : function() {

	    this.getOwnerComponent().registerMassageManager(this.getView());

	    // this._oLocalModel = this.getOwnerComponent().getModel("local");
	    this._oAppModel = this.getOwnerComponent().getModel("app");
	    this._oI18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

	    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	    oRouter.getRoute("RouteConfirmation").attachMatched(this._onObjectMatched, this);
	},

	_onObjectMatched : function(oEvent) {

	},

	onNavBack : function() {
	    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	    oRouter.navTo("RouteGEOData");
	},

	onNavForward : function() {

	    var aGroups = [
		    this.getView().byId("idArticleDataGroup"), this.getView().byId("idGEODataGroup"),
		    this.getView().byId("idAccordanceGroup")

	    ];

	    if (!Helper.isInputValid(null, null, aGroups)) {
		sap.m.MessageToast.show(this._oI18nBundle.getText("General.InputNotComplete"), {
		    at : "center center"
		});
		return;
	    }

	    var oNextButton = this.getView().byId("idConfirmNavButton");
	    //oNextButton.setBusy(true);
	    
	    var oOwner = this.getOwnerComponent();	    
	    oOwner._updateDocItem().then(oOwner._createTransferOrder().then(function(oData) {

		if (!oData.PrintingSuccessful) {

		    MessageToast.show(this._oI18nBundle.getText("General.TOPrintFaulty", [
			oData.Tanum
		    ]), {
			//duration : 3000,
			autoClose: false,
			at: "center center",
			onClose : function() {
			    this.showMessageForNextProcess();
			    //oNextButton.setBusy(false);
			}.bind(this)
		    });
		}
		else {
		    this.showMessageForNextProcess();
		    oNextButton.setBusy(false);
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
			    State : this._oAppModel.getProperty("/Check/State/PalletizingCompleted")
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

	onMessagePopoverPress : function(oEvent) {
	    this.getOwnerComponent()._getMessagePopover(this.getView()).openBy(oEvent.getSource());
	},
    });
});
