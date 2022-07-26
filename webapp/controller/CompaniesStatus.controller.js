sap.ui.define([
	"nvid/sample/controller/BaseController",
	"nvid/sample/dbapi/dbAPI",
	"sap/ui/model/json/JSONModel",
	"nvid/sample/model/formatter",
	"sap/m/GenericTile",
	"sap/m/TileContent",
	"sap/m/NumericContent",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Core",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Text",
	"sap/m/Input",
	"sap/m/MessageBox"
], function(BaseController, dbAPI, JSONModel, formatter, GenericTile, TileContent, NumericContent, Filter, FilterOperator, Core, Dialog, Button, Label, mobileLibrary, Text, Input, MessageBox ) {
	"use strict";
	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;
	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	return BaseController.extend("nvid.sample.controller.CompaniesStatus", {
		formatter: formatter,
		onInit: function onInit() {
			var that = this;
			this.oRouter = this.getOwnerComponent().getRouter();
      this.oRouter.getRoute("CompaniesStatus").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function _onRouteMatched(oEvent) {
			if(!this.fromDetailPage){
				this.loadCompanies();
			}else{
				this.fromDetailPage = false;
			}
		},
		onSortingPress: function(oEvent){
			var oTable = this.getView().byId("idCompaniesTable");
			oTable.getColumns().forEach(item=>{
				try{
					item.getHeader().setIcon();
				}catch(err){

				}
			});
			oEvent.getSource().getParent().getParent().setIcon(oEvent.getSource().getText()!=='Clear' ? oEvent.getSource().getIcon() : "");
			var oSorter = [new sap.ui.model.Sorter({ path: 'typeSts', descending: true, group: true})];
			if(oEvent.getSource().getText()!=='Clear'){
				oSorter.push(new sap.ui.model.Sorter({ path: oEvent.getSource().getParent().getParent().getCustomData()[0].getValue(), descending: oEvent.getSource().getText()==="Descending"}))
			}
			oTable.getBinding("items").sort(oSorter);
		},
		onFilterButtonPress: function(oEvent){
			this.oButton = oEvent.getSource();
			this.byId("actionSheet").openBy(this.oButton);
		},
		onSortingPress2: function(oEvent){
			var oTable = this.getView().byId("idCompaniesTable");
			oTable.getColumns().forEach(item=>{
				try{
					item.getHeader().setIcon();
				}catch(err){

				}
			});
			this.oButton.setIcon(oEvent.getSource().getText()!=='Clear' ? oEvent.getSource().getIcon() : "");
			var oSorter = [new sap.ui.model.Sorter({ path: 'typeSts', descending: false, group: true})];
			if(oEvent.getSource().getText()!=='Clear'){
				oSorter.push(new sap.ui.model.Sorter({ path: this.oButton.getCustomData()[0].getValue(), descending: oEvent.getSource().getText()==="Descending"}))
			}
			oTable.getBinding("items").sort(oSorter);
		},
		onRefresh: function(){
			this.getView().byId("refreshButton").setEnabled(false);
			this.loadCompanies();
			var oTable = this.getView().byId("idCompaniesTable");
			oTable.getColumns().forEach(item=>{
				try{
					item.getHeader().setIcon();
				}catch(err){
					//
				}
			});
		},
		onTypeEdit: function (pEvent) {

			this.typeSPath = pEvent.getSource().getParent().getBindingContextPath();
			var that = this,
			type = pEvent.getSource().getText(),
			schema = that.getView().getModel('local').getProperty(that.typeSPath+'/dbName');
			if (!this.oSubmitDialog) {
				this.oSubmitDialog = new Dialog({
					type: DialogType.Message,
					title: "Comfirm Type, Schema: "+schema,
					contentWidth:"300px",
					content: [
						new Label({
							text: "Schema",
							labelFor: "idSchema"
						}),
						new Input("idSchema", {
							width: "100%",
							placeholder: "Schema (required)",
							editable:false,
							value:""
						}),
						new Label({
							text: "Type",
							labelFor: "idType"
						}),
						new sap.m.Select("idType", {
							width: "100%",
							editable:true,
							items:[
								new sap.ui.core.Item({
									key: "PROD",
									text: "PROD"
								}),
								new sap.ui.core.Item({
									key: "TEST",
									text: "TEST"
								})
							]
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Submit",
						enabled: true,
						press: function () {
							var payload = {
								"TYPE": Core.byId("idType").getSelectedKey(),
								"SCHEMA": Core.byId("idSchema").getValue()
							};
							that.oSubmitDialog.setBusy(true);
							dbAPI.callMiddleWare("/updateTypeInfo", "POST", payload).then(function(oData) {
								that.oSubmitDialog.setBusy(false);
								that.getView().getModel('local').setProperty(that.typeSPath+'/typeSts', payload.TYPE);
								that.oSubmitDialog.close();
				      }).catch(function(oError) {
				        dbAPI.errorHandler(oError, that);
								that.oSubmitDialog.setBusy(false);
				      });
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oSubmitDialog.close();
						}.bind(this)
					})
				});
			}
			that.oSubmitDialog.open();
			Core.byId("idType").setSelectedKey(type);
			Core.byId("idSchema").setValue(schema);
		},
		onItemPress: function(oEvent){
			const {dbName, cmpName} = this.getView().getModel('local').getProperty(oEvent.getSource().getParent().getBindingContextPath());
			this.getView().getModel('local').setProperty("/CompanyDetailTitle",{dbName, cmpName});
			this.oRouter.navTo("CompaniesDetail", {
        "dbName": dbName
      });
			this.fromDetailPage = true;
		},
		onNavBack: function(){
      this.oRouter.navTo("Main");
    }
	});
});
