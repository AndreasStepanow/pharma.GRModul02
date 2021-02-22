sap.ui.define([
	"sap/m/Dialog", 'sap/m/Label', 'sap/m/Button', 'sap/m/TextArea',
	"de/arvato/GRModul02/libs/formatter", "de/arvato/GRModul02/libs/Constants"
], function(Dialog, Label, Button, TextArea, formatter, Constants) {
    "use strict";

    return {
    	
    	formatter: formatter,
	
	convertExpiryDate: function(sDate){
		
	    var sYear = "20" + sDate.substring(0, 2);
	    var sMonth = sDate.substring(2, 4);
	    var sDay = sDate.substring(4, 6);
	    
	    var iMonth = parseInt(sMonth, 10);
	    if (sDay === "00"){
		sDay = new Date(sYear, iMonth, 0).getDate();
	    }	    
	    
	    var iDay = parseInt(sDay, 10);
	    return new Date(sYear, sMonth - 1, iDay);
	},

	isInputValid : function(aInputs, sItems, aGroups) {

	    var that = this;
	    var bValidationError = false;

	    if (aInputs) {
		// check that inputs are not empty
		// this does not happen during data binding as this is only triggered by changes
		jQuery.each(aInputs, function(i, oInput) {
		    bValidationError = that._validateInput(oInput) || bValidationError;
		});
	    }

	    if (sItems) {
		// check that inputs are not empty
		// this does not happen during data binding as this is only triggered by changes
		jQuery.each(sItems, function(i, oInput) {
		    bValidationError = that._validateItems(oInput) || bValidationError;
		});
	    }
	    
	    if (aGroups){		
		jQuery.each(aGroups, function(i, oGroup) {
		    bValidationError = that._validateRadioGroup(oGroup) || bValidationError;
		});
	    }

	    return bValidationError == false;
	},

	_validateRadioGroup: function(oRadioGroup) {
	    
	    var bSelected = false;
	    var bValidationError = false;
	    
	    oRadioGroup.getButtons().forEach(function(oButton){
	    
		if (oButton.getSelected()){
		    bSelected = true;
		}
	    });
	    
	    if(!bSelected){
		oRadioGroup.setValueState("Error");
		bValidationError = true;
	    } else {
		oRadioGroup.setValueState("None");		
	    }
	    
	    return bValidationError;
	},
	
	_validateInput : function(oInput) {

	    var oBinding = oInput.getBinding("value");

	    var sValueState = "None";
	    var bValidationError = false;

	    if (oBinding && oBinding.getType()) {

		try {
		    oBinding.getType().validateValue(oInput.getValue());
		}
		catch (oException) {
		    sValueState = "Error";
		    bValidationError = true;
		}

		oInput.setValueState(sValueState);
	    }

	    return bValidationError;
	},

	_validateItems : function(oInput) {

	    var sValueState = "None";
	    var bValidationError = false;

	    var oBinding = oInput.getBinding("items");
	    if (oBinding) {

		if (oInput.getSelectedItem()) {
		    oBinding = oInput.getSelectedItem().getBinding("key");

		    if (oBinding.getType()) {

			try {
			    oBinding.getType().validateValue(oInput.getValue());
			}
			catch (oException) {
			    sValueState = "Error";
			    bValidationError = true;
			}

			oInput.setValueState(sValueState);
		    }

		}
		else {
		    sValueState = "Error";
		    bValidationError = true;
		}

	    }

	    oInput.setValueState(sValueState);

	    return bValidationError;
	},

	getErrorValue : function(oError) {
	    var oJSONError = JSON.parse(oError.responseText);
	    return oJSONError.error.message.value;
	},
	
	getUnitIcon: function(bCapture) {
		debugger;
	},
	
	getGEODatenDialog: function(oContext) {
		
		this._oI18nBundle = oContext.view.getModel("i18n").getResourceBundle();
		this.COLOR_RED = "#FF0000";
		this.COLOR_GREEN = "#00FF00";
		this.COLOR_BLUE = "#0000FF";
		
		this.fnSetUnit = function (sUnit, bConvFactorEditable) {
			this._geoModel.setProperty("/GEOData/current", sUnit);				
			
			if(!this._geoModel.getProperty("/GEOData/" + sUnit)){					
				this._geoModel.setProperty("/GEOData/" + sUnit, {});	
				//this._geoModel.setProperty("/GEOData/STcolor", this.COLOR_BLUE);
			} 
			if (!bConvFactorEditable){
				this._geoModel.setProperty("/GEOData/"+ sUnit +"/Umrez", "1");
			}
			
			this._geoModel.setProperty("/GEOData/"+ sUnit +"/Meamb", "MM");
			this._geoModel.setProperty("/GEOData/"+ sUnit +"/Gewei", "G");
			this._geoModel.setProperty("/GEOData/"+ sUnit +"/Meinh", sUnit);
			this._geoModel.setProperty("/GEOData/"+ sUnit +"/Matnr", this._geoModel.getProperty("/ArticleData/Number"));
							
			this._geoInputs.ConvFactor.setEditable(bConvFactorEditable);
			this._geoInputs.ConvFactor.bindProperty("value", "app>/GEOData/"+ sUnit +"/Umrez");		
			this._geoInputs.Length.bindProperty("value", "app>/GEOData/"+ sUnit +"/Laeng");				
			this._geoInputs.Width.bindProperty("value", "app>/GEOData/"+ sUnit +"/Breit");
			this._geoInputs.Height.bindProperty("value", "app>/GEOData/"+ sUnit +"/Hoehe");
			this._geoInputs.Weight.bindProperty("value", "app>/GEOData/"+ sUnit +"/Brgew");		
		}.bind(this);
		
		this.fnIsInputComplete = function(sUnit) {
			if ( !this._geoModel.getProperty("/GEOData/"+ sUnit +"/Umrez") || 
				 !this._geoModel.getProperty("/GEOData/"+ sUnit +"/Laeng") ||
				 !this._geoModel.getProperty("/GEOData/"+ sUnit +"/Breit") ||
				 !this._geoModel.getProperty("/GEOData/"+ sUnit +"/Hoehe") ||
				 !this._geoModel.getProperty("/GEOData/"+ sUnit +"/Brgew") ){
				
				sap.m.MessageToast.show(this._oI18nBundle.getText("ArtikelGeo.NoSaveData"), {
		    		at : "center center"
		    	});
				
				return false;
			} else {
				return true;
			}
		}.bind(this);
		
		if (!this.oGEODatenDialog){
				
			var aButtons = {
				ST: new sap.m.Button({text: "ST", width: "80px", press: function(oEvent) {
						// TO DO
						if (this.fnIsInputComplete(this._geoModel.getProperty("/GEOData/current"))){
							this.fnSetUnit("ST", false);
						}					
					}.bind(this)}),
				ALH: new sap.m.Button({text: "ALH", width: "80px", press: function(oEvent) {
						// TO DO
						if (this.fnIsInputComplete(this._geoModel.getProperty("/GEOData/current"))){
							this.fnSetUnit("ALH", true);
						}
					}.bind(this)}),
				AUH: new sap.m.Button({text: "AUH", width: "80px", press: function(oEvent) {
						// TO DO
						if (this.fnIsInputComplete(this._geoModel.getProperty("/GEOData/current"))){
							this.fnSetUnit("AUH", true);
						}
					}.bind(this)}),
			};
			
			var aIcons = {
					ST:  new sap.ui.core.Icon({src: "sap-icon://sys-enter", color: "{app>/GEOData/STcolor}"}),
					ALH: new sap.ui.core.Icon({src: "sap-icon://sys-enter", color: "{app>/GEOData/ALHcolor}"}),
					AUH: new sap.ui.core.Icon({src: "sap-icon://sys-enter", color: "{app>/GEOData/AUHcolor}"})
				};
			
			var oButtonFlexBox = new sap.m.FlexBox({
				justifyContent: "SpaceAround",
				items: [aButtons.ST, aButtons.ALH, aButtons.AUH]
			});
			
			var oIconFlexBox = new sap.m.FlexBox({
				justifyContent: "SpaceAround",
				items: [aIcons.ST, aIcons.ALH, aIcons.AUH]
			});
					
			var fnLiveChange = function(oEvent) {
				
				var sUnit = this._geoModel.getProperty("/GEOData/current");
				if (!sUnit || sUnit.length < 1){
					sap.m.MessageToast.show(this._oI18nBundle.getText("ArtikelGeo.SelectUnit"), {
			    		at : "center center"
			    	});
					
					return;
				}
				
				var aList = [];
	//			var iConvFactor = this._geoModel.getProperty("/GEOData/" + sUnit + "/Umrez");
	//			if (iConvFactor){
	//				aList.push(iConvFactor);
	//			}			
				
				var iLength = this._geoModel.getProperty("/GEOData/" + sUnit + "/Laeng");
				if (iLength){
					aList.push(iLength);
				}
				
				var iWidth = this._geoModel.getProperty("/GEOData/" + sUnit + "/Breit");
				if (iWidth){
					aList.push(iWidth);
				}
				
				var iHeight = this._geoModel.getProperty("/GEOData/" + sUnit + "/Hoehe");
				if (iHeight){
					aList.push(iHeight);
				}
				
				var iWeight = this._geoModel.getProperty("/GEOData/" + sUnit + "/Brgew");
				if (iWeight){
					aList.push(iWeight);
				}
										
				if (aList.length >= 3){
					this._geoModel.setProperty("/GEOData/"+ sUnit +"color", this.COLOR_GREEN);
					this._geoModel.setProperty("/GEOData/"+ sUnit + "complete", true);
				} else {
					this._geoModel.setProperty("/GEOData/"+ sUnit +"color", this.COLOR_RED);
					this._geoModel.setProperty("/GEOData/"+ sUnit + "complete", false);
				}
			}.bind(this);
			
			var aInputs = {
				ConvFactor: new sap.m.Input({liveChange: fnLiveChange, type: "Number", width: "150px", placeholder: "ST"}),
				Length: new sap.m.Input({liveChange: fnLiveChange, type: "Number", width: "150px", placeholder: "MM"}),
				Width: new sap.m.Input({liveChange: fnLiveChange, type: "Number", width: "150px", placeholder: "MM"}),
				Height: new sap.m.Input({liveChange: fnLiveChange, type: "Number", width: "150px", placeholder: "MM"}),
				Weight: new sap.m.Input({liveChange: fnLiveChange, type: "Number", width: "150px", placeholder: "G"})
			};
			
			var oList = new sap.m.List({
				items: [
					new sap.m.InputListItem({ 
						label: this._oI18nBundle.getText("ArtikelGeo.Amount"), 
						content: [aInputs.ConvFactor]
					}),				
					new sap.m.InputListItem({ 
						label: this._oI18nBundle.getText("ArtikelGeo.Length"), 
						content: [aInputs.Length]
					}),
					new sap.m.InputListItem({
						label: this._oI18nBundle.getText("ArtikelGeo.Width"), 
						content: [aInputs.Width]
					}),
					new sap.m.InputListItem({
						label: this._oI18nBundle.getText("ArtikelGeo.Height"), 
						content: [aInputs.Height]
					}),
					new sap.m.InputListItem({
						label: this._oI18nBundle.getText("ArtikelGeo.Weight"), 
						content: [aInputs.Weight]
					})
				]
			});
			
			var fnClear;
			
			
			this.oGEODatenDialog = new Dialog({
				title : oContext.title,
				type : 'Standard',
				content: [
					new sap.m.Panel({headerText: this._oI18nBundle.getText("ArtikelGeo.Article") + ": {app>/ArticleData/Number}", content: [oButtonFlexBox, oIconFlexBox]}),
					new sap.m.Panel({headerText: this._oI18nBundle.getText("ArtikelGeo.Selection") + ": {app>/GEOData/current}", content: [oList]})
				],
				beginButton : new Button({
				    text : this._oI18nBundle.getText("General.Accept"),			    
				    press : function(oEvent) {	
				    	
				    	if (!this.fnIsInputComplete(this._geoModel.getProperty("/GEOData/current"))){
				    		sap.m.MessageToast.show(this._oI18nBundle.getText("ArtikelGeo.NoSaveData"), {
				        		at : "center center"
				        	});
				    		return;
				    	}
				    	
				    	if (!this._geoModel.getProperty("/GEOData/STcomplete") &&
				    		!this._geoModel.getProperty("/GEOData/ALHcomplete") &&
				    		!this._geoModel.getProperty("/GEOData/AUHcomplete") ){
				    		
				    		sap.m.MessageToast.show(this._oI18nBundle.getText("ArtikelGeo.NoSaveData"), {
				        		at : "center center"
				        	});
				    		return;
				    	}
				    	
				    	if(this._geoModel.getProperty("/GEOData/ST")){
				    		
				    		if(this._geoModel.getProperty("/GEOData/DoubleCheck") !== true){
				    			
				    			this.oGEODatenDialog.setBusy(true);
				    			sap.m.MessageToast.show(this._oI18nBundle.getText("ArtikelGeo.DoubleCheckMessage"), {
					        		at : "center center",
					        		onClose: function(){
					        			this.oGEODatenDialog.getBeginButton().setText(this._oI18nBundle.getText("General.Confirm"));
					        			this.oGEODatenDialog.setBusy(false);
					        		}.bind(this)
					        	});
				    			
					    		this._geoModel.setProperty("/GEOData/DoubleCheck", true);
					    	} else {
					    		
					    		this.oGEODatenDialog.getBeginButton().setText(this._oI18nBundle.getText("General.Accept"));
					    		this._geoModel.setProperty("/GEOData/DoubleCheck", false);
					    		
					    		//fnClear();
					    		this._geoModel.setProperty("/GEOData/current", "");
					    		this.oGEODatenDialog.close();
					    		oContext.success();
					    		
					    	}				    		
				    		
				    	} else {
				    		sap.m.MessageToast.show(this._oI18nBundle.getText("ArtikelGeo.StObligatory"), {
				        		at : "center center"
				        	});				    		
				    	}
				    	
				    }.bind(this)
				}),
				endButton : new Button({
				    text : this._oI18nBundle.getText("General.Abort"),
				    press : function(oEvent) {
				    	this._geoModel.setProperty("/GEOData/DoubleCheck", false);
				    	this.oGEODatenDialog.close();
				    	oContext.abort();
				    	fnClear();			    	
				    }.bind(this)
				}),
				afterClose : function() {
					this.oGEODatenDialog.destroy();
					this.oGEODatenDialog = null; 
				}.bind(this)
			});
			
			oContext.view.addDependent(this.oGEODatenDialog);
			
			this._geoDialog = this.oGEODatenDialog;
			this._geoIcons = aIcons;
			this._geoInputs = aInputs;
		}
				
		this._geoModel = oContext.view.getModel("app");
		
		if(!this._geoModel.getProperty("/GEOData/ST")){	
			this._geoModel.setProperty("/GEOData/STcolor", this.COLOR_RED);
		}
		
		if(!this._geoModel.getProperty("/GEOData/ALH")){	
			this._geoModel.setProperty("/GEOData/ALHcolor", this.COLOR_RED);
		}
		
		if(!this._geoModel.getProperty("/GEOData/AUH")){	
			this._geoModel.setProperty("/GEOData/AUHcolor", this.COLOR_RED);
		}
		
		fnClear = function() {
			this._geoModel.setProperty("/GEOData/ST", {});	
			this._geoModel.setProperty("/GEOData/ALH",  {});	
			this._geoModel.setProperty("/GEOData/AUH", {});
			this._geoModel.setProperty("/GEOData/current", "");
			
			this._geoModel.setProperty("/GEOData/STcolor", this.COLOR_RED);
			this._geoModel.setProperty("/GEOData/ALHcolor", this.COLOR_RED);
			this._geoModel.setProperty("/GEOData/AUHcolor", this.COLOR_RED);
		}.bind(this);
		
		this._geoModel.setProperty("/GEOData/captured", false);		
		this.fnSetUnit("ST", false);
		
		return this.oGEODatenDialog;
	},

	getReasonDialog : function(oContext) {

	    var oReasonDialog = new Dialog({
		title : oContext.title,
		type : 'Message',
		content : [
			new Label({ /* text: oContext.text, */
			    labelFor : 'submitDialogTextarea'
			}), new TextArea('submitDialogTextarea', {
				maxLength: Constants.LENGTH_OF_COMMENTS,
			    value: oContext.initValue,
			    liveChange : function(oEvent) {
				var sText = oEvent.getParameter('value');
				var parent = oEvent.getSource().getParent();
				parent.getBeginButton().setEnabled(sText.length > 0);
			    },
			    width : '100%',
			    placeholder : oContext.bundle.getText("General.Placeholder")
			})
		],
		beginButton : new Button({
		    text : oContext.bundle.getText("General.Accept"),
		    enabled : false,
		    press : function() {
		    	var oTextArea = sap.ui.getCore().byId('submitDialogTextarea');
		    	oContext.success(oContext.source, oTextArea.getValue());
		    	oTextArea.setValue("");
		    	oReasonDialog.close();
		    }
		}),
		endButton : new Button({
		    text : oContext.bundle.getText("General.Abort"),
		    press : function() {
			oContext.abort(oContext.source);
			oReasonDialog.close();
		    }
		}),
		afterClose : function() {
		    oReasonDialog.destroy();
		}
	    });

	    return oReasonDialog;
	},
	
	
	getCameraDialog : function(oContext) {
	    
//	    var oPhotoResult;
//	    
//	    var oCamera = new openui5.camera.Camera({	
//		id : "idCamera",	
//		width: "800",
//		height: "600",
//		snapshot: function(oResult) {
//		    debugger;
//		    oPhotoResult = oResult;
//		}
//	    });
//
//	    var oCameraDialog = new Dialog({
//		title : oContext.title,
//		type : 'Message',
//		content : [ oCamera ],
//		beginButton : new Button({
//		    text : 'Aufnahme',
//		    enabled : false,
//		    press : function(oEvent) {			
//			oContext.success(oContext.source, oPhotoResult);			
//			oCameraDialog.close();
//		    }
//		}),
//		endButton : new Button({
//		    text : 'Abbrechen',
//		    press : function() {
//			oContext.abort(oContext.source);
//			oCameraDialog.close();
//		    }
//		}),
//		afterClose : function() {
//		    oCameraDialog.destroy();
//		}
//	    });
//
//	    return oCameraDialog;
	}

    };
});
