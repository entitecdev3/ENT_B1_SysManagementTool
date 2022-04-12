sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/UIComponent",
  "sap/ui/core/routing/History",
  "nvid/sample/model/formatter",
  "nvid/sample/dbapi/dbAPI",
  "sap/ui/core/Fragment",
  "sap/m/MessageBox"
], function(Controller, MessageToast, UIComponent, History, formatter, dbAPI, Fragment, MessageBox) {
  "use strict";

  return Controller.extend("nvid.sample.controller.BaseController", {
    formatter: formatter,
    cleanApp: function() {
      this.getOwnerComponent().getModel("local").setProperty("/cartItems", []);
    },

    onInit: function() {
      this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
    },

    setHeaderDatails: function() {
      var that = this;
      setTimeout(function() {
        that.getOwnerComponent().getModel("local").setProperty("/AgentType", sessionStorage.getItem("AgentType"));
        that.getOwnerComponent().getModel("local").setProperty("/UserName", sessionStorage.getItem("UserName"));
        that.getOwnerComponent().getModel("local").setProperty("/Role", sessionStorage.getItem("Role"));
        that.getView().byId("idUserName").setText(that.resourceBundlel.getText("Email") + ": " + sessionStorage.getItem("UserName"));
        that.getView().byId("idUserType").setText(that.resourceBundle.getText("UserType") + ": " + formatter.titleCase(sessionStorage.getItem(
          "AgentType")));
      }, 600);
    },
    getAdminId: function() {
      return sessionStorage.getItem("Code");
    },
    isDataLoaded: function() {
      return this.getOwnerComponent().getModel("admin").getProperty("/Users").length > 0;
    },
    loadJobs: function() {
      var that = this;
      dbAPI.callMiddleWare("/jobs", "GET").then(function(oData) {
        oData.forEach(function(item, index) {
          try {
            item.CONFIGURATION = JSON.parse(JSON.parse(JSON.stringify(item.CONFIGURATION)));
          } catch (err) {
            item.CONFIGURATION = {};
          }
          if (item.JOB_TYPE === "COPY_COMPANY" && item.CONFIGURATION) {
            oData[index].UserName = item.CONFIGURATION.UserName;
            oData[index].Password = item.CONFIGURATION.Password;
            oData[index].BASE_SCHEMA_NAME = item.CONFIGURATION.BASE_SCHEMA_NAME;
            oData[index].TARGET_SCHEMA_NAME = item.CONFIGURATION.TARGET_SCHEMA_NAME;
          }
        });
        that.getOwnerComponent().getModel("local").setProperty("/Jobs", oData);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
		loadLogs: function() {
      var that = this;
      dbAPI.callMiddleWare("/logs", "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/Logs", oData);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
    loadCompaniesList: function() {
      var that = this;
      dbAPI.callMiddleWare("/getCompanies", "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/Companies", oData);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
    onCountryChange1: function(oEvent) {
      var country = oEvent.getParameter("value");
      this.loadCountries1(country);
    },

    onCountryChange2: function(oEvent) {
      var country = oEvent.getParameter("value");
      this.loadCountries2(country);
    },

    loadTemplate: function() {
      var that = this;
      if (that.getOwnerComponent().getModel("local").getProperty("/Template") === undefined) {
        userAPI.loadTemplate(this)
          .then(function(data) {
            that.getOwnerComponent().getModel("local").setProperty("/Template", data.value);
          }).catch(function(oError) {
            MessageBox.error(oError);
            that.logOutApp();
          });
      }
    },

    getRouter: function() {
      return UIComponent.getRouterFor(this);
    },

    getModel: function(sName) {
      return this.getView().getModel(sName);
    },

    logOutApp: function() {
      window.top.location.href = "/";
    },

    getResourceBundle: function() {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    }

  });
});
