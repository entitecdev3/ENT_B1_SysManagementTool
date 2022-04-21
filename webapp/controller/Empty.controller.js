sap.ui.define([
  "nvid/sample/controller/BaseController",
  "nvid/sample/dbapi/dbAPI",
  "sap/m/MessageToast"
], function(BaseController, dbAPI, MessageToast) {
  "use strict";

  return BaseController.extend("nvid.sample.controller.Empty", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf nvid.sample.view.Empty
     */
    	onInit: function() {
        var that = this;
        setTimeout(function(){
          that.getOwnerComponent().getModel("local").setProperty("/Date", {
            "START_ON": new Date(),
            "END_ON": new Date()
          });
        }, 2000)
    	},
    onStatusSelection: function(oEvent) {
      this.getView().getModel("local").setProperty("/Job/STATUS", oEvent.getParameter("selectedIndex") === 0 ? "A" : "I");
    },
    onFrequency: function(oEvent) {
      const selectedIndex = oEvent.getParameter("selectedIndex");
      this.getView().getModel("local").setProperty("/Job/FREQUENCY", selectedIndex === 0 ? "D" : selectedIndex === 1 ? "W" : "M");
    },
    onSourceCompany: function(oEvent){
      this.getView().getModel("local").setProperty("/Job/BASE_SCHEMA_NAME", oEvent.getParameter("selectedItem").getText().split('(')[1].split(")")[0]);
      var that = this;
      dbAPI.callMiddleWare("/schemaBasePath?BASE_SCHEMA="+oEvent.getParameter("selectedItem").getKey(), "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/BasePaths", oData);
        that.getOwnerComponent().getModel("local").setProperty("/TargetPaths", JSON.parse(JSON.stringify(oData)));
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
    onSave: function() {
      var that = this,
        job = this.getView().getModel("local").getProperty("/Job"),
        bPath = this.getView().getModel("local").getProperty("/BasePaths"),
        tPath = this.getView().getModel("local").getProperty("/TargetPaths");
      if(job.BASE_SCHEMA===job.TARGET_SCHEMA){
        MessageToast.show("Invalid Data, Can't Save")
        return;
      }
      if(job.SCHEDULED==="Y"&&(!job.START_ON)){
        this.getView().byId("DTP2").setValueState("Error");
        return;
      }

      if(bPath.WordPath===tPath.WordPath || bPath.ExcelPath===tPath.ExcelPath  || bPath.BitmapPath===tPath.BitmapPath ||
        bPath.AttachPath===tPath.AttachPath || bPath.ExtPath===tPath.ExtPath || bPath.XmlPath===tPath.XmlPath){
        MessageToast.show("Base and Target Path Can't be Same");
        return;
      }
      // Default Configuration
      job.CONFIGURATION = {
        JOB_NAME: job.JOB_NAME,
        BASE_SCHEMA: job.BASE_SCHEMA,
        JOB_TYPE: job.JOB_TYPE
      };
      // Job Specific
      if (job.JOB_TYPE === "COPY_COMPANY") {
        job.CONFIGURATION.UserName = job.UserName;
        job.CONFIGURATION.Password = job.Password;
        job.CONFIGURATION.TARGET_SCHEMA = job.TARGET_SCHEMA;
        job.CONFIGURATION.TARGET_SCHEMA_NAME = job.TARGET_SCHEMA_NAME;
        job.CONFIGURATION.BASE_SCHEMA_NAME = job.BASE_SCHEMA_NAME;
        job.CONFIGURATION.WordPath = tPath.WordPath;
        job.CONFIGURATION.ExcelPath = tPath.ExcelPath;
        job.CONFIGURATION.BitmapPath = tPath.BitmapPath;
        job.CONFIGURATION.AttachPath = tPath.AttachPath;
        job.CONFIGURATION.ExtPath = tPath.ExtPath;
        job.CONFIGURATION.XmlPath = tPath.XmlPath;
      }

      job.CONFIGURATION = JSON.stringify(job.CONFIGURATION);
      this.getView().byId("idSave").setEnabled(false);
      dbAPI.callMiddleWare("/createJob", "POST", job).then(function(oData) {
        MessageToast.show("Success");
        that.onClear();
        that.getView().byId("idSave").setEnabled(true);
        that.loadJobs();
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
        that.getView().byId("idSave").setEnabled(true);
      });
    },
    onScheduled: function(oEvent) {
      this.getView().getModel("local").setProperty("/Job/SCHEDULED", oEvent.getParameter("selected") ? 'Y' : 'N');
    },
    handleInfoPress: function(){
      MessageToast.show("Hover on it");
    },
    onClear: function() {
      this.getView().getModel("local").setProperty("/Job", {
        "JOB_NAME": null,
        "BASE_SCHEMA": null,
        "BASE_SCHEMA_NAME": null,
        "TARGET_SCHEMA": "",
        "TARGET_SCHEMA_NAME": "zTEST *$$DATE_DDMMYYYY$$* $$BASE_COMP_NAME$$",
        "FREQUENCY": null,
        "START_ON": null,
        "END_ON": null,
        "SCHEDULED": "Y",
        "STATUS": "A",
        "JOB_TYPE": "COPY_COMPANY",
        "CONFIGURATION": null,
        "CREATED_ON": null
      });
      this.getView().getModel("local").setProperty("/Date", {
        "START_ON": new Date(),
        "END_ON": new Date()
      });
      this.getView().byId("groupD").setSelectedIndex(0);
      this.getView().byId("groupC").setSelectedIndex(0);
    }
    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf nvid.sample.view.Empty
     */
    //	onBeforeRendering: function() {
    //
    //	},

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf nvid.sample.view.Empty
     */
    //	onAfterRendering: function() {
    //
    //	},

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf nvid.sample.view.Empty
     */
    //	onExit: function() {
    //
    //	}

  });

});
