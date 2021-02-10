sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent", "sap/m/MessageBox", "sap/m/MessageToast",
    "de/arvato/GRModul02/libs/Helper"
], function(Controller, UIComponent, MessageBox, MessageToast, Helper) {
    "use strict";

    var __Context = {

    		onInit : function() {    		    
    		    
    		    this.getOwnerComponent().registerMassageManager(this.getView());
    		    this._oAppModel = this.getOwnerComponent().getModel("app");	  
    		    this._oI18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
    		    
    		    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
    		    oRouter.getRoute("RoutePalletizing").attachMatched(this._onPalletizingObjectMatched, this);
    		    
    		    this.getOwnerComponent().addController(this);    		    
    		    this.addPallet(true);    
    		    
//    		    var oStorageUnitTypeComboBox = this.getView().byId("idStorageUnitTypeComboBox");
//     		    var oTemplateItem = new sap.ui.core.Item({key: "{erp>Letyp}", text: "{erp>Letyp}"});
//     		    var oLgnumFilter = new sap.ui.model.Filter({
//         			path : "Lgnum",
//         			operator : sap.ui.model.FilterOperator.EQ,
//         			value1 : this._oAppModel.getProperty("/Lgnum")
//         		    });
//     		    oStorageUnitTypeComboBox.bindItems({
//     		    	path: "/SUTypeSet",
//     		    	model: "erp",
//     		    	template: oTemplateItem,
//     		    	templateShareable:true,
//     		    	filters:[oLgnumFilter],
//     		    	events: {
//    					change: function(oData){debugger;}.bind(this),
//    					dataRequested: function(oData){debugger;}.bind(this),
//    					dataReceived: function(oData){debugger;}.bind(this),
//    				}
//     		    }); 
    	    },
    
    		_onPalletizingObjectMatched: function(oObjectMatchedEvent) {
    			
    			var sPath = "/DocItemSet(guid'" + oObjectMatchedEvent.getParameter("arguments").itemId + "')";
    			this.getView().bindElement({
    				path: sPath,
    				model: "erp",
    				parameters: {
    					expand: "CheckSet"
    				},
    				events: {
    					change: this._onBindingChange.bind(this),
    					dataRequested: function (oDataRequestedEvent) {    	
    						this.getView().setBusy(true);
    					}.bind(this),
    					dataReceived: this._onDataReceived.bind(this)
    				}
    			});
    		},
    		
    		_onBindingChange: function(oBindingChangeEvent) {
    			    			
    			var oItem = oBindingChangeEvent.getSource().getBoundContext().getObject();    
    			this._oAppModel.setProperty("/CheckId", oItem.CheckId);
    			this._oAppModel.setProperty("/ArticleData/ItemId", oItem.ItemId);
    			this._oAppModel.setProperty("/ArticleData/Number", oItem.Matnr);
    			this._oAppModel.setProperty("/ArticleData/Name", oItem.Maktx);
    			this._oAppModel.setProperty("/ArticleData/MaterialAvailable", true);
    			this._oAppModel.setProperty("/ArticleData/StockAvailable", true);
    			    			
    			this._oAppModel.setProperty("/ArticleData/BatchNumber", oItem.Charg); 
    			if (oItem.Vfdat){		
	    			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
	    				 pattern: 'yyyy-MM-ddTHH:mm:ss'
					});				 
				    this._oAppModel.setProperty("/ArticleData/ExpiryDate", dateFormat.format(oItem.Vfdat));
				    this._oAppModel.setProperty("/ArticleData/BatchAvailable", true);  				    
    			}
			      			
    			if(oItem.Serial = "1"){
    				this._oAppModel.setProperty("/ArticleData/Serial/yes", true);
    			} else if(oItem.Serial = "0"){
    				this._oAppModel.setProperty("/ArticleData/Serial/no", true);
    			}
    			if(oItem.Verify = "1"){
    				this._oAppModel.setProperty("/ArticleData/Verify/yes", true);
    			} else if(oItem.Verify = "0"){
    				this._oAppModel.setProperty("/ArticleData/Verify/no", true);
    			}
    			
    			var oERPModel = this.getOwnerComponent().getModel("erp");
    			var oCheck = oERPModel.getData("/" + oItem.CheckSet.__ref);
    			this._oAppModel.setProperty("/Client", oCheck.Client);
    			this._oAppModel.setProperty("/Zbetrst", oCheck.Zbetrst);
    			this._oAppModel.setProperty("/CmrRef", oCheck.CmrRef);
    			this._oAppModel.setProperty("/Lgnum", oCheck.Lgnum);
    			    					    			 
    			oERPModel.setHeaders({ 
			    	 lgnum: this._oAppModel.getProperty("/Employee/Lgnum"),
			    	 mandt: this._oAppModel.getProperty("/Client"),
					 zbetrst: this._oAppModel.getProperty("/Zbetrst"),
			    });    
    			
    			if (this._oAppModel.getProperty("/ShowMessageForNextProcess")) {
    				this.showMessageForNextProcess();    				
    				this._oAppModel.setProperty("/ShowMessageForNextProcess", false);
    			} 
    			
    			// Dieses Teil wurde bereits auskommentiert. 
    			// Nach dem Zurückkehren von SumCheck, werden dann aber die LE-.Typen
    			// nicht geladen!
    			this.getOwnerComponent()._findSUTypes({ Lgnum: oCheck.Lgnum  }).then(function(oData){
    				this._oAppModel.setProperty("/SUTypes", oData.results);
    			}.bind(this));
    		},
    		
    		_onDataReceived: function(oDataReceivedEvent) {
    			this.getView().setBusy(false);
    		},
    		
    		onSemanticObject : function(oEvent) {
    			
//    		    this.getOwnerComponent().goToSemanticObject({
//    		    	SemanticObject : oEvent.getSource().data("SemanticObject"),
//    		    	Action : oEvent.getSource().data("action"),
//    		    	Parameters : {
//    		    		"EmployeeID" : "TEST_USER",//this._oAppModel.getProperty("/Employee/ID"),
//    		    		"Tanum": "2750105522" //this._oAppModel.getProperty("/ArticleData/HuId")
//    					}
//    		    	});
    		},

    		
    		clear: function() {
    			this._oAppModel.setProperty("/ArticleData/Pallets", []);
    		    this.addPallet(true);	
    		},

    		onNavBack : function() {
    			sap.ui.core.UIComponent.getRouterFor(this).initialize();
    		    var oRouter = UIComponent.getRouterFor(this);
    		    oRouter.navTo("RouteArticleData", {
    		    	checkId: this._oAppModel.getProperty("/CheckId")
    		    });
    		},
    		
    		onNavForward : function() {	  
    		    	    
    			 var oOwner = this.getOwnerComponent();
    			 this.getView().setBusy(true);
    			 oOwner._saveDocHUs()
    		    		.then(oOwner._createTransferOrder()    		    			
    		    			.then(function(oData) {
    		    				this.getView().setBusy(false);
    		    				var fnReprint = function(fnPrinfSuccess) {
      		    					if (oData.TanumBruch){
	    		    					oOwner._printTransferOrder({
	        		    					Printer: this._oAppModel.getProperty("/Printer"),
	        		    					Mandt: this._oAppModel.getProperty("/Client"),
	        		    					Tanum: oData.TanumBruch
	        		    				}).then(function(oData1) {   
	        		    					oOwner._printTransferOrder({
	            		    					Printer: this._oAppModel.getProperty("/Printer"),
	            		    					Mandt: this._oAppModel.getProperty("/Client"),
	            		    					Tanum: oData.Tanum
	            		    				}).then(function(oData2) {
	            		    					fnPrinfSuccess(oData)
	            		    				}.bind(this));
	        		    				}.bind(this));   
    		    					} else {
    		    						oOwner._printTransferOrder({
            		    					Printer: this._oAppModel.getProperty("/Printer"),
            		    					Mandt: this._oAppModel.getProperty("/Client"),
            		    					Tanum: oData.Tanum
            		    				}).then(function(oData2) {     
            		    					fnPrinfSuccess(oData)
            		    				}.bind(this));
    		    					}    		    					
								}.bind(this);
													   			
								this.getView().setBusy(true);
								fnReprint(function(oData){								   			
					    			this.getView().setBusy(false);
									this.showMessageTransferOrderPrintSuccessfull(oData, fnReprint);
								}.bind(this));
    		    					
    		    		}.bind(this), function(oError){
    		    			this.getView().setBusy(false);
    		    		}.bind(this))
    		    , function(){
    		    	this.getView().setBusy(false);
    		    }.bind(this));
    		},
    		
    		showMessageTransferOrderPrintSuccessfull: function(oData, fnReprint){
    			
    			var sTanum = oData.Tanum;
    			if (oData.TanumBruch && oData.TanumBruch !== oData.Tanum){
    				sTanum = (oData.TanumBruch ? oData.TanumBruch + "/" : "") + oData.Tanum;
    			}
    			
    			var sMessage = this._oI18nBundle.getText("General.TransferOrderPrintSuccessfull", [sTanum]);    		    	    		 
	    		var sReprint = this._oI18nBundle.getText("General.Reprint");	 
				
   				MessageBox.confirm(sMessage, {
   	    				actions : [ 
   	    					sap.m.MessageBox.Action.OK, sReprint
   	    				],
   	    				onClose : function(oAction) {
   	    					if(oAction === sap.m.MessageBox.Action.OK){  	
   	    						
   	    						//TODO: Prüfen, ob FULL-relevant und Weiterleitung
   	    						if ( oData.FullRelevant === true){
   	    							this.goToQMCheck({ Tanum: oData.Tanum, TanumBruch: oData.TanumBruch });  
   	    						} else {
   	    							this.showMessageForNextProcess();        		    	    							
   	    						}        		    	    						
   	    						    		    	    						
   	    					} else if (oAction === sReprint){    	    			   			
   	    						this.getView().setBusy(true);
   	    						fnReprint(function(){   
   	    							this.getView().setBusy(false);
   	    							this.showMessageTransferOrderPrintSuccessfull(oData, fnReprint);
   	    						}.bind(this));
   	    					}
   	    				}.bind(this)
   				 });
    		},
    		
    		showMessageForNextProcess : function() {
    		    
    		    var oOwner = this.getOwnerComponent();

    		    var sMessage = this._oI18nBundle.getText("General.MoreArticles");
    		    var sCapture = this._oI18nBundle.getText("General.Capture");
    		    var sEquals = this._oI18nBundle.getText("General.Equals");	    
    		    var sCompleted = this._oI18nBundle.getText("General.Completed");

    		    MessageBox.confirm(sMessage, {
    				actions : [
    					sEquals, sCapture, sCompleted
    				],
    				onClose : function(oAction) {
    				    switch (oAction) {
    				    case sCapture:
    		
    						oOwner._clearFormular({
    						    full : false
    						}).then(function() {
    						    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
    						    oRouter.navTo("RouteArticleData",{
    						    	checkId: this._oAppModel.getProperty("/CheckId")
    						    });
    						}.bind(this));
    						break;
    					
    				    case sEquals:
    				    	this.clear();
    				    	break;
    				    case sCompleted:   
    				    	
    				    	var sMessage = this._oI18nBundle.getText("General.DoComplet");
    						 MessageBox.confirm(sMessage, {
    			    				actions : [ 
    			    					sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.ABORT
    			    				],
    			    				onClose : function(oAction) {
    			    					if(oAction === sap.m.MessageBox.Action.OK){  	
    			    						oOwner._completedPalletizing({
    			    							navTo: function() {
    			    								var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
    			    							    oRouter.navTo("RouteMain");
												}.bind(this)
    			    						}); 			
    			    					} else if (oAction === sap.m.MessageBox.Action.ABORT){
    			    						this.showMessageForNextProcess();
    			    					}
    			    				}.bind(this)
    						 }); 
    				    				
    						break;
    				    }
    				}.bind(this)
    		    });
    		},
    		
    		goToQMCheck: function(oData) {
    			
    			this.getOwnerComponent().goToSemanticObject({
       		    	SemanticObject: this._oAppModel.getProperty("/QMCheckSemanticObjekt"),
       		    	Action : this._oAppModel.getProperty("/QMCheckAction"),
       		    	Parameters : {
       		    		"EmployeeID": this._oAppModel.getProperty("/Employee/ID"),
       		    		"EmployeeName": this._oAppModel.getProperty("/Employee/Name"),
       		    		"Printer": this._oAppModel.getProperty("/Printer"),
       		    		"ItemId": this._oAppModel.getProperty("/ArticleData/ItemId"),
       		    		"Tanum": oData.Tanum,
       		    		"TanumBruch": oData.TanumBruch
       					}
       		    	});
			},
    		
    		setSelectedStorageUnitType: function() {
    		    
    		    var iIndex = 0;	    
    		    var oTable = this.getView().byId("idPalletTable");
    		    for( iIndex in oTable.getRows()){
    			var oRow = oTable.getRows()[iIndex];
    			var oContext = oRow.getBindingContext("app");
    			if (oContext){
    			    var oPallet = this._oAppModel.getProperty(oContext.getPath());
    			    if (oPallet){
    				oRow.getCells()[0].setSelectedKey(oPallet.Type);
    				//oRow.getCells()[0].setSelectedKey(oPallet.Letyp);
    			    }
    			}
    		    }
    		    
    		},
    		
    		onFractureCheckBox: function(oEvent) {
    		    var bSelected = oEvent.getParameter("selected");
    		    var oRow = oEvent.getSource().getParent();
    		    var oTable = oRow.getParent();
    		    if (bSelected){   		    	
    		    	this.addPallet(false);    		    	
    		    	var oRow1 = oTable.getRows()[1];
    		    	if(oRow1){
    		    		oRow1.getCells()[0].setSelectedKey("");
    		    	}
    		    } else {
    		    	
    		    	var oPallet = oRow.getBindingContext("app").getObject();
    		    	this.deletePallet(oPallet);
    		    	var oRow0 = oTable.getRows()[0];
    		    	oRow0.getCells()[0].setSelectedKey(this._oAppModel.getData().ArticleData.Pallets[0].Type);
    		    	
    		    	if(oPallet.HuId){
    					this.getOwnerComponent()._updateDocHU({
    						HuId: oPallet.HuId,
    						State: "44" // Geloescht durch Operator
    					}).then(function() {});
    	    		 }
    		    	
    		    }
    		},
    		
    		addPallet: function( bEnabled ) {
    		    
    		    var oData = this._oAppModel.getData();       		  
	    		var oPal = {"Number" : this._getRandomInt(999),
			    			"Type" : "",
			    			"Amount" : "",
			    			"Count" : 1,
			    			"Bruch": false,	
			    			"Enabled": bEnabled,
			    			"Mixed": false };
	    		
	    		oData.ArticleData.Pallets.push(oPal);
	    			
//	    		if (bEnabled){    		    
//	    			oData.ArticleData.Pallets.push(oPal);
//	    		} else {	    			
//	    			oData.ArticleData.Pallets.unshift(oPal);
//	    		}
    		  
    		    this._oAppModel.setData(oData);
    		    
    		    this.setSelectedStorageUnitType();
    		},
    		
    		onAddNewPallettPress : function(oEvent) {
    		    this.addPallet();	
    		},
    		
    		
    		deletePallet: function(oPallet) {
    		    
    		    var oList = this._oAppModel.getProperty("/ArticleData/Pallets");
    			if (oList && Array.isArray(oList)){
    			    var iIndex = oList.findIndex(obj => obj.Number == oPallet.Number);    			    
    			    oList.splice(iIndex, 1);
    			    var oObj = oList[0];
    			    if (oObj){
    			    	oObj.Enabled = true;
    			    }
    			    this._oAppModel.refresh();
    		   	}		
    		},
    		
    		onDeletePallettPress : function(oEvent) {

    		    var oTable = this.getView().byId("idPalletTable");
    		    if (oTable.getSelectedIndex() > -1) {
    			
	    			var oRow = oTable.getRows()[oTable.getSelectedIndex()];
	    			var oContext = oRow.getBindingContext("app");
	
	    			var oObject = oContext.getObject();
	    			this.deletePallet(oObject);
    					
    		    }
    		    
    		    this.setSelectedStorageUnitType();
    		},
    		
    		onSubmitCountInput: function() {
    		    this.onAddNewPallettPress();
    		    
    		    var oTable = this.getView().byId("idPalletTable");
    		    var oComboBox= this.getView().byId("idStorageUnitTypeComboBox");
    		    
    		    oTable.addEventDelegate({
    			onAfterRendering: function(d){
    		            var iIndexNewRow = this._oAppModel.getProperty("/ArticleData/Pallets").length;
    			    oTable.getRows()[iIndexNewRow-1].getCells()[0].focus();    	            
    		        }
    		    });
    		   
    		},
    		
    		onRowSelectionChange: function() {
    		  //debugger;  
    		},
    		
    		_getRandomInt : function(max) {
    		    return Math.floor(Math.random() * Math.floor(max));
    		},	
    		
    		onSUTComboBoxSelectionChange: function(oEvent) {
    	 
    		   var oSource = oEvent.getSource();
    		   var sSelectedText = oSource.getSelectedItem().getKey();
    		   this._oAppModel.setProperty(oSource.getParent().getBindingContext("app").getPath() + "/Type", sSelectedText);
    		   
    		   var oObject = oSource.getParent().getBindingContext("app").getObject();
    		   if(oObject.HuId){
					this.getOwnerComponent()._updateDocHU({
						HuId: oObject.HuId,
						Amount: oObject.Amount,
						Count: oObject.Count,
						Type: oObject.Type,
						Bruch: oObject.Bruch ? "X" : "",
						Tanum: ""
					}).then(function() {
						
					})
    		   }    	
    		},	
    		
    		onMessagePopoverPress : function(oEvent) {
    		    this.getOwnerComponent()._getMessagePopover(this.getView()).openBy(oEvent.getSource());
    		},
    };
    
    return Controller.extend("de.arvato.GRModul02.controller.Palletizing", __Context);
});
