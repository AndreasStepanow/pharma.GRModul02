// Version 2.1.0
sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent", "de/arvato/GRModul02/libs/Helper", 
	"sap/m/MessageBox", "sap/m/MessageToast", "de/arvato/GRModul02/libs/formatter"
	], function(Controller, UIComponent, Helper, MessageBox, MessageToast, formatter) {
    "use strict";

    return Controller.extend("de.arvato.GRModul02.controller.ArticleData", {
    	
	onInit : function() {

	    // set message model
	    var oView = this.getView();
	    this.getOwnerComponent().registerMassageManager(this.getView());

	    this._oAppModel = this.getOwnerComponent().getModel("app");
	    this._oI18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
	    
	    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	    oRouter.getRoute("RouteArticleData").attachMatched(this._onArticleDataObjectMatched, this);

	    this.getView().onAfterRendering = function() {

		var oArtikeNummer = this.getView().byId("idArticleNumber");
		oArtikeNummer.addEventDelegate({
		    onfocusout : function() {
		    	this.loadArticledata();		
		    	
		    }.bind(this)
		});
						
		var oBatchNummer = this.getView().byId("idBatchNumber");
		oBatchNummer.addEventDelegate({
		    onfocusout : function() {
		    	this.loadBatchdata();
		    }.bind(this)
		});

	    }.bind(this);

	},
	
	loadSpecialProcess: function(){	   
	    var oMessage = {};
	    oMessage.Id = '001';
	    oMessage.Client = this._oAppModel.getProperty("/Client");
	    this.getOwnerComponent().readMessage(oMessage).then(function(aResult){		
		if(aResult.length > 0){
		    this._oAppModel.setProperty("/SpecialProcess/visible", true);		
		    var aProcess = JSON.parse(aResult[0].Values);
		    this._oAppModel.setProperty("/ArticleData/SpecialProcess/List", aProcess);
		} else {
		    this._oAppModel.setProperty("/SpecialProcess/visible", false);
		}
	    }.bind(this));
	},
	
	loadMaterialRelatedProcess: function(){	   
	    var oMessage = {};
	    oMessage.Id = '002';
	    oMessage.Client = this._oAppModel.getProperty("/Client");
	    oMessage.Material = this._oAppModel.getProperty("/ArticleData/Number");
	    
	    var oProcess = this._oAppModel.getProperty("/ArticleData/SpecialProcess/Current");
	    if(oProcess && oProcess.selected){
		oMessage.SpecialProcess = oProcess.id;
        	this.getOwnerComponent().readMessage(oMessage).then(function(aResult){
            		if(aResult.length > 0) {
            		    var sText = aResult[0].Values;
            		    MessageBox.show(sText, {
            			icon: MessageBox.Icon.INFORMATION,			
            			actions: [MessageBox.Action.OK]	});
            		}
        		
        	}.bind(this));
	    }
	},
	
	onSpecialProcessListSelectionChange: function (oSelectionChangeEvent) {   
	    if (oSelectionChangeEvent.getParameter("selected")){
		var aProcess = this._oAppModel.getProperty("/ArticleData/SpecialProcess/List");
		var oProcess = oSelectionChangeEvent.getParameter("listItem").getBindingContext("app").getObject();
		oProcess.selected = true; 
		this._oAppModel.setProperty("/ArticleData/SpecialProcess/Current", oProcess);
		
		if (oProcess.showMsg === 'X'){
		    MessageBox.show(oProcess.text, {
			icon: MessageBox.Icon.INFORMATION,			
			actions: [MessageBox.Action.OK]	});
		}
		
	    } else {
		this._oAppModel.setProperty("/ArticleData/SpecialProcess/Current", {});
	    }
	},
	
	_onArticleDataObjectMatched: function(oObjectMatchedEvent) {

		var sPath = "/CheckSet(guid'" + oObjectMatchedEvent.getParameter("arguments").checkId + "')";
		this.getView().bindElement({
			path: sPath,
			model: "erp",
//			parameters: {
//				expand: "DocItem,CheckSet,CheckSet/RoughGRSet,TransferOrder"
//			},
			events: {
				change: this._onBindingChange.bind(this),
				dataRequested: function (oDataRequestedEvent) {
				}.bind(this),
				dataReceived: this._onDataReceived.bind(this)
			}
		});
	},
	
	_onBindingChange: function(oBindingChangeEvent) {
		
		var oCheck = oBindingChangeEvent.getSource().getBoundContext().getObject();		
		this._oAppModel.setProperty("/CheckId", oCheck.CheckId);
		this._oAppModel.setProperty("/CmrRef", oCheck.CmrRef);
		this._oAppModel.setProperty("/Client", oCheck.Client);	
		
		// Check special process
		this.loadSpecialProcess();
	},
	
	_onDataReceived: function(oDataReceivedEvent) {
	},
	
	saveArticleGEOData: function() {
		
		var iCount = 0;
		var oGEOData = this._oAppModel.getProperty("/GEOData/ST");
		var bComplete =  this._oAppModel.getProperty("/GEOData/STcomplete");
		if(bComplete){
			this.getOwnerComponent()._saveArticleGEOData(oGEOData).then(function() {
				this.getView().setBusy(false);
				if (!this._oAppModel.getProperty("/GEOData/captured")){
					this._oAppModel.setProperty("/GEOData/captured", true);
					this._oAppModel.setProperty("/GEOData/showGeodataCrctMessage", true)
					sap.m.MessageToast.show(this._oI18nBundle.getText("ArtikelGeo.SaveSuccessfull"), {
			    		at : "center center"
			    	});
				}
			}.bind(this),
			function(){
				this.getView().setBusy(false);
			}.bind(this));
			iCount++;
		}
		
		oGEOData = this._oAppModel.getProperty("/GEOData/ALH");
		bComplete =  this._oAppModel.getProperty("/GEOData/ALHcomplete");
		if(bComplete){
			this.getOwnerComponent()._saveArticleGEOData(oGEOData).then(function() {
				this.getView().setBusy(false);
				if (!this._oAppModel.getProperty("/GEOData/captured")){
					this._oAppModel.setProperty("/GEOData/captured", true);			
					this._oAppModel.setProperty("/GEOData/showGeodataCrctMessage", true)
					sap.m.MessageToast.show(this._oI18nBundle.getText("ArtikelGeo.SaveSuccessfull"), {
			    		at : "center center"
			    	});
				}
			}.bind(this),
			function(){
				this.getView().setBusy(false);
			}.bind(this));
			iCount++;
		}
		
		oGEOData = this._oAppModel.getProperty("/GEOData/AUH");
		bComplete =  this._oAppModel.getProperty("/GEOData/AUHcomplete");
		if(bComplete){
			this.getOwnerComponent()._saveArticleGEOData(oGEOData).then(function() {
				this.getView().setBusy(false);
				if (!this._oAppModel.getProperty("/GEOData/captured")){
					this._oAppModel.setProperty("/GEOData/captured", true);		
					this._oAppModel.setProperty("/GEOData/showGeodataCrctMessage", true)
					sap.m.MessageToast.show(this._oI18nBundle.getText("ArtikelGeo.SaveSuccessfull"), {
			    		at : "center center"
			    	});
				}
			}.bind(this),
			function(){
				this.getView().setBusy(false);
			}.bind(this));
			iCount++;
		}

	},
	
	onGEODataDialog: function(oEvent) {
						
		if (this._oAppModel.getProperty("/ArticleData/Number")){
			
			var oDialog = Helper.getGEODatenDialog({
				view: this.getView(),			
				title: this._oI18nBundle.getText("ArtikelGeo.Title"),
				success: function() {
					this.saveArticleGEOData();	
				}.bind(this), 
				abort: function() {					
				}.bind(this)
			});
			
			if (!oDialog.isOpen()){
				oDialog.open();
			}
		} else {
			sap.m.MessageToast.show(this._oI18nBundle.getText("ArtikelGeo.NoArticle"), {
	    		at : "center center"
	    	});
		}
		
	},
	
	loadBatchdata: function() {
		
		var oOwner = this.getOwnerComponent();
		var sMatnr = this._oAppModel.getProperty("/ArticleData/Number");
		var sBatch = ""; //this._oAppModel.getProperty("/ArticleData/BatchNumber");
		
		
		if (sBatch === "") {
		    // Bei ersten onfocusout() wird gerade Binding gesetzt
			sBatch = this.getView().byId("idBatchNumber").getValue();
		}	
		
		sBatch = sBatch.toUpperCase();
		this._oAppModel.setProperty("/ArticleData/BatchNumber", sBatch);
		this._oAppModel.setProperty("/ArticleData/BatchAvailable", false);
		this._oAppModel.setProperty("/ArticleData/Completely", false);
		
		 if (sBatch !== "") {				
			oOwner._readBatch({
			    Matnr : sMatnr,
			    Charg : sBatch
			});
		};
	},
	
	loadArticledata: function() {
		var oOwner = this.getOwnerComponent();
		//var sMatnr = this._oAppModel.getProperty("/ArticleData/Number");
		//if (sMatnr === "") {
		    // Bei ersten onfocusout() wird gerade Binding gesetzt
		var sMatnr = this.getView().byId("idArticleNumber").getValue();
		this._oAppModel.setProperty("/ArticleData/Name", "");
		this._oAppModel.setProperty("/ArticleData/Completely", false);
		//}	
		
		sMatnr = sMatnr.toUpperCase();
		this._oAppModel.setProperty("/ArticleData/Number", sMatnr);
		
		if(sMatnr === ""){			
		} else if (!oOwner.isArtcleAllowed({
		    Number : sMatnr
		})) {
		    var sPoNumber = this._oAppModel.getProperty("/PoNumber");
		    MessageBox.show(this._oI18nBundle.getText("ArticleData.ArticleNotInPO", [sMatnr, sPoNumber]), {
			icon : MessageBox.Icon.INFORMATION,
			title : "My message box title",
			actions : [
				MessageBox.Action.YES, MessageBox.Action.NO
			],
			onClose : function(oAction) {
			    switch (oAction) {
			    case MessageBox.Action.YES:
				break;
			    case MessageBox.Action.NO:
				this._oAppModel.setProperty("/ArticleData/Number", "");
				break;
			    }
			}.bind(this)
		    });
		}
		
		//var sMaktx = this.getView().byId("idArticleName").getValue();
		//if (sMaktx === "") {		
		    if (sMatnr !== "") {				
				oOwner._readMaterial({
				    Matnr : sMatnr,
				    Werks : ""
				}, function() {
				    this.initGEOData();
				    this.loadMaterialRelatedProcess();
				}.bind(this));
		    }
		//}
	},
	
	initGEOData: function(){
	    this._oAppModel.setProperty("/GEOData/captured", false);
		
	    this._oAppModel.setProperty("/GEOData/ST", undefined);	
	    this._oAppModel.setProperty("/GEOData/ALH",  undefined);	
	    this._oAppModel.setProperty("/GEOData/AUH", undefined);
	
	    this._oAppModel.setProperty("/GEOData/STcomplete", false);
	    this._oAppModel.setProperty("/GEOData/ALHcomplete", false);
	    this._oAppModel.setProperty("/GEOData/AUHcomplete", false);
	
	    this._oAppModel.setProperty("/GEOData/STcolor", "#FF0000");
	    this._oAppModel.setProperty("/GEOData/ALHcolor", "#FF0000");
	    this._oAppModel.setProperty("/GEOData/AUHcolor", "#FF0000");
    	},	

	onNavBack : function() {
	    
	    var oSelectedItem = this.getView().byId("idSpecialProcessList").getSelectedItem();
		if(oSelectedItem){
		    oSelectedItem.setSelected(false);
		}
		
		// Error State entfernen
		var aInputs = [
			this.getView().byId("idSerializationGroup"), 
			//this.getView().byId("idVerificationGroup")	  ,
	    	//this.getView().byId("idAccordanceGroup"), 
	    	//this.getView().byId("idGeodataCrctGroup"),
		    this.getView().byId("idArticleNumber"), 
		    this.getView().byId("idBatchNumber"),
		    this.getView().byId("idExpiryDate")];
		
		aInputs.forEach(function(item){
			item.setValueState("None");
		});	    
		
		var aPallets = this._oAppModel.getProperty("/ArticleData/Pallets");
		var sIndex;
	    for (sIndex in aPallets){					
			var oPallet = aPallets[sIndex];
			if(oPallet.HuId){
				this.getOwnerComponent()._updateDocHU({
					HuId: oPallet.HuId,
					State: "44" // Geloescht durch Operator
				}).then(function() {});
			 }
	    }	
				
		this.getOwnerComponent()._clearFormular({ full: true});
		
		this.getOwnerComponent()._readSUTypes(function(aSUTypes){				
			this._oAppModel.setProperty("/SUTypes", aSUTypes);
		}.bind(this));
		
		this.getOwnerComponent()._readRoughGR(function(aRoughGR){				
			this._oAppModel.setProperty("/RoughGRSet", aRoughGR);
		}.bind(this));	
		
		
	    var oRouter = UIComponent.getRouterFor(this);
	    oRouter.navTo("RouteMain");
	},
	
	

	onNavForward : function(oForwardEvent) {

	    var aGroups = [
	    	this.getView().byId("idSerializationGroup")
	    	//this.getView().byId("idVerificationGroup")	
	    	//this.getView().byId("idAccordanceGroup") 
	    	//this.getView().byId("idGeodataCrctGroup")
	    ];
	    
	    var aInputs = [
	    	this.getView().byId("idArticleNumber")
	    ];    


	    if (!Helper.isInputValid(aInputs, null, aGroups)) {
	    	sap.m.MessageToast.show(this._oI18nBundle.getText("General.InputNotComplete"), {
	    		at : "center center"
	    	});
	    	return;
	    }
	    
	    if(this._oAppModel.getProperty("/ArticleData/BatchObligation")){
	    	
	    	if (!this.getView().byId("idBatchNumber").getValue() ){
	    		this.getView().byId("idBatchNumber").setValueState("Error");
	    		
	    		sap.m.MessageToast.show(this._oI18nBundle.getText("General.BatchObligation"), {
		    		at : "center center"
		    	});
	    		
	    		return;
	    	} else {
	    		this.getView().byId("idBatchNumber").setValueState("None");	
		    }
	    	
	    	if (!this.getView().byId("idExpiryDate").getValue()){
	    		this.getView().byId("idExpiryDate").setValueState("Error");
	    		
	    		sap.m.MessageToast.show(this._oI18nBundle.getText("General.BatchObligationExpiryDate"), {
		    		at : "center center"
		    	});
	    		
	    		return;
    		} else {
    			this.getView().byId("idExpiryDate").setValueState("None");	
		    }
	    }
	    
	    this.fnForwards = function() {
	    	
	    	var that = this;
	    	
	    	// Brauche ich immer, falls bereits vornahden!
	    	//this.getOwnerComponent()._readGEOData();

	    	// Falls vorhanden wird nicht angelegt!
	    	if (this._oAppModel.getProperty("/ArticleData/BatchNumber") &&
	    			this._oAppModel.getProperty("/ArticleData/BatchAvailable") === false ){
	    		
	    	    this.getOwnerComponent()._createBatch({
	    	    	Matnr: this._oAppModel.getProperty("/ArticleData/Number"),
	    	    	Charg: this._oAppModel.getProperty("/ArticleData/BatchNumber"),
	    	    	Vfdat: this._oAppModel.getProperty("/ArticleData/ExpiryDate")
	    	    }, function(){
	    	    	this.getView().setBusy(false);
	    	    }.bind(this), function(){
	    	    	this.getView().setBusy(false);
	    	    }.bind(this));
	    	}

//	    	var bArticleCompletely = this._oAppModel.getProperty("/ArticleData/Completely");
//	    	if (bArticleCompletely) {
//	    		
//	    		var oRouter = UIComponent.getRouterFor(that);
//	    		oRouter.navTo("RoutePalletizing", {
//	    			itemId: this._oAppModel.getProperty("/ArticleData/ItemId")
//	    		});
//	    	}
//	    	else {
	    		
    		var sItemId = this._oAppModel.getProperty("/ArticleData/ItemId");
    		if(sItemId){	    			
    	    	this._oAppModel.setProperty("/ArticleData/ItemId", sItemId);
    	    	this._oAppModel.setProperty("/ArticleData/Completely", true);
    	    	var oRouter = UIComponent.getRouterFor(that);
    	    	oRouter.navTo("RoutePalletizing", {
    	    		itemId: sItemId
    	        });
    		} else {
    			this.getView().setBusy(true);
    			this.getOwnerComponent()._saveDocItem().then(function(oData) {
    				this.getView().setBusy(false);
		    	    this._oAppModel.setProperty("/ArticleData/ItemId", oData.ItemId);
		    	    this._oAppModel.setProperty("/ArticleData/Completely", true);
		    	    var oRouter = UIComponent.getRouterFor(that);
		    	    oRouter.navTo("RoutePalletizing", {
		        		itemId: oData.ItemId
		        	});
		    	}.bind(this));
    		}
//	    	}	
		};
		
		this.getView().byId("idNawForwardButton").setEnabled(false);
		this.getView().setBusy(true);		
		this.getOwnerComponent()._findDocItem({
			CheckId: this._oAppModel.getProperty("/CheckId"), 
			Matnr: this._oAppModel.getProperty("/ArticleData/Number"),
			Charg: this._oAppModel.getProperty("/ArticleData/BatchNumber"),
			Vfdat: this._oAppModel.getProperty("/ArticleData/ExpiryDate"),
			State: " "			
		}).then(function(aResult){
			this.getView().setBusy(false);
			this.getView().byId("idNawForwardButton").setEnabled(true);
			if(aResult.length > 0){
				var oItem = aResult[0];
	    		this._oAppModel.setProperty("/ArticleData/ItemId", oItem.ItemId);
	    		this._oAppModel.setProperty("/ArticleData/HasBeenVerified", oItem.Verify ? true : false);
			} else {
				this._oAppModel.setProperty("/ArticleData/ItemId", undefined);
				this._oAppModel.setProperty("/ArticleData/HasBeenVerified", undefined);
			}
			
			this.showMessageVerification(function(){
				
				if (!this._oAppModel.getProperty("/ArticleData/StockAvailable") &&
						!this._oAppModel.getProperty("/GEOData/captured") ){
								
					var oDialog = Helper.getGEODatenDialog({
						view: this.getView(),							
						title: this._oI18nBundle.getText("ArtikelGeo.Title"),
						success: function() {							
							this.saveArticleGEOData();			
							this.fnForwards();
						}.bind(this), 
						abort: function() {		
							this.getView().setBusy(false);
						}.bind(this)
					});
					
					if (!oDialog.isOpen()){
						oDialog.open();
					}						
				} else {
					this.fnForwards();
				}	        
			}.bind(this));	    
			
			
		}.bind(this));
	},
	
	showMessageVerification: function(fnCallBack){
		
		if(this._oAppModel.getProperty("/ArticleData/FMDRelevant") &&
			!this._oAppModel.getProperty("/ArticleData/HasBeenVerified") ){
		
			MessageBox.show(this._oI18nBundle.getText("ArticleData.MessageVerification"), {
				icon: MessageBox.Icon.WARNING,
				title: this._oI18nBundle.getText("ArticleData.TitleVerification"),
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {				
					switch (oAction) {
					case MessageBox.Action.YES:
						this._oAppModel.setProperty("/ArticleData/Verify/yes", true);					
						break;
					case MessageBox.Action.NO:
						this._oAppModel.setProperty("/ArticleData/Verify/no", true);	
						break;
					}
					
					fnCallBack();
				}.bind(this)
			});
		} else {
			
			var sMessText = this._oI18nBundle.getText("ArticleData.MessageVerificationNotRequired");
			if (this._oAppModel.getProperty("/ArticleData/HasBeenVerified")){
				sMessText += " " + this._oI18nBundle.getText("ArticleData.MessageHasBeenVerified");
			}
			
			MessageBox.show(sMessText, {
				icon: MessageBox.Icon.INFO,
				title: this._oI18nBundle.getText("ArticleData.TitleVerification"),
				actions: [MessageBox.Action.OK],
				onClose: function (oAction) {
					fnCallBack();
				}
			});
		}
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

	onSerializationSelect : function(oEvent) {

	    var that = this;
	    var bSelected = this._oAppModel.getProperty("/ArticleData/Serial/selected");

	    // if (bSelected) {
	    // sap.ndc.BarcodeScanner.scan(function(sResult) {
	    // this.getOwnerComponent()._readBarcode(sResult.text);
	    // }.bind(this));
	    // }
	},

	onArtikelInputSuccess : function(oEvent) {
	    var sText = oEvent.getParameter("value");
	    this.getOwnerComponent()._readBarcode(sText).then(function(oData) {
	    	
	    	if (this._oAppModel.getProperty("/ArticleData/NumberListVisible")){
	    		
//	    		sap.m.MessageToast.show(this._oI18nBundle.getText("ArticleData.SelectNumber"), {
//		    		at : "center top"
//		    	}); 
//	    		
	    		var oArtikeNummerList = this.getView().byId("idArticleNumberList");
	    		oArtikeNummerList.setSelectedKey();
	    		oArtikeNummerList.open();
//	    		oArtikeNummerList.setValueState("Warning");    

			} else {
				var oArtikeNummer = this.getView().byId("idArticleNumber");
		    	oArtikeNummer.fireSubmit();
			}	    	
	    	
	    }.bind(this));
	},
	
	onArticleNumberListSelectionChange: function(oEvent) {
		var oSelectedItem = oEvent.getSource().getSelectedItem();
		this._oAppModel.setProperty("/ArticleData/Number", oSelectedItem.getKey());
		var oArtikeNummer = this.getView().byId("idArticleNumber");
    	oArtikeNummer.fireSubmit();

    	var oArtikeNummerList = this.getView().byId("idArticleNumberList");
		oArtikeNummerList.setValueState("None");    	
	},

	onArticlePhotoButtonPress : function(oEvent) {

	    // this.getOwnerComponent()._takeArticlePhoto(this.getView());

	    this.getCameraDialog().open();

	    // Helper.getCameraDialog({
	    // abort : function(oObject) {
	    // debugger;
	    // },
	    // success : function(oSource, oResult) {
	    // debugger;
	    // },
	    // source: "ArticleNumber",
	    // title : this._oI18nBundle.getText("Loading.ColliCntReasonTitle"),
	    // text : this._oI18nBundle.getText("Loading.ColliCntReasonText")
	    // }).open();
	},

	onCameraDialogAccept : function(oEvent) {

	    var oCamera = sap.ui.core.Fragment.byId("idCameraDialog", "idCamera");
	    oCamera._onUserClickedVideo();
	    this.getCameraDialog().close();
	},

	onCameraSnapshot : function(oImage) {

	    var sImage = oImage.mParameters.image;
	    this.onCameraDialogAbort();
	    this.getOwnerComponent()._saveMaterialImage(sImage).then(function(oObj) {
	    }.bind(this), function(oObj) {
		// this.onCameraDialogAbort();
	    }.bind(this));
	},

	onCameraDialogAbort : function() {
	    var oCamera = sap.ui.core.Fragment.byId("idCameraDialog", "idCamera");
	    if (oCamera) {
		oCamera.stopCamera();
	    }
	    this.getCameraDialog().close();
	},

	getCameraDialog : function() {

	    // create dialog lazily
	    if (!this._oCameraDialog) {
		// create dialog via fragment factory
		this._oCameraDialog = sap.ui.xmlfragment("idCameraDialog", "de.arvato.GRModul02.fragment.CameraDialog",
			this);
		// connect dialog to view (models, lifecycle)
		this.getView().addDependent(this._oCameraDialog);
	    }

	    return this._oCameraDialog;
	},

	onArticleNumberSubmit : function(oEvent) {
		this.loadArticledata();
		
		if (this._oAppModel.getProperty("/ArticleData/NumberListVisible")){
			this.getView().byId("idArticleNumber").focus();
		} else {
			this.getView().byId("idArticleName").focus();
		}
	},

	onArticleNameSubmit : function() {
	    this.getView().byId("idBatchNumber").focus();
	},

	onBatchNumberSubmit : function() {
	    this.getView().byId("idExpiryDate").focus();
	},

	onExpiryDateChange : function() {
	    this.getView().byId("idOthers").focus();
	},

	onOthersSubmit : function() {
	    this.onNavForward();
	},

	onMessagePopoverPress : function(oEvent) {
	    this.getOwnerComponent()._getMessagePopover(this.getView()).openBy(oEvent.getSource());
	},

	onEmployeeBarcodeScanSuccess : function(oEvent) {

	}
    });
});
