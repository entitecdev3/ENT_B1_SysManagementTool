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
      that.getView().setBusy(true);
      dbAPI.callMiddleWare("/jobs", "GET").then(function(oData) {
        oData.forEach(function(item, index) {
          try {
            oData[index].CONFIGURATION = JSON.parse(JSON.parse(JSON.stringify(item.CONFIGURATION)));
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
        that.getView().setBusy(false);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
		loadLogs: function() {
      var that = this;
      that.getView().setBusy(true);
      dbAPI.callMiddleWare("/logs", "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/Logs", oData);
        that.getView().setBusy(false);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
    loadCompaniesList: function() {
      var that = this;
      that.getView().setBusy(true);
      dbAPI.callMiddleWare("/getCompanies", "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/Companies", oData);
        that.getView().setBusy(false);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
    loadConfig: function() {
      var that = this;
      that.getView().setBusy(true);
      dbAPI.callMiddleWare("/config", "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/config", oData);
        that.getView().setBusy(false);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
    loadConfigStatus: function() {
      var that = this;
      that.getView().setBusy(true);
      dbAPI.callMiddleWare("/configStatus", "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/configStatus", oData);
        that.getView().setBusy(false);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
    loadUsers: function() {
      var that = this;
      that.getView().setBusy(true);
      dbAPI.callMiddleWare("/users", "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/Users", oData);
        that.getView().setBusy(false);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
    loadServices: function() {
      var that = this;
      that.getView().setBusy(true);
      dbAPI.callMiddleWare("/getServices2", "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/Services", oData);
        that.getOwnerComponent().getModel("local").refresh();
        that.getView().setBusy(false);
        if(that.getView().byId("idLogRefreshTime")){
          that.getView().byId("idLogRefreshTime").setDateValue(new Date(oData[0].CREATED_ON))
          that.getView().byId("refreshButton").setBusy(false);
        }
        // that.loadAsyncServicesStatus(oData);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
    loadAsyncServicesStatus: function(services){
      var that = this;
      // services.forEach(item=>{
      //   dbAPI.callMiddleWare("/getServices?ServiceCode=" + item.ServiceCode, "GET", {}, true).then(function(oData) {
      //     for(var index in services){
      //       if(services[index].ServiceCode === oData.ServiceCode){
      //         services[index] = Object.assign(oData, services[index]);
      //         that.getOwnerComponent().getModel("local").setProperty("/Services", services);
      //         break;
      //       }
      //     }
      //   }).catch(function(oError) {
      //     dbAPI.errorHandler(oError, that);
      //   });
      // });
      for(var service of services){
        dbAPI.callMiddleWare("/getServices2?ServiceCode=" + service.ServiceCode, "GET", {}, true).then(function(oData) {
          for(var index in services){
            if(services[index].ServiceCode === oData.ServiceCode){
              services[index] = Object.assign(oData, services[index]);
              that.getOwnerComponent().getModel("local").setProperty("/Services", services);
              break;
            }
          }
        }).catch(function(oError) {
          dbAPI.errorHandler(oError, that);
        });
      }
    },
    loadCompanies: function() {
      var that = this;
      that.getView().setBusy(true);
      dbAPI.callMiddleWare("/companies", "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/Companies", oData);
        that.getView().setBusy(false);
        dbAPI.callMiddleWare("/memorySizes", "GET").then(function(oMemory) {
          oData.forEach((item, index)=>{
            Object.assign(oData[index],oMemory[item.dbName] ? oMemory[item.dbName] : {
              MEMORY_SIZE : 'Deleted',
              DISK_SIZE: 'Deleted'
            });
          });
          that.getOwnerComponent().getModel("local").setProperty("/Companies", oData);
          if(that.getView().byId("idLogRefreshTime")){
            that.getView().byId("idLogRefreshTime").setDateValue(new Date());
            that.getView().byId("refreshButton").setEnabled(true);
          }
        }).catch(function(oError) {
          dbAPI.errorHandler(oError, that);
        });
        dbAPI.callMiddleWare("/diskSizes", "GET").then(function(oDisk) {
          oData.forEach((item, index)=>{
            Object.assign(oData[index],oDisk[item.dbName]);
          });
          that.getOwnerComponent().getModel("local").setProperty("/Companies", oData);
          if(that.getView().byId("idLogRefreshTime")){
            that.getView().byId("idLogRefreshTime").setDateValue(new Date());
          }
        }).catch(function(oError) {
          dbAPI.errorHandler(oError, that);
        });
        if(that.getView().byId("idLogRefreshTime")){
          that.getView().byId("idLogRefreshTime").setDateValue(new Date())
        }
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
    loadServicesOnOffCount: function() {
      var that = this;
      // that.getView().setBusy(true);
      dbAPI.callMiddleWare("/getServices2?count=true", "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/ServicesOnOffCount", oData);
        // that.getView().setBusy(false);
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
            dbAPI.errorHandler(oError, that);
          });
      }
    },

    getRouter: function() {
      return UIComponent.getRouterFor(this);
    },

    getModel: function(sName) {
      return this.getView().getModel(sName);
    },

    logOutApp: function(oEvent) {
      if(oEvent){
        var that = this;
        that.getView().setBusy(true);
        dbAPI.callMiddleWare("/logout", "GET").then(function(oData) {
          window.top.location.href = "/ui/index.html";
          that.getView().setBusy(false);
        }).catch(function(oError) {
          dbAPI.errorHandler(oError, that);
        });
      }
    },

    getResourceBundle: function() {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    }

  });
});
