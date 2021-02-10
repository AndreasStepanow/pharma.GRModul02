sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator", "sap/ui/model/FilterType", "sap/m/MessageToast", "sap/m/MessageBox"
], function(Controller, JSONModel, Filter, FilterOperator, FilterType, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("de.arvato.GRModul02.controller.Main", {

	onInit : function() {

	    this.getOwnerComponent().registerMassageManager(this.getView());

	    this._oAppModel = this.getOwnerComponent().getModel("app");
	    this._oERPModel = this.getOwnerComponent().getModel("erp");
	    this._oERPModel.setSizeLimit(999); // set limit as many records you want to see once
	    this._oI18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

	    //
	    this._oAppModel.setProperty("/CurrentDate", new Date());

	    this.getOwnerComponent()._initSampleDataModel();

	    var oEmployeeID, aPrinter, aItemId;
	    var oComponentData = this.getOwnerComponent().getComponentData();
	    if (oComponentData) {
	    	
	    	if (oComponentData.hasOwnProperty("startupParameters")) {
	    		oEmployeeID = oComponentData.startupParameters['EmployeeID'];	    		
	    		aPrinter = oComponentData.startupParameters['Printer'];	    		
	    		aItemId = oComponentData.startupParameters['ItemId'];
	    		oComponentData.startupParameters = {};
	    	}
	    }

	    if (oEmployeeID && oEmployeeID.length > 0) {
			this.getOwnerComponent()._readEmployee(oEmployeeID[0], function() {			
				if (aPrinter && aPrinter.length > 0){
					this._oAppModel.setProperty("/Printer", aPrinter[0]);
				}	
				
				if (aItemId && aItemId.length > 0){
					this._oAppModel.setProperty("/ArticleData/ItemId", aItemId[0]);
				    this._oAppModel.setProperty("/ArticleData/Completely", true);
				    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				    oRouter.navTo("RoutePalletizing", {
			    		itemId: aItemId[0]
			    	});
				}
				
				this._oAppModel.setProperty("/ShowMessageForNextProcess", true);		
				
			    
			}.bind(this));
	    }
	    else {
			var that = this;
			this.getView().onAfterRendering = function() {
	
			    var oScanButton = this.getView().byId("idScanButton");
			    if (oScanButton) {
				oScanButton._onPress();
			    }
	
			    // sap.ndc.BarcodeScanner.scan(function(sResult) {
			    // that.getOwnerComponent()._readEmployee(sResult.text, function() {
			    // // var sUser = that._oAppModel.getProperty("/Employee/User");
			    // // var oCMRRefComboBox = that.getView().byId("idCheckComboBox");
			    // // var oBinding = oCMRRefComboBox.getBinding("items");
			    // // var aFilters = [];
			    // // aFilters.push(new Filter("Ernam", FilterOperator.EQ, sUser));
			    // // oBinding.filter(aFilters, FilterType.Application);
			    // });
			    // });
			}.bind(this)
	    }

	    var sState = this._oAppModel.getProperty("/Check/State/PreEntryCompleted");

	    //var oRoughGRComboBox = this.getView().byId("idRoughGRComboBox");
	    // // var oBinding = oCheckComboBox.getBinding("items");
	    // var aFilters = [];
	    // aFilters.push(new Filter("State", FilterOperator.EQ, sState));
	    // // oBinding.filter(aFilters, FilterType.Application);
	    //
	    // var oTemplate = new sap.ui.core.Item({
	    // key : "{erp>CmrRef}",
	    // text : "{erp>Client}-{erp>CmrRef}"
	    // });
	    //
	    // oCheckComboBox.bindItems({
	    // template : oTemplate,
	    // path : "/CheckSet",
	    // model : "erp",
	    // filters : aFilters
	    // });
	    //
	    // var oRoughGRComboBox = this.getView().byId("idRoughGRComboBox");
	    // // var oBinding = oCheckComboBox.getBinding("items");
	    // var aFilters = [];
	    // aFilters.push(new Filter("Open", FilterOperator.EQ, true));
	    // // oBinding.filter(aFilters, FilterType.Application);
	    //
	    // oTemplate = new sap.ui.core.Item({
	    // key : "{erp>Zgweno}",
	    // text : "{erp>Zgweno}"
	    // });
	    //
	    // oRoughGRComboBox.bindItems({
	    // template : oTemplate,
	    // path : "/RoughGRSet",
	    // model : "erp",
	    // filters : aFilters
	    // });

	    // Automatisches Aktualisieren der Liste (Prüfungen)
//	    this.oTrigger = new sap.ui.core.IntervalTrigger(10000);
//	    this.oTrigger.addListener(function() {
//		if (oRoughGRComboBox) {
//		    var oBinding = oRoughGRComboBox.getBinding("items");
//		    if (oBinding) {
//			oBinding.refresh();
//		    }
//		}
//
//	    }.bind(this));
	    
	    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	    oRouter.getRoute("RouteMain").attachMatched(this._onObjectMatched, this);

	    this.getOwnerComponent().addController(this);
	},
	
	_onObjectMatched : function(oEvent) {
		
//		var oRoughGRComboBox = this.getView().byId("idRoughGRComboBox");
//		if (oRoughGRComboBox) {
//		    var oBinding = oRoughGRComboBox.getBinding("items");
//		    if (oBinding) {
//		    	oBinding.refresh();
//		    }
//		}
	
	},
	
	onPrinterInputSuccess: function(oEvent) {
	    var sPrinter = oEvent.getParameter("value");
	    this._oAppModel.setProperty("/Printer", sPrinter.toUpperCase());
	},

	clear : function() {
	    var oRoughGRComboBox = this.getView().byId("idRoughGRComboBox");
	    oRoughGRComboBox.setSelectedKey();
	},

	onNavBack : function() {
	    var oHistory = History.getInstance();
	    var sPreviousHash = oHistory.getPreviousHash();
	    if (sPreviousHash !== undefined) {
	    	window.history.go(-1);
	    }
	    else {
	    	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	    	oRouter.navTo("RouteMain", true);
	    }
	},

	onNavForward : function() {
	    
	    // Über den Namen der Route (RouteLoading1) wird das Bild angesteuert
	    // Pattern wird in Browser-Link angezeigt.

	    if (this._oAppModel) {

			if (!this._oAppModel.getProperty("/Employee/Name")) {
			    sap.m.MessageToast.show(this._oI18nBundle.getText("Main.EmployeeBarcodeMustBeScaned"), {
				at : "center center"
			    });
			    return;
			}
//			else if (!this._oAppModel.getProperty("/CmrRef")) {
//			    sap.m.MessageToast.show(this._oI18nBundle.getText("Main.RoughGRMustBeSelected"), {
//				at : "center center"
//			    });
//			    
//			}
	    }	    

	    this.checkCheck();
	    
		//if (!bError) {
	    //oRouter.navTo("RouteArticleData");
	    //}
	},
	
	checkCheck: function() {
		
		var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		
		var oRoughGRComboBox = this.getView().byId("idRoughGRComboBox");
	    var oSelectedItem = oRoughGRComboBox.getSelectedItem();
	    if (!oSelectedItem){
	    	sap.m.MessageToast.show(this._oI18nBundle.getText("Main.RoughGRMustBeSelected"), {
				at : "center center"
			    });	    	
	    	return; 
	    }
	    
		var oBindingObject = oSelectedItem.getBindingContext("app").getObject();
	    if (!oBindingObject.Check) {
			MessageBox.show(this._oI18nBundle.getText("Main.CheckNotFound"), {
					icon: MessageBox.Icon.INFORMATION,
					title: this._oI18nBundle.getText("General.MessageBoxTitle"),
					actions: [MessageBox.Action.OK],
					onClose: function(oAction) {
						oRoughGRComboBox.setSelectedKey();	
					}
				});
			
			return;		
	    }
	    
	    var sReadUrl = this._oERPModel.createKey("/CheckSet", {
	    	CheckId: oBindingObject.Check.CheckId		    
		});	

	    this._oERPModel.read(sReadUrl, {
			success : function(oData, oResponse) {
	
			    if (oData.State === this._oAppModel.getProperty("/Check/State/PalletizingCompleted")) {										
					
					MessageBox.show(this._oI18nBundle.getText("Main.CheckCompleted", oData.CmrRef), {
						icon: MessageBox.Icon.INFORMATION,
						title: this._oI18nBundle.getText("General.MessageBoxTitle"),
						actions: [MessageBox.Action.OK],
						onClose: function(oAction) {
							oRoughGRComboBox.setSelectedKey();	
						}
					});
			    }
			    else {
			    	
					this._oAppModel.setProperty("/CheckId", oData.CheckId);
					this._oAppModel.setProperty("/CmrRef", oData.CmrRef);
					this._oAppModel.setProperty("/Client", oData.Client);
					
					oRouter.navTo("RouteArticleData",{
						checkId: oData.CheckId
					});
			    }
			}.bind(this),
			error : function(oError) {			    
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

	// onEmployeeBarcodeScanSuccess : function(oEvent) {
	//
	// var that = this;
	// var sText = oEvent.getParameter("text");
	// this.getOwnerComponent()._readEmployee(sText, function() {
	// // var oButton = that.getView().byId("idNavForwardButton");
	// // oButton.firePress();
	// });
	// },

	onEmployeeInputSuccess : function(oEvent) {
	    var sText = oEvent.getParameter("value");
	    this.getOwnerComponent()._readEmployee(sText, function() {
	    	var oScanButton = this.getView().byId("idPrintButton");
			if (oScanButton) {
			    oScanButton._onPress();
			}	
			
			this.getOwnerComponent()._readSUTypes(function(aSUTypes){				
				this._oAppModel.setProperty("/SUTypes", aSUTypes);
			}.bind(this));
			
			this.getOwnerComponent()._readRoughGR(function(aRoughGR){				
				this._oAppModel.setProperty("/RoughGRSet", aRoughGR);
			}.bind(this));			
			
	    }.bind(this));
	},
	
	onPalletizingClose: function(oEvent) {
	
		if (!this._oAppModel.getProperty("/Employee/Name")) {
		    sap.m.MessageToast.show(this._oI18nBundle.getText("Main.EmployeeBarcodeMustBeScaned"), {
		    	at : "center center"
		    });
		    return;
		}    

		var oRoughGRComboBox = this.getView().byId("idRoughGRComboBox");
		var oSelectedItem = oRoughGRComboBox.getSelectedItem();
		if (!oSelectedItem){
		   	sap.m.MessageToast.show(this._oI18nBundle.getText("Main.RoughGRMustBeSelected"), {
				at : "center center"
		    });
		   	return; 
		}		    
		
		var oOwner = this.getOwnerComponent();
		var sMessage = this._oI18nBundle.getText("General.DoComplet");
		MessageBox.confirm(sMessage, {
			actions : [ 
				sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.ABORT
			],
			onClose : function(oAction) {
				if(oAction === sap.m.MessageBox.Action.OK){  	
					oOwner._completedPalletizing({
						navTo: function() {
							
						}.bind(this)
					});
				}
			}.bind(this)
		}); 
	},

	onMessagePopoverPress : function(oEvent) {
	    this.getOwnerComponent()._getMessagePopover(this.getView()).openBy(oEvent.getSource());
	},

	// onCheckComboBoxSelectionChange : function(oEvent) {
	//
	// var oSelectedItem = oEvent.getSource().getSelectedItem();
	// this._oAppModel.setProperty("/CmrRef", oSelectedItem.getKey());
	//
	// var oBindingObject = oSelectedItem.getBindingContext("erp").getObject();
	// this._oAppModel.setProperty("/CheckId", oBindingObject.CheckId);
	// this._oAppModel.setProperty("/Client", oBindingObject.Client);
	// },

	onRoughGRComboBoxSelectionChange : function(oEvent) {

	    var oSelectedItem = oEvent.getSource().getSelectedItem();
	    if (!oSelectedItem){
	    	return;
	    }
	    this._oAppModel.setProperty("/Zgweno", oSelectedItem.getKey());

	    var oBindingObject = oSelectedItem.getBindingContext("app").getObject();
	    if (!oBindingObject.Check) {
//			MessageToast.show(this._oI18nBundle.getText("Main.CheckNotFound"), {
//			    duration : 3000,
//			    at : "center center"
//			});
		return;
	    }
	    
	    this._oAppModel.setProperty("/Zbetrst", oBindingObject.Zbetrst);
	    
	    var sReadUrl = this._oERPModel.createKey("/CheckSet", {
	    	CheckId: oBindingObject.Check.CheckId		    
		});	

	    this._oERPModel.read(sReadUrl, {
			success : function(oData, oResponse) {
	
//			    if (oData.State === this._oAppModel.getProperty("/Check/State/PalletizingCompleted")) {
//					MessageToast.show(this._oI18nBundle.getText("Main.CheckCompleted", oData.CmrRef), {
//					    duration : 3000,
//					    at : "center center"
//					});
//			    }
//			    else {
	
				this._oAppModel.setProperty("/CheckId", oData.CheckId);
				this._oAppModel.setProperty("/CmrRef", oData.CmrRef);
				this._oAppModel.setProperty("/Client", oData.Client);
				this._oAppModel.setProperty("/Lgnum", oData.Lgnum);
				
				this._oERPModel.setHeaders({
				    mandt: this._oAppModel.getProperty("/Client"),
				    zbetrst: this._oAppModel.getProperty("/Zbetrst"),
				    lgnum: oData.Lgnum
				});
				
//			    }
			}.bind(this),
			error : function(oError) {			    
			}
	    });

	    this._oERPModel.read("/RoughGRSet('" + oBindingObject.Zgweno + "')/RoughGRDocSet", {
		    filters : [
			    new sap.ui.model.Filter({
				path : "Doctype",
				operator : sap.ui.model.FilterOperator.EQ,
				value1 : "EX"
			    })
			],
			success : function(oData, oResponse) {
	
			    // Wir brauchen nur die eine Zuordnung zur Dokumententyp EX
			    if (oData.results.length > 0) {
				var oDoc = oData.results[0];
				this._oAppModel.setProperty("/PoNumber", oDoc.ZgweDocno);
				
//				this._oERPModel.setHeaders({
//				    mandt: this._oAppModel.getProperty("/Client")
//				});
	
				this._oERPModel.read("/POSet('" + oDoc.ZgweDocno + "')", {
				    urlParameters: {
				        "$expand": "POItemSet"
				    },
				    success : function(oData, oResponse) {				
					
					var aItems = oData.POItemSet.results;
					var iIndex = -1; 
					for(iIndex in aItems){
					    var oItem = aItems[iIndex];
					    this.getOwnerComponent().addArticle({Number: oItem.Matnr});
					}
									
				    }.bind(this),
				    error : function(oError) {
					
				    }
				});
	
			    }
			}.bind(this),
			error : function(oError) {
			    //debugger;
			}
	    });

	},

	onRoughGRInputSuccess : function(oEvent) {
	    var sRoughGR = oEvent.getParameter("value");
	    if (!sRoughGR) {
		return;
	    }

	    var oRoughGRComboBox = this.getView().byId("idRoughGRComboBox");
	    if (oRoughGRComboBox.getItemByKey(sRoughGR)) {
		var oSel = oRoughGRComboBox.setSelectedKey(sRoughGR);
		oRoughGRComboBox.fireEvent("selectionChange", {
		    selectedItem : oSel.getSelectedItem()
		});

	    }
	    else {
		sap.m.MessageToast.show(this._oI18nBundle.getText("Loading.RoughGRNotFound", sRoughGR));
	    }
	},

	onNewButtonPress : function() {
	    this.getOwnerComponent()._clearFormular({ full: true});
	},

	onMessagePopoverPress : function(oEvent) {
	    this.getOwnerComponent()._getMessagePopover(this.getView()).openBy(oEvent.getSource());
	},

    });
});
