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

	return BaseController.extend("nvid.sample.controller.CompaniesDetail", {
		formatter: formatter,
		onInit: function onInit() {
			var that = this;
			this.oRouter = this.getOwnerComponent().getRouter();
      this.oRouter.getRoute("CompaniesDetail").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function _onRouteMatched(oEvent) {
			this.dbName = oEvent.getParameter("arguments").dbName;
			this.loadDetailsForTitle(this.dbName);
			this.loadOpenSessions(this.dbName);
			this.loadDependenciesFrom(this.dbName);
			this.loadDependenciesTo(this.dbName);
		},
		onRefresh: function(){
			this.getOwnerComponent().getModel("local").setProperty("/CompanyDetails",{});
			this.loadOpenSessions(this.dbName);
			this.loadDependenciesFrom(this.dbName);
			this.loadDependenciesTo(this.dbName);
		},
		loadDetailsForTitle: function(dbName){
			var that = this;
			dbAPI.callMiddleWare("/companyDetails?dbName="+dbName, "GET").then(function(oData) {
				that.getView().getModel('local').setProperty("/CompanyDetailTitle", oData);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
		},
		loadOpenSessions: function(dbName){
			var that = this;
			dbAPI.callMiddleWare("/openSessions?dbName="+dbName, "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/CompanyDetails/OpenSessions", oData);
				that.getOwnerComponent().getModel("local").setProperty("/CompanyDetails/OpenSessionsCount", oData.length);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
		},
		loadDependenciesFrom: function(dbName){
			var that = this;
			dbAPI.callMiddleWare("/dependenciesFrom?dbName="+dbName, "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/CompanyDetails/DependenciesFrom", oData);
				that.getOwnerComponent().getModel("local").setProperty("/CompanyDetails/DependenciesFromCount", oData.length);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
		},
		loadDependenciesTo: function(dbName){
			var that = this;
			dbAPI.callMiddleWare("/dependenciesTo?dbName="+dbName, "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/CompanyDetails/DependenciesTo", oData);
				that.getOwnerComponent().getModel("local").setProperty("/CompanyDetails/DependenciesToCount", oData.length);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
		},
		pressTile1: function(){
			this.getView().byId("idIconTabBarSeparatorNoIcon").setSelectedKey("1");
		},
		pressTile2: function(){
			this.getView().byId("idIconTabBarSeparatorNoIcon").setSelectedKey("2");
		},
		pressTile3: function(){
			this.getView().byId("idIconTabBarSeparatorNoIcon").setSelectedKey("3");
		},
		onDeleteCompany: function(oEvent){
			var icon = MessageBox.Icon.SUCCESS,
						msg = "Pre-checks Successfull",
						that = this;
			if(this.getOwnerComponent().getModel("local").getProperty("/CompanyDetails/DependenciesFromCount")>0){
				icon = MessageBox.Icon.WARNING,
				msg = "Dependencies from exist";
			}
			MessageBox.confirm("Do you want to delete?", {
			icon: icon,
			title: msg,
			actions: [MessageBox.Action.YES, MessageBox.Action.NO],
			emphasizedAction: MessageBox.Action.YES,
			onClose: function (oAction) {
				if(oAction==="YES"){
					that.getView().setBusy(true);
					dbAPI.callMiddleWare("/deleteCompany?dbName="+that.dbName, "DELETE").then(function(oData) {
		      //   MessageBox.show("Company Deleted Successfully", {
					// 		onClose: function(){
					// 			this.oRouter.navTo("CompaniesStatus");
					// 		}.bind(that)
					// });
					that.getView().setBusy(false);
					that.oRouter.navTo("CompaniesStatus");
		      }).catch(function(oError) {
		        dbAPI.errorHandler(oError, that);
		      });
				}
			}
		});
		},
		onNavBack: function(){
      this.oRouter.navTo("CompaniesStatus");
    }
	});
});
