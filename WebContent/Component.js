// Version 2.1.0
sap.ui.define([
	"sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "sap/ui/Device", "sap/m/MessageToast",
	"de/arvato/GRModul02/libs/Helper", "sap/m/MessageBox", "sap/m/Dialog", "de/arvato/GRModul02/libs/Constants"
], function(UIComponent, JSONModel, Device, MessageToast, Helper, MessageBox, Dialog, Constants) {
    "use strict";
    
    var __Context = {

    		metadata : {
    		    manifest : "json"
    		},

    		/**
		 * The component is initialized by UI5 automatically during the
		 * startup of the app and calls the init method once.
		 * 
		 * @public
		 * @override
		 */
    		init : function() {
    		    // call the base component's init function
    		    UIComponent.prototype.init.apply(this, arguments);

    		    // enable routing
    		    this.getRouter().initialize();
    		    
    		    // 
    		    this._oAppModel = this.getModel("app");
    		    this._oErpModel = this.getModel("erp");
    		    this._oI18nBundle = this.getModel("i18n").getResourceBundle();

    		    // set the device model
    		    this.setModel(this.createDeviceModel(), "device");
    		    
    		    jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);
    		    
    		    // Liste erlaubter Artikeln laut PO
    		    this._aArticleList = [];   
    		    
    		    //
    		    Constants.init(this);
    		},
    		
    		readMessage: function(oMessage){
    		    return new Promise( function(resolve, reject) {
    			
    			var oModel = this.getModel("app");
    			var oERPModel = this.getModel("erp");    		   
        		var sReadUrl = "/MessageSet";
        		
        		var aFilters = [];

        		var oIdFilter = new sap.ui.model.Filter({
        		    path : "Id",
        		    operator : sap.ui.model.FilterOperator.EQ,
        		    value1 : oMessage.Id
        		});
        		aFilters.push(oIdFilter);
        		        		
        		if (oMessage.Client){
        		    var oClientFilter = new sap.ui.model.Filter({
                		path : "f_Client",
                		operator : sap.ui.model.FilterOperator.EQ,
                		value1 : oMessage.Client
        		    });
        		    aFilters.push(oClientFilter);
        		}
        		
        		if (oMessage.Zbetrst){
        		    var oZbetrstFilter = new sap.ui.model.Filter({
                		path : "f_Zbetrst",
                		operator : sap.ui.model.FilterOperator.EQ,
                		value1 : oMessage.Zbetrst
        		    });
        		    aFilters.push(oZbetrstFilter);
        		}
        		
        		if (oMessage.Material){
        		    var oMaterialFilter = new sap.ui.model.Filter({
            		    	path : "f_Material",
            		    	operator : sap.ui.model.FilterOperator.EQ,
            		    	value1 : oMessage.Material
        		    });
        		    aFilters.push(oMaterialFilter);
        		}
        		
        		if (oMessage.SpecialProcess){
        		    var oSpecialProcessFilter = new sap.ui.model.Filter({
        			path : "f_SpecialProcess",
        			operator : sap.ui.model.FilterOperator.EQ,
        			value1 : oMessage.SpecialProcess
        		    });
        		    aFilters.push(oSpecialProcessFilter);
        		}

        		oERPModel.read(sReadUrl, {
        		    filters : aFilters,
        		    success : function(oData, oResponse) {
        			resolve(oData.results);
        		    },
        		    error : function(oError) {    
        			reject(oError);
        		    }
        		});
    		    }.bind(this));
    		},    		
    		
    		addArticle: function(oArticle) {
    		    
    		    if (!this.isArtcleAllowed(oArticle)){
    			this._aArticleList.push(oArticle);
    			return true;
    		    } else {
    			return false;
    		    }
    		},
    		
    		isArtcleAllowed: function(oArticle) {
    		    
    		    if(!this._aArticleList || this._aArticleList.length == 0){
    			return true;
    		    }     
    		    
    		    var iIndex = this._aArticleList.findIndex(obj => obj.Number == oArticle.Number);
    		    if (iIndex > -1){
    			return true;
    		    } else {
    			return false;
    		    }
    		},
    		
    		registerMassageManager: function(oView) {
    		    
    		    if (oView){
    			// set message model
    			var oMessageManager = sap.ui.getCore().getMessageManager();
    			oView.setModel(oMessageManager.getMessageModel(), "message");
    			oMessageManager.registerObject(oView, true);
    		    }
    		},
    		
    		
    		addController: function(oController) {
    		    if (!this.controllerList){
    			this.controllerList = [];
    		    }
    		    
    		    this.controllerList.push(oController);
    		},

    		createDeviceModel : function() {
    		    var oModel = new JSONModel(Device);
    		    oModel.setDefaultBindingMode("OneWay");
    		    return oModel;
    		},
    		
    		_completedPalletizing: function(oContext) {
    			
    			var fnProcess = function(sCommentText) {
			    	this._updateCheck({
					    CheckId : this._oAppModel.getProperty("/CheckId"),
					    State : this._oAppModel.getProperty("/Check/State/PalletizingCompleted"),
					    StateDate: new Date(),
					    CommentarPal: sCommentText,
					    GeodataCrct: this._oAppModel.getProperty("/ArticleData/GeodataCrct/yes") ? "1" : "0",
					    Accordance: this._oAppModel.getProperty("/ArticleData/Accordance/yes") ? "1" : "0",	    						    
					    NameInternPal: this._oAppModel.getProperty("/Employee/Name"),
					    ErdatPal: new Date()
					}).then(this._clearFormular({
					    full : true
					}).then(function() {
						this._readRoughGR(function(aRoughGR){				
							this._oAppModel.setProperty("/RoughGRSet", aRoughGR);
						}.bind(this));
						oContext.navTo();						
					}.bind(this)));
				}.bind(this);
				
				this.showAccordanceMessage(function() {
					
					if (this._oAppModel.getProperty("/GEOData/showGeodataCrctMessage")){
						this.showGeodataCrctMessage(function() {
							
							Helper.getReasonDialog({
								bundle: this._oI18nBundle,
					    		initValue : "",
					    		source : null,
					    		abort : function(oRadioGroup) {
					    			fnProcess("");
					    		}.bind(this),
					    		success : function(oSource, sCommentText) {
					    			fnProcess(sCommentText);
					    		}.bind(this),
					    		title : this._oI18nBundle.getText("General.Comment"),
					    		text : ""
					    	}).open();
							
						}.bind(this));
						
					} else {
						
						Helper.getReasonDialog({
							bundle: this._oI18nBundle,
				    		initValue : "",
				    		source : null,
				    		abort : function(oRadioGroup) {
				    			fnProcess("");
				    		}.bind(this),
				    		success : function(oSource, sCommentText) {
				    			fnProcess(sCommentText);
				    		}.bind(this),
				    		title : this._oI18nBundle.getText("General.Comment"),
				    		text : ""
				    	}).open();
						
					}
				}.bind(this));    	
			},
    		
    		showAccordanceMessage: function(fnOnClose) {
    			
    			var sMessage = this._oI18nBundle.getText("ArticleData.Accordance");
				MessageBox.confirm(sMessage, {
    				actions : [ 
    					sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO
    				],
    				onClose: function(oAction){
    					if(oAction === sap.m.MessageBox.Action.YES){  
    						this._oAppModel.setProperty("/ArticleData/Accordance/yes", true);
    					} else {
    						this._oAppModel.setProperty("/ArticleData/Accordance/no", true);
    					}
    					fnOnClose();
    					
    				}.bind(this)
    			});	
			},
			
			showGeodataCrctMessage: function(fnOnClose) {
				
				var sMessage = this._oI18nBundle.getText("ArticleData.GeodataCrct");
				MessageBox.confirm(sMessage, {
    				actions : [ 
    					sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO
    				],
    				onClose: function(oAction){
    					if(oAction === sap.m.MessageBox.Action.YES){  
    						this._oAppModel.setProperty("/ArticleData/GeodataCrct/yes", true);
    					} else {
    						this._oAppModel.setProperty("/ArticleData/GeodataCrct/no", true);
    					}
    					
    					fnOnClose();
    				}.bind(this)
    			});	
			},
    		
    		_readBarcode: function(sCode) {
    		    
    		    return new Promise( function(resolve, reject) {
    			
    			var oModel = this.getModel("app");
    			var oERPModel = this.getModel("erp");			    

    			var sReadUrl = oERPModel.createKey("/BarcodeSet", {
    			    Code: sCode		    
    			});	
    			    
// oERPModel.setHeaders({
// mandt: this._oAppModel.getProperty("/Client")
// });
    			    
    			oERPModel.read(sReadUrl, {
    			    success: function(oData, oResponse) {
    			    	
    			    	if (oData.Matnr){
    			    		this._oAppModel.setProperty("/ArticleData/Number", oData.Matnr);	
    			    	} else {
    			    		this._oAppModel.setProperty("/ArticleData/Number", "");
    			    	}
    			    	
    			    	if (oData.MatnrList){    			    		
    			    		
    			    		var aNumberList = [];
    			    		oData.MatnrList.split(",").forEach(function(item){
    			    			aNumberList.push({"Number": item});
    			    		});
    			    		this._oAppModel.setProperty("/ArticleData/NumberList", aNumberList);
    			    		this._oAppModel.setProperty("/ArticleData/NumberListVisible", true);
    			    	} else {
    			    		this._oAppModel.setProperty("/ArticleData/NumberList", []);
    			    		this._oAppModel.setProperty("/ArticleData/NumberListVisible", false);
    			    	}    			    	
    			    	
    			    	if (oData.Batch){
    			    		this._oAppModel.setProperty("/ArticleData/BatchNumber", oData.Batch);
    			    		this._oAppModel.setProperty("/ArticleData/BatchScanned", true);    			    		
    			    	} else {
    			    		this._oAppModel.setProperty("/ArticleData/BatchNumber", "");
    			    		this._oAppModel.setProperty("/ArticleData/BatchScanned", false);
    			    	}
    						
    			    	if (oData.ExpiryDate){
    			    		var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
    	    				    pattern : "yyyy-MM-ddTHH:mm:ss"
    	    				});

    	    				var oDate = Helper.convertExpiryDate(oData.ExpiryDate);
    	    				this._oAppModel.setProperty("/ArticleData/ExpiryDate", dateFormat.format(oDate));    	    				
    			    	} else {
    			    		this._oAppModel.setProperty("/ArticleData/ExpiryDate", ""); 
    			    	}  			    	
    				
    			    	resolve(oData);
    				
    			    }.bind(this), 
    			    error: function(oError) {
    			    	reject();
    			    }
    			});		
    			
    		    }.bind(this));
    		},
    		
    		
    		_readMaterial: function(oMaterial, fnCallback) {
    		    
    		    var oModel = this.getModel("app");
    		    var oERPModel = this.getModel("erp");
    		    var oBundle = this.getModel("i18n").getResourceBundle();	    

    		    var sReadUrl = oERPModel.createKey("/MaterialSet", {
    		    	Matnr: oMaterial.Matnr,
    		    	Werks: oMaterial.Werks
    		    });	
    		    
    		    oERPModel.read(sReadUrl, {
    			 success: function(oData, oResponse) {		     
    			     this._oAppModel.setProperty("/ArticleData/Name", oData.Maktx);
    			     this._oAppModel.setProperty("/ArticleData/MaterialAvailable", true);
    			     this._oAppModel.setProperty("/ArticleData/StockAvailable", oData.StockAvailable);
    			     
    			     if(oData.Xchpf === 'X'){
    			    	 this._oAppModel.setProperty("/ArticleData/BatchObligation", true);
    			     } else {
    			    	 this._oAppModel.setProperty("/ArticleData/BatchObligation", false);
    			     }
    			     
    			     this._oAppModel.setProperty("/ArticleData/FMDRelevant", oData.FMDRelevant);
    			         			     
    			     if (fnCallback){
    			    	 fnCallback();
    			     }
    			 }.bind(this), 
    			 error: function(oError) {
    				 this._oAppModel.setProperty("/ArticleData/MaterialAvailable", false);
       				 this._oAppModel.setProperty("/ArticleData/BatchNumber", "");
    			 }.bind(this)
    		    });
    		},
    		
    		_readBatch: function(oObject) {
    		    
    		    var oModel = this.getModel("app");
    		    var oERPModel = this.getModel("erp");
    		    var oBundle = this.getModel("i18n").getResourceBundle();	    

    		    var sReadUrl = oERPModel.createKey("/ChargeSet", {
	    			Matnr: oObject.Matnr,
	    			Charg: oObject.Charg
    		    });	
    		    
// oERPModel.setHeaders({
// mandt: this._oAppModel.getProperty("/Client")
// });
    		    
    		    oERPModel.read(sReadUrl, {
    			 success: function(oData, oResponse) {		  
    				 
    				 var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
    					 pattern: 'yyyy-MM-ddTHH:mm:ss'
    				 });
    				 
    			     this._oAppModel.setProperty("/ArticleData/ExpiryDate", dateFormat.format(oData.Vfdat));
    			     this._oAppModel.setProperty("/ArticleData/BatchAvailable", true);
    			 }.bind(this), 
    			 error: function(oError) {
    				 this._oAppModel.setProperty("/ArticleData/ExpiryDate", "");
    				 this._oAppModel.setProperty("/ArticleData/BatchAvailable", false);
    				 sap.ui.getCore().getMessageManager().removeAllMessages();		 
    			 }.bind(this)
    		    });
    		},
    		
    		goToSemanticObject(oData){
    		    
    		    if (sap.ushell) {

	    			this.oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
	    			
	    			var hash = (this.oCrossAppNav && this.oCrossAppNav.hrefForExternal({
	    				target: {
	    					semanticObject: oData.SemanticObject,
	    					action: oData.Action
	    				  },
	    				params: oData.Parameters
	    				})) || ""; // generate the Hash to
						    // display a Supplier
    			 
	    			this.oCrossAppNav.toExternal({
	    				target: {
	    					shellHash: hash
	    				}
	    			});    
    		    }
    		},
    		
    		_createTransferOrder: function() {
    		    
    		    return new Promise( function(resolve, reject) {		
    			
    			 MessageBox.show(this._oI18nBundle.getText("General.TOCreate"), {
    			     icon : MessageBox.Icon.QUESTION,
    			     title : this._oI18nBundle.getText("General.TOCreateTitle"),
    			     actions : [ MessageBox.Action.YES, MessageBox.Action.NO ],
    			     onClose : function(oAction) {	
    				     			    	 
    			    	 var oModel = this.getModel("app");
    			    	 var oERPModel = this.getModel("erp");
    				 
	    				 var oTo = {};
	    				 oTo.ItemId = oModel.getProperty("/ArticleData/ItemId");
	    				 oTo.Printer = oModel.getProperty("/Printer");
	    				 oTo.InReserve = oAction === MessageBox.Action.YES ? true : false;	    				 	    				 
	    				 oERPModel.create("/TransferOrderSet", oTo, {
	    				     success: function(oData, oResponse) {
	    				    	 resolve(oData);
	    				     }.bind(this),
	    				     error: function(oError) {
	    				    	 reject(oError);
	    				     }
	    				});
    				    
    				}.bind(this)	
    			 });	
    			
    		    }.bind(this));
    		},
    		
    		_printTransferOrder: function(oData) {   
    			
    			 return new Promise(function(resolve, reject) {
    			    
	    			this._oErpModel.callFunction("/PrintTransferOrder", {
		    			method: "GET",   
		    			urlParameters: {
		    				Printer: oData.Printer,
		    				Mandt: oData.Mandt,
		    				Tanum: oData.Tanum,  	
		    				Language: sap.ui.getCore().getConfiguration().getLanguage()
		    			},
		    			success: function(oData, response) {
		    				resolve(oData);            
		    			}.bind(this),
		    			error: function(oError) {
		    				reject(oError);
		    			}.bind(this)
	    			}); 
    			}.bind(this));
			},
    		
    		_clearFormular: function(oParam) {
    		    
    		    var that = this;
    		  	
    		    return new Promise(function(resolve, reject) {
    			
	    		    var oModel = that.getModel("app");
	    		    
//	    		    if(oParam.articleView){
//	    			 var oSelectedItem = oParam.articleView.byId("idSpecialProcessList").getSelectedItem();
//	    			if(oSelectedItem){
//	    			    oSelectedItem.setSelected(false);
//	    			}
//	    		    }	    		    
	    			
	    			oModel.setProperty("/ArticleData/Completely", false);
	    			oModel.setProperty("/ArticleData/MaterialAvailable", false);
	    			oModel.setProperty("/ArticleData/StockAvailable", false);
	    			oModel.setProperty("/ArticleData/Pallet/Completely", false);
	    			oModel.setProperty("/GEOData/captured", false);
	    			oModel.getProperty("/GEOData/showGeodataCrctMessage", false);
	    			
	    			oModel.setProperty("/GEOData/ST", undefined);	
	    			oModel.setProperty("/GEOData/ALH",  undefined);	
	    			oModel.setProperty("/GEOData/AUH", undefined);
	    			
	    			oModel.setProperty("/GEOData/STcomplete", false);
	    			oModel.setProperty("/GEOData/ALHcomplete", false);
	    			oModel.setProperty("/GEOData/AUHcomplete", false);
	    			
	    			oModel.setProperty("/GEOData/STcolor", "#FF0000");
	    			oModel.setProperty("/GEOData/ALHcolor", "#FF0000");
	    			oModel.setProperty("/GEOData/AUHcolor", "#FF0000");
	    			
	    			    // debugger;
	    			if (oParam && oParam.full){
	    			    oModel.setProperty("/CmrRef", "");
	    			    oModel.setProperty("/Client", "");
	    			    oModel.setProperty("/CheckId", "");
	    			}
	    			
	    			oModel.setProperty("/ArticleData/SpecialProcess/List", []);
	    			oModel.setProperty("/ArticleData/SpecialProcess/Current", {});	  
	    			oModel.setProperty("/SpecialProcess/expanded", false);
	    			    
	    			oModel.setProperty("/ArticleData/ItemId", "");
	    			oModel.setProperty("/ArticleData/Number", "");
	    			oModel.setProperty("/ArticleData/NumberListVisible", false);
	    			oModel.setProperty("/ArticleData/NumberList", []);
	    			oModel.setProperty("/ArticleData/Name", "");
	    			oModel.setProperty("/ArticleData/BatchNumber", "");	    			
	    			oModel.setProperty("/ArticleData/ExpiryDate", undefined);
	    			oModel.setProperty("/ArticleData/BatchAvailable", false);
	    			oModel.setProperty("/ArticleData/BatchScanned", false);
	    			oModel.setProperty("/ArticleData/Others", "");
	    			    
	    			oModel.setProperty("/ArticleData/Serial/yes", false);	
	    			oModel.setProperty("/ArticleData/Serial/no", false);
	    			
	    			oModel.setProperty("/ArticleData/Verify/yes", false);
	    			oModel.setProperty("/ArticleData/Verify/no", false);
	    			
	    			oModel.setProperty("/ArticleData/Accordance/yes", false);
	    			oModel.setProperty("/ArticleData/Accordance/no", false);
	    			
	    			oModel.setProperty("/ArticleData/GeodataCrct/yes", false);	
	    			oModel.setProperty("/ArticleData/GeodataCrct/no", false);
	    			
	    			// oModel.setProperty("/ArticleData/Pallets",
				// []);
	    								    
	    	    	var aGEOData = oModel.getProperty("/ArticleData/GEOData");
	    	    	var iIndex = 0;
	    			for (iIndex in aGEOData){
	    			    aGEOData[iIndex].Length = "";
	    			    aGEOData[iIndex].Width = "";
	    			    aGEOData[iIndex].Height = "";			
	    			    aGEOData[iIndex].Weight = "";			
	    			}
	    			
	    			oModel.setProperty("/Confirmation/ArtikelData/selected", undefined);
	    			oModel.setProperty("/Confirmation/GEOData/selected", undefined) ; 
	    			// oModel.setProperty("/Confirmation/Accordance/selected",
				// undefined) ;
	    			    
	    			if (that.controllerList){		
	    			    var iIndex;	    
	    			    for (iIndex in that.controllerList){
	    				var oController = that.controllerList[iIndex];
	    			    	
	    				if (oController.clear){
	    			    		oController.clear();
	    				}
	    			    }	    
	    			}	
	    			
	    			sap.ui.getCore().getMessageManager().removeAllMessages();
	    			resolve();	    					 
    		    });	    
    		},
    		
    		_readSUTypes: function(fnSuccess){
    			
    			var oModel = this.getModel("app");
    		    var oERPModel = this.getModel("erp");    		   
    		    var sReadUrl = "/SUTypeSet";

    		    var oFilter = new sap.ui.model.Filter({
    		    	path : "Lgnum",
    		    	operator : sap.ui.model.FilterOperator.EQ,
    		    	value1 : oModel.getProperty("/Employee/Lgnum")
    		    });

    		    oERPModel.read(sReadUrl, {
    		    	filters : [ oFilter ],
    		    	success : function(oData, oResponse) {
    		    		fnSuccess(oData.results);
    		    	},
    		    	error : function(oError) {    			    
    		    	}
    		    });
    		},
    		
    		_readRoughGR: function(fnSuccess){
    			
    			var oModel = this.getModel("app");
    		    var oERPModel = this.getModel("erp");    		   
    		    var sReadUrl = "/RoughGRSet";

    		    var aFilters = [    		    	
    		    	new sap.ui.model.Filter({ path : "Zupdate", operator : "EQ", value1 : "2" }),    		    	
    		    ];
    		   
    		    oERPModel.read(sReadUrl, {
    		    	urlParameters: {
     				   "$expand": "Check" },
    		    	filters : aFilters,
    		    	success : function(oData, oResponse) {
    		    		fnSuccess(oData.results);
    		    	},
    		    	error : function(oError) {    			    
    		    	}
    		    });
    		},
    		
    		_readEmployee : function(sIdent, fnSuccess) {

    		    var oModel = this.getModel("app");
    		    var oERPModel = this.getModel("erp");
    		    var oBundle = this.getModel("i18n").getResourceBundle();

    		    oModel.setProperty("/Employee/ID", sIdent);

    		    // var sReadUrl = "/CheckSet('" + sInput + "')";
    		    var sReadUrl = "/UserSet";

    		    var oCmrRefFilter = new sap.ui.model.Filter({
    			path : "Ident",
    			operator : sap.ui.model.FilterOperator.EQ,
    			value1 : sIdent
    		    });

    		    oERPModel.read(sReadUrl, {
    			filters : [
    			    oCmrRefFilter
    			],
    			success : function(oData, oResponse) {
    			    var sName, sUser, sLgnum;
    			    
    			    // fnSuccess(oData, oResponse);

    			    if (oData.results.length = 1) {
    				var oResult = oData.results[0];
    				if (oResult) {
    				    sName = oResult.Address.Lastname + ", " + oResult.Address.Firstname;
    				    sUser = oResult.Username;
    				    sLgnum = oResult.Lgnum;
    				}
    				else {
    				    MessageToast.show(oBundle.getText("General.EmployeeNotFound"), {
    					at : "center center"
    				    });
    				}
    			    }
    			    else {
    				MessageToast.show(oBundle.getText("General.EmployeeNotFound"), {
    				    at : "center center"
    				});
    			    }

    			    // Falls Ident nicht erkannt wurde, Wert auf
			    // undefined
    			    // setzen!
    			    oModel.setProperty("/Employee/Name", sName);
    			    oModel.setProperty("/Employee/User", sUser);
    			    oModel.setProperty("/Employee/Lgnum", sLgnum);
    			    
    			    oERPModel.setHeaders({ 
    			    	 lgnum: oModel.getProperty("/Employee/Lgnum")    			    	
    			    });
    			    
    			    if (sName) {			
    			    	fnSuccess(oData, oResponse);
    			    }
    			},
    			error : function(oError) {
    			    MessageToast.show(Helper.getErrorValue(oError), {
    				at : "center center"
    			    });
    			}
    		    });
    		},

    		_initSampleDataModel : function() {

    	// var aTemp1 = [];
    	// var oData = this._oAppModel.getData();
    	// var aStorageUnitTypes = oData.ArticleData.StorageUnitTypes;
    	//
    	// for (var i = 0; i < oData.ArticleData.StorageUnitTypes.length; i++) {
    	// var oLine = oData.ArticleData.StorageUnitTypes[i];
    	// if (oLine.Type && jQuery.inArray(oLine.Type, aTemp1) < 0) {
    	// aTemp1.push(oLine.Type);
    	// aStorageUnitTypes.push({
    	// Type : oLine.Type
    	// });
    	// }
    	// }
    	//
    	// aStorageUnitTypes.sort(function(a, b) {
    	// if (a.Type == b.Type) return 0;
    	// if (a.Type < b.Type) return -1;
    	// if (a.Type > b.Type) return 1;
    	// });
    	// oData.ArticleData.StorageUnitTypes = aStorageUnitTypes;
    	// this._oAppModel.setData(oData);
    	// this.setModel(this._oAppModel, "app");
    		},
    		
    		_saveArticleGEOData: function(oUnitsOfMeasure) {
    			
    			return new Promise(function(resolve, reject){
        		    
        			var oModel = this.getModel("app");
        			var oERPModel = this.getModel("erp");	   
        			
// oERPModel.setHeaders({
// mandt : this._oAppModel.getProperty("/Client")
// });
        			
// var sPath = oERPModel.createKey("/UnitsOfMeasureSet", {
// Matnr: oUnitsOfMeasure.Matnr,
// Meinh: oUnitsOfMeasure.Meinh
// });
        		
        			oERPModel.create("/UnitsOfMeasureSet"/* sPath */, oUnitsOfMeasure, {
        			    success: function(oData, oResponse) {    				
        			    	resolve(oData);
        			    }, 
        			    error: function(oError) {   
        			    	reject();
        			    }
        			});
        		    
        		    }.bind(this));
			},
    		
    		_saveDocItem: function() {
    		    
    		    return new Promise(function(resolve, reject){
    		    
    			var oModel = this.getModel("app");
    			var oERPModel = this.getModel("erp");	    
    		    
    			var oDocItem = {};
    		    
    			oDocItem.CheckId = oModel.getProperty("/CheckId");
    			oDocItem.Matnr = oModel.getProperty("/ArticleData/Number");
    			oDocItem.Maktx = oModel.getProperty("/ArticleData/Name");
    			oDocItem.Charg = oModel.getProperty("/ArticleData/BatchNumber");
    			
    			if (oModel.getProperty("/ArticleData/ExpiryDate")){
    				oDocItem.Vfdat = oModel.getProperty("/ArticleData/ExpiryDate");	   
    			} else {
    				oDocItem.Vfdat = null;
    			}
    			
    			oDocItem.Others = oModel.getProperty("/ArticleData/Others");	 
    	    
    			if (oModel.getProperty("/ArticleData/Serial/yes")) 
    				oDocItem.Serial = "1";
    			else if (oModel.getProperty("/ArticleData/Serial/no"))
    			    oDocItem.Serial = "0";
    			
    			if (oModel.getProperty("/ArticleData/Verify/yes")) 
    				oDocItem.Verify = "1";
    			else if (oModel.getProperty("/ArticleData/Verify/no"))
    			    oDocItem.Verify = "0";
    			else
    				oDocItem.Verify = "-";
    			
    			if (oModel.getProperty("/ArticleData/Accordance/yes")) 
    				oDocItem.Accordance = "1";
    			else if (oModel.getProperty("/ArticleData/Accordance/no"))
    			    oDocItem.Accordance = "0";
    			
    			if (oModel.getProperty("/ArticleData/GeodataCrct/yes")) 
    				oDocItem.GeodataCrct = "1";
    			else if (oModel.getProperty("/ArticleData/GeodataCrct/no"))
    			    oDocItem.GeodataCrct = "0";     
    		
    			oDocItem.NameIntern = oModel.getProperty("/Employee/Name");
    			
    			// Initial Status Canceled setzen damit Items, die noch
			// keine Paletten haben,
    			// in QA-Liste nicht auftauchen
    			// Status wird zurückgesetzt, wenn erster TA (in
			// WebService) angelegt wird.
    			oDocItem.State = oModel.getProperty("/Check/State/Canceled");
    			
    			oERPModel.create("/DocItemSet", oDocItem, {
    			    success: function(oData, oResponse) {    				
    			    	resolve(oData);
    			    }, 
    			    error: function(oError) {   
    			    	reject();
    			    }
    			});
    		    
    		    }.bind(this));
    		},
    		
    		_findDocItem: function(oData){
    			
    			return new Promise(function(resolve, reject){
    			
	    			var oModel = this.getModel("app");
	     		    var oERPModel = this.getModel("erp");
	     		    var oBundle = this.getModel("i18n").getResourceBundle();
	     		    
	     		    var aFilters = [
	     		    	new sap.ui.model.Filter({path: "CheckId", operator: sap.ui.model.FilterOperator.EQ, value1: oData.CheckId }),
     		    		new sap.ui.model.Filter({path: "Matnr", operator: sap.ui.model.FilterOperator.EQ, value1: oData.Matnr }),     		    			 
	     		    ];
	     		    
	     		    if (oData.Charg){
	     		    	aFilters.push(new sap.ui.model.Filter({path: "Charg", operator: sap.ui.model.FilterOperator.EQ, value1: oData.Charg }));
	     		    }
	     		    
	     		    if(oData.Vfdat){
	     		    	aFilters.push(new sap.ui.model.Filter({path: "Vfdat", operator: sap.ui.model.FilterOperator.EQ, value1: oData.Vfdat }));
	     		    }
	     		    
	     		    if(oData.State){
	     		    	aFilters.push(new sap.ui.model.Filter({path: "State", operator: sap.ui.model.FilterOperator.EQ, value1: oData.State }));
	     		    }
	     		    
	     		    oERPModel.read("/DocItemSet", {
	     		    	filters: aFilters,
	     		    	success: function(oResolveData, oResponse) {
	     		    		resolve(oResolveData.results);
	     		    	}.bind(this), 
	     		    	error: function(oError) {  
	     		    		reject(oError);
	     		    	}.bind(this)
	     		    });
    			}.bind(this));
    		},
    		
    		_findSUTypes: function(oData){
    			
    			return new Promise(function(resolve, reject){
    			
	    			var oModel = this.getModel("app");
	     		    var oERPModel = this.getModel("erp");
	     		    var oBundle = this.getModel("i18n").getResourceBundle();
	     		    
	     		    var aFilters = [
	     		    	new sap.ui.model.Filter({path: "Lgnum", operator: sap.ui.model.FilterOperator.EQ, value1: oData.Lgnum }),     		    		
	     		    ];
	     		    
	     		    oERPModel.read("/SUTypeSet", {
	     		    	filters: aFilters,
	     		    	success: function(oResolveData, oResponse) {
	     		    		resolve(oResolveData);
	     		    	}.bind(this), 
	     		    	error: function(oError) {  
	     		    		reject(oError);
	     		    	}.bind(this)
	     		    });
    			}.bind(this));
    		},
    		
    		_updateDocItem: function() {
    		    
    		    return new Promise(function(resolve, reject){
    		    	    
    			var oDocItem = {};
    	    	    
    			oDocItem.ItemId = this._oAppModel.getProperty("/ArticleData/ItemId");    	    	
    	    	    	oDocItem.Matnr = this._oAppModel.getProperty("/ArticleData/Number");
    	    	    	oDocItem.Maktx = this._oAppModel.getProperty("/ArticleData/Name");
    	    	    	oDocItem.Charg = this._oAppModel.getProperty("/ArticleData/BatchNumber");
    	    	    	oDocItem.Vfdat = this._oAppModel.getProperty("/ArticleData/ExpiryDate");	   
    	    	    	oDocItem.Others = this._oAppModel.getProperty("/ArticleData/Others");	      	    
    	    	    	oDocItem.Serial = this._oAppModel.getProperty("/ArticleData/Serial/yes") ? "X" : "";
    	    	    	oDocItem.Verify = this._oAppModel.getProperty("/ArticleData/Verify/yes") ? "X" : "";   
    	    	    	oDocItem.NameIntern = this._oAppModel.getProperty("/Employee/Name");
    	    	    	
    	    	    	// Wird laut FB nicht mehr benoetigt!
    	    	    	// oDocItem.ArticleCrct =
						// this._oAppModel.getProperty("/Confirmation/ArtikelData/selected")
						// ? "X" : "";
    	    	    	// oDocItem.GeodataCrct =
						// this._oAppModel.getProperty("/Confirmation/GEOData/selected")
						// ? "X" : "";
    	    	    	
    	    	    	oDocItem.Accordance = this._oAppModel.getProperty("/ArticleData/Accordance/yes") ? "X" : "";
    	    	    	oDocItem.GeodataCrct = this._oAppModel.getProperty("/ArticleData/GeodataCrct/yes") ? "X" : "";
    	    		    
    	    	    	
    	    	    	var sPath = this._oErpModel.createKey("/DocItemSet", {
    	    	    	    ItemId: oDocItem.ItemId
    	    	    	});	
    	    	    
    	    	    	this._oErpModel.update(sPath, oDocItem, {
    	    	    	    success: function(oData, oResponse) {
    	    	    		resolve(oData);
    	    	    	    }, 
    	    	    	    error: function(oError) {
    	    	    	    	// debugger;
    	    	    	    }
    	    	    	});
    		    }.bind(this));
    		},
    		
    		_updateDocHU: function(oPallet) {
    			
    			var oErpModel = this._oErpModel;
    			
    			 return new Promise(function(resolve, reject){
    				
    				 var oDocHU = {};
    				oDocHU.HuId = oPallet.HuId; 					
 					oDocHU.Vemng = oPallet.Amount; 					
 					oDocHU.Letyp = oPallet.Type;
 					oDocHU.Bruch = oPallet.Bruch;
 					oDocHU.Tanum = oPallet.Tanum;
 					oDocHU.State = oPallet.State;
 					
 					var sPath = oErpModel.createKey("/DocHUSet", {
 						HuId: oDocHU.HuId
	    	    	});	
	    	    
 					oErpModel.update(sPath, oDocHU, {
	    	    	    success: function(oData, oResponse) {
	    	    	    	resolve(oData);
	    	    	    }, 
	    	    	    error: function(oError) {
	    	    	    	// debugger;
	    	    	    }
	    	    	});
 					
    			 });
			},
    		
    		_saveDocHUs: function() {
    		    
    			return new Promise(function(resolve, reject){
    			
    			    var cGroupId = "G1";
    			    
    			    var oModel = this.getModel("app");
    			    var oERPModel = this.getModel("erp");
    			    
    			    oERPModel.setUseBatch(true);
    			    oERPModel.setDeferredGroups([cGroupId]);
    			    
    			    var aPallets = this._oAppModel.getProperty("/ArticleData/Pallets");
    			    if(aPallets && aPallets.length === 0){
    			    	reject();
    			    }
    			    
    			    var sIndex;
    			    for (sIndex in aPallets){
    				
    					var oDocHU = {};
    					var oPallet = aPallets[sIndex];
    					
    					// Fall, wenn gesammte Palette "bruch"
					// ist.
    					// Zeile fuer "saubere" Menge wird
    					// erzeugt, aber keine Werte eingegeben!
    					if (oPallet.Amount === ""){
    						continue;
    					}
    					
    					if (oPallet.Saved){
    						continue;
    					}
    					
    					oPallet.Saved = true;
				    	this._oAppModel.refresh();
    					
    					oDocHU.CheckId = oModel.getProperty("/CheckId");
    					oDocHU.ItemId = oModel.getProperty("/ArticleData/ItemId");
    					oDocHU.NameIntern = oModel.getProperty("/Employee/Name");    					
    					
    					oDocHU.Vemng = oPallet.Amount;
    					oDocHU.Anzhu = oPallet.Count;
    					oDocHU.Letyp = oPallet.Type;
    					oDocHU.Bruch = oPallet.Bruch ? "X" : "";		
    					oDocHU.Mixed = oModel.getProperty("/ArticleData/Pallet/Mixed") ? "X" : "";
    					var oProcess = oModel.getProperty("/ArticleData/SpecialProcess/Current");
    					if (oProcess){
    					    oDocHU.ProcessId = oProcess.id;
    					}    
    						 	   
    					oERPModel.create("/DocHUSet", oDocHU, {
    					    groupId: cGroupId,
    					    success: function(oData, oResponse) {
    					    	var aPallets = this._oAppModel.getProperty("/ArticleData/Pallets");
    					    	aPallets.forEach(function(pallet){
    					    		if(this.Bruch === "X" && pallet.Bruch){
    					    			pallet.HuId = this.HuId;
    					    		}    					    		
    					    		if(this.Bruch === "" && !pallet.Bruch){
    					    			pallet.HuId = this.HuId;
    					    		}
    					    	}.bind(oData));
    					    	this._oAppModel.refresh();
    					    	
    					    	// oData.HuId
    					    }.bind(this), 
    					    error: function(oError) {	
    					    	MessageToast.show(Helper.getErrorValue(oError));
    					    }
    					});
    				
    			    }
    			    
    			    oERPModel.submitChanges({
    					groupId: cGroupId,
    					success: function(oData, oResponse) {
    						resolve(oData, oResponse);
    					}, 
    					error: function(oError) {
    						reject(oError);
    					}
    			    });
    		    
    			}.bind(this));
    		},
    		
    		_readGEOData: function() {	    
    		    
    		    return new Promise(function(resolve, reject){
    			
    			 var oModel = this.getModel("app");
    			 var oERPModel = this.getModel("erp");
    			 var oBundle = this.getModel("i18n").getResourceBundle();	
    			 
    			 var oCheckFilter = new sap.ui.model.Filter({
    				path : "CheckId",
    				operator : sap.ui.model.FilterOperator.EQ,
    				value1 : oModel.getProperty("/CheckId")
    			 });
    			 
    			 var oMatnrFilter = new sap.ui.model.Filter({
    				path : "Matnr",
    				operator : sap.ui.model.FilterOperator.EQ,
    				value1 : oModel.getProperty("/ArticleData/Number")
    			 });
    			  
    			 var oChargFilter = new sap.ui.model.Filter({
    				path : "Charg",
    				operator : sap.ui.model.FilterOperator.EQ,
    				value1 : oModel.getProperty("/ArticleData/BatchNumber")
    			 });
    			 
    			 var oExistGeodataFilter = new sap.ui.model.Filter({
    				path : "ExistGeodata",
    				operator : sap.ui.model.FilterOperator.EQ,
    				value1 : 'X'
    			 });				
    			    
    			 oERPModel.read("/DocItemSet", {
    			     	urlParameters: {
    				   "$expand": "DocGEOSet"
    				},
    				filters : [ oCheckFilter, oMatnrFilter, oChargFilter, oExistGeodataFilter],
    				 success: function(oData, oResponse) {
    				     
    				     if(oData && oData.results.length > 0){
    					    
    					    var aGEODatApp = [];
    					    var iIndex = 0;
    					    var aGEOData = oData.results[0].DocGEOSet.results;
    					    
    					    for( iIndex in aGEOData){
    						var oGEODat = aGEOData[iIndex];
    									
    						var oGEODatApp = {};	
    						oGEODatApp.DeliveryUnit = oGEODat.Meinh;
    						oGEODatApp.Length = oGEODat.Laeng;
    						oGEODatApp.Width = oGEODat.Breit;
    						oGEODatApp.Height = oGEODat.Hoehe;
    						oGEODatApp.UOM = oGEODat.Meabm;
    						oGEODatApp.Weight = oGEODat.Brgew;
    						oGEODatApp.WeightUnit = oGEODat.Gewei;
    						
    						aGEODatApp.push(oGEODatApp);			
    					    }
    					    
    					    if (aGEODatApp.length > 0){
    						this._oAppModel.setProperty("/ArticleData/GEOData", aGEODatApp);
    					    }
    					    
    				     }
    				     
    				     resolve(oData);			     
    				 }.bind(this), 
    				 error: function(oError) {    				    
    				 }
    			 });
    		    }.bind(this));
    		},
    		
    		_saveGEOData: function(fnSuccess) {
    		    
    		    var that = this;
    		    
    		    return new Promise(function(resolve, reject){    			
    			
    			var cGroupId = "G1";
    			var oModel = that.getModel("app");
    			var oERPModel = that.getModel("erp");
    			    
    			oERPModel.setUseBatch(true);
    			oERPModel.setDeferredGroups([cGroupId]);
    			    
    			var aGEOData = oModel.getProperty("/ArticleData/GEOData");
    			    
    			var sIndex;
    			for (sIndex in aGEOData){		    
    			    			
    			    var oGEOData = aGEOData[sIndex];
    			    if (!oGEOData.pressed) {
    				continue;
    			    }
    			    
    			    // TO DO: AUH ist optional
    			    var oDocGeo = {};	    
    			    
    			    oDocGeo.ItemId = oModel.getProperty("/ArticleData/ItemId");	   
    			    oDocGeo.Meinh = oGEOData.DeliveryUnit;	   
    			    oDocGeo.Laeng = oGEOData.Length ? oGEOData.Length : "0";
    			    oDocGeo.Breit = oGEOData.Width ? oGEOData.Width : "0";   
    			    oDocGeo.Hoehe = oGEOData.Height ? oGEOData.Height : "0";	   
    			    oDocGeo.Meabm = oGEOData.UOM;
    				
    			    oDocGeo.Brgew = oGEOData.Weight ? oGEOData.Weight : "0";
    			    oDocGeo.Gewei = oGEOData.WeightUnit;
    			    
    			    oERPModel.create("/DocGEOSet", oDocGeo, {
    				groupId: cGroupId,
    				success: function(oData, oResponse) {	
    				    resolve(oData);
    				}, 
    				error: function(oError) {	
    				    reject(oError);
    				}}
    			    );
    			    
    			}
    			    
    			oERPModel.submitChanges({
    			    groupId: cGroupId,
    			    success: function(oData, oResponse) {			
    	// that._updateCheck({
    	// CheckId: oModel.getProperty("/CheckId"),
    	// State: oModel.getProperty("/Check/State/PalletizingCompleted")
    	// });
    					// fnSuccess(oData);
    				resolve(oData)
    			    }, 
    			    error: function(oError) {
    			    	// debugger;
    			    }
    			});
    		    });
    		    
    		}, 
    		
    	// _saveGEOData: function(fnSuccess) {
//    		    
    	// var that = this;
    	// var cGroupId = "G1";
    	// var oModel = this.getModel("app");
    	// var oERPModel = this.getModel("erp");
//    		    
    	// oERPModel.setUseBatch(true);
    	// oERPModel.setDeferredGroups([cGroupId]);
//    		    
    	// var aGEOData = oModel.getProperty("/ArticleData/GEOData");
//    		    
    	// var sIndex;
    	// for (sIndex in aGEOData){
//    			
    	// var oGEOData = aGEOData[sIndex];
    	// var oDocGeo = {};
//    		    
    	// oDocGeo.ItemId = oModel.getProperty("/ArticleData/ItemId");
    	// oDocGeo.Meinh = oGEOData.DeliveryUnit;
    	// oDocGeo.Laeng = oGEOData.Length;
    	// oDocGeo.Breit = oGEOData.Width;
    	// oDocGeo.Hoehe = oGEOData.Height;
    	// oDocGeo.Meabm = oGEOData.UOM;
//    			
    	// oDocGeo.Brgew = oGEOData.Weight;
    	// oDocGeo.Gewei = oGEOData.WeightUnit;
//    		    
    	// oERPModel.create("/DocGEOSet", oDocGeo, {
    	// groupId: cGroupId,
    	// success: function(oData, oResponse) {
    	// },
    	// error: function(oError) {
    	// debugger;
    	// }
    	// });
//    		    
    	// }
//    		    
    	// oERPModel.submitChanges({
    	// groupId: cGroupId,
    	// success: function(oData, oResponse) {
    	// debugger;
    	// that._updateCheck({
    	// CheckId: oModel.getProperty("/CheckId"),
    	// State: oModel.getProperty("/Check/State/PalletizingCompleted")
    	// });
//    			    
    	// fnSuccess(oData);
    	// },
    	// error: function(oError) {
    	// debugger;
    	// }
    	// });
//    		    
    	// },
    		
    		_saveMaterialImage: function( sImage ) {
    		    
    		    return new Promise(function(resolve, reject) {
    		    
    	        	    var oMaterialImage = {};
    	        	    oMaterialImage.Matnr = this._oAppModel.getProperty("/ArticleData/Number");
    	        	    oMaterialImage.DocType = "MaterialImage"
    	        	    oMaterialImage.MimeType = sImage;
    	        	    oMaterialImage.Filename = "text.jpg"
    	        		
// this._oErpModel.setHeaders({
// mandt: this._oAppModel.getProperty("/Client")
// });
    	        
    	        	    this._oErpModel.create("/MaterialImageCollection", oMaterialImage, {
    	        		success : function(oData) {        		   
    	        		    resolve(oData);
    	        		}.bind(this),
    	        		error : function(oError) {        		  
    	        		    reject(oError);
    	        		}
    	        	    });
    		    
    		    }.bind(this));
    		},
    		
    		_updateCheck: function(oCheck) {
    		    
    		    var that = this;
    		    
    		    return new Promise(function(resolve, reject) {
    					    
	    			var oERPModel = that.getModel("erp");		    
	    			var oCheckFilter = new sap.ui.model.Filter({
	    				path : "CheckId",
	    				operator : sap.ui.model.FilterOperator.EQ,
	    				value1 : oCheck.CheckId
	    			});
	    			    
	    			var sPath = oERPModel.createKey("/CheckSet", {
	    				CheckId: oCheck.CheckId		  
	    		    	});		    
	
	    			oERPModel.update(sPath, oCheck, {
	    			    success : function(oData, oResponse) {		   
	    				resolve(oData);
	    			    },
	    			    error : function(oError) {
	    				reject(oError);
	    			    }
	    			});
    		    });	    
    		    
    		},
    		
    		_createBatch : function(oObject, fnSuccess, fnError) {
    
    			var sReadUrl = "/ChargeSet";

// this._oErpModel.setHeaders({
// mandt : this._oAppModel.getProperty("/Client"),
// zbetrst: this._oAppModel.getProperty("/Zbetrst")
// });

    			this._oErpModel.create(sReadUrl, {
    				Matnr: oObject.Matnr,
    				Charg: oObject.Charg,
    				Vfdat: oObject.Vfdat
    			},{
    				success : function(oData, oResponse) {    					
    					MessageToast.show(
    							this._oI18nBundle.getText("General.BatchCrateSuccessfull", [oObject.Matnr, oObject.Charg]), 
    							{ at : "center bottom"  });
    					fnSuccess(oData);
    				}.bind(this),
    				error : function(oError) {    
    					fnError(oError);
    				}
    			});
    		},
    		
    		_getMessagePopover : function(oView) {
    		    // create popover lazily (singleton)
    		    if (!this._oMessagePopover) {
    			this._oMessagePopover = sap.ui.xmlfragment(oView.getId(),
    				"de.arvato.GRModul02.fragment.MessagePopover", this);
    			oView.addDependent(this._oMessagePopover);
    		    }
    		    return this._oMessagePopover;
    		},
    		
    		_takeArticlePhoto: function(oView) {
    		    
    		    if (!this._cameraDialog){

    			var oVBox = new sap.m.VBox({id: "idCameraVBox"});
    		   	    
    		    	oVBox.addItem(new sap.ui.core.HTML({
    			    content: "<video id='idPlayer' autoplay></video>"
    		    	}));
    		    	oVBox.addItem(new sap.ui.core.HTML({
    				content: "<canvas id='idCanvas' height='1px'></canvas>"
    		    	}));
    		    
    		    	this._cameraDialog = new Dialog({
    				title: "Artikelfoto",
    				stretch: true,
    				content:[ oVBox ],
    				beginButton: new sap.m.Button({
    			    	text: "Foto aufnemhen",
    			    	press: function() {			
    					this._oImage = document.getElementById("idPlayer");
    				 	if (this._oImage){
    				     	this._oImage.srcObject.getVideoTracks().forEach( function(t){ t.stop(); });
    	                         	}			
    				 this._cameraDialog.close();
    			    	}.bind(this)
    				}),
    				endButton: new sap.m.Button({
    			    	text: "Abbrechen",
    			    press: function() {
    				this._cameraDialog.close();
    			    }.bind(this)
    				})		
    		    	});
    		    
    		    	oView.addDependent(this._cameraDialog);
    		    
    		    	this._cameraDialog.attachBeforeClose(function() {
    			
    		    	    var oCanvas = document.getElementById("idCanvas");
    		    	    var oContext = oCanvas.getContext("2d");
    		    	    oContext.drawImage(this._oImage, 0, 0, oCanvas.width, oCanvas.height);
    			
    		    	    this._saveMaterialImage(oCanvas.toDataURL());

    		   	}.bind(this), this);
    		    
    		    }
    		    
    		    this._cameraDialog.open();	   

    		    	navigator.mediaDevices.getUserMedia({		
    		    		video: { facingMode: "environment" }, // Back
									// camera
    	                 		audio: false
    	                 
    		    	}).then(function(stream) {
    			
    		    		idPlayer.srcObject = stream;		
    		    	}.bind(this));
    			},	

    	    };

    return UIComponent.extend("de.arvato.GRModul02.Component", __Context);
    
});
