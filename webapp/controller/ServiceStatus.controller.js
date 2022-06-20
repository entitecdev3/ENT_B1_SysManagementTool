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

	return BaseController.extend("nvid.sample.controller.ServiceStatus", {
		formatter: formatter,
		onInit: function onInit() {
			this.oRouter = this.getOwnerComponent().getRouter();
      this.oRouter.getRoute("ServiceStatus").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function _onRouteMatched(oEvent) {
			this.loadServices();
		},
		onRefresh: function(){
			this.loadServices();
		},
		onServerLocationPress: function (pEvent) {
			var that = this;
			if (!this.oSubmitDialog) {
				this.oSubmitDialog = new Dialog({
					type: DialogType.Message,
					title: "Server Connection Info",
					contentWidth:"300px",
					content: [
						new Label({
							text: "Host Name",
							labelFor: "idServerName"
						}),
						new Input("idServerName", {
							width: "100%",
							placeholder: "Host Name (required)",
							editable:false,
							value:""
						}),
						new Label({
							text: "Port",
							labelFor: "idPort"
						}),
						new Input("idPort", {
							width: "100%",
							placeholder: "Host Name (required)",
							editable:true,
							value:22
						}),
						new Label({
							text: "User Name",
							labelFor: "idUserName"
						}),
						new Input("idUserName",{
							width: "100%",
							placeholder: "Username (required)",
							value:"",
							liveChange: function (oEvent) {
								var sText = oEvent.getParameter("value");
								this.oSubmitDialog.getBeginButton().setEnabled(sText.length > 0);
							}.bind(this)
						}),
						new Label({
							text: "Password",
							labelFor: "idPassword"
						}),
						new Input("idPassword",{
							width: "100%",
							placeholder: "Password (required)",
							type:"Password",
							value:"",
							liveChange: function (oEvent) {
								var sText = oEvent.getParameter("value");
								this.oSubmitDialog.getBeginButton().setEnabled(sText.length > 0);
							}.bind(this)
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Submit",
						enabled: false,
						press: function () {
							var payload = {
								"HOSTNAME": Core.byId("idServerName").getValue(),
								"PORT": Core.byId("idPort").getValue(),
								"USERNAME": Core.byId("idUserName").getValue(),
								"PASSWORD": Core.byId("idPassword").getValue()
							};
							that.oSubmitDialog.setBusy(true);
							dbAPI.callMiddleWare("/updateHostInfo", "POST", payload).then(function(oData) {
								that.oSubmitDialog.setBusy(false);
								that.oSubmitDialog.close();
				      }).catch(function(oError) {
				        dbAPI.errorHandler(oError, that);
								that.oSubmitDialog.setBusy(false);
				      });
							this.oSubmitDialog.close();
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
			that.getView().setBusy(true);
			var hostname = pEvent.getSource().getText();
      dbAPI.callMiddleWare("/hostInfo?hostname="+hostname, "GET").then(function(oData) {
				Core.byId("idServerName").setValue(hostname);
				Core.byId("idPort").setValue(oData.PORT);
				Core.byId("idUserName").setValue(oData.USERNAME);
				Core.byId("idPassword").setValue(oData.PASSWORD);
				that.getView().setBusy(false);
				that.oSubmitDialog.open();
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
		},
		onStart: function(oEvent){
			var that=this,
			 ServiceIDs=[],
			 serviceNames="";
			oEvent.getSource().getParent().getParent().getSelectedItems().forEach(item=>{
				var oItem = that.getView().getModel('local').getProperty(item.getBindingContextPath());
				if(oItem.ActualStatus==='Offline'||oItem.Formalstatus==='Offline'){
					ServiceIDs.push(oItem.ServiceCode);
					serviceNames+='\n '+that.getView().getModel('local').getProperty(item.getBindingContextPath()).ServiceName;
				}
			});
			if(ServiceIDs.length===0){
				MessageBox.alert("Selected services already running\n");
				return;
			}
			MessageBox.confirm("Do you want to start following Services:\n"+serviceNames,function(val){
				if(val==="OK"){
					that.getView().setBusy(true);
					dbAPI.callMiddleWare("/serviceStart", "POST", {ServiceIDs}).then(function(oData) {
						that.getView().setBusy(false);
						sap.m.MessageBox.information(oData);
					}).catch(function(oError) {
						that.getView().setBusy(false);
						dbAPI.errorHandler(oError, that);
					});
				}
			});
		},
		onStop: function(oEvent){
			var that=this,
			 ServiceIDs=[],
			 serviceNames="";
			oEvent.getSource().getParent().getParent().getSelectedItems().forEach(item=>{
				var oItem = that.getView().getModel('local').getProperty(item.getBindingContextPath());
				if(oItem.ActualStatus==='Online'||oItem.Formalstatus==='Online'){
					ServiceIDs.push(oItem.ServiceCode);
					serviceNames+='\n '+that.getView().getModel('local').getProperty(item.getBindingContextPath()).ServiceName;
				}
			});
			if(ServiceIDs.length===0){
				MessageBox.alert("Selected services already Offline\n");
				return;
			}
			MessageBox.confirm("Do you want to stop following Services:\n"+serviceNames,function(val){
				if(val==="OK"){
					that.getView().setBusy(true);
					dbAPI.callMiddleWare("/serviceStop", "POST", {ServiceIDs}).then(function(oData) {
						that.getView().setBusy(false);
						sap.m.MessageBox.information(oData);
					}).catch(function(oError) {
						that.getView().setBusy(false);
						dbAPI.errorHandler(oError, that);
					});
				}
			});
		},
		onRestart: function(oEvent){
			var that=this,
			ServiceIDs=[],
			serviceNames="";
			oEvent.getSource().getParent().getParent().getSelectedItems().forEach(item=>{
				ServiceIDs.push(that.getView().getModel('local').getProperty(item.getBindingContextPath()).ServiceCode);
				serviceNames+='\n '+that.getView().getModel('local').getProperty(item.getBindingContextPath()).ServiceName;
			});
			MessageBox.confirm("Do you want to restart following Services:\n"+serviceNames,function(val){
				if(val==="OK"){
					that.getView().setBusy(true);
					dbAPI.callMiddleWare("/serviceRestart", "POST", {ServiceIDs}).then(function(oData) {
						that.getView().setBusy(false);
						sap.m.MessageBox.information(oData);
					}).catch(function(oError) {
						that.getView().setBusy(false);
						dbAPI.errorHandler(oError, that);
					});
				}
			});
		},
		onTableSelectionChange: function(oEvent){
			this.getView().byId("startButton").setEnabled(Boolean(oEvent.getSource().getSelectedItems().length));
			this.getView().byId("stopButton").setEnabled(Boolean(oEvent.getSource().getSelectedItems().length));
			this.getView().byId("restartButton").setEnabled(Boolean(oEvent.getSource().getSelectedItems().length));
		},
		onStatus: function(oEvent){
			if (!this.statusDetailsDialog) {
        this.statusDetailsDialog = sap.ui.xmlfragment("transportDetailsDialog", "nvid/sample/fragments/StatusDetails", this);
      }
			this.statusDetailsDialog.setModel(new JSONModel(this.getView().getModel("local").getProperty(oEvent.getSource().getParent().getBindingContextPath())), 'dialog');
			this.statusDetailsDialog.updateBindings();
			this.statusDetailsDialog.open();
		},
		onStatusDetailsClose: function(){
			this.statusDetailsDialog.close();
		},
		onNavBack: function(){
      this.oRouter.navTo("Main");
    }
	});
});
