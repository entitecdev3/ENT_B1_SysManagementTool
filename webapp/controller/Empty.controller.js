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
    //	onInit: function() {
    //
    //	},
    onStatusSelection: function(oEvent) {
      this.getView().getModel("local").setProperty("/Job/STATUS", oEvent.getParameter("selectedIndex") === 0 ? "A" : "I");
    },
    onFrequency: function(oEvent) {
      const selectedIndex = oEvent.getParameter("selectedIndex");
      this.getView().getModel("local").setProperty("/Job/FREQUENCY", selectedIndex === 0 ? "D" : selectedIndex === 1 ? "W" : "M");
    },
    onSave: function() {
      var that = this,
        job = this.getView().getModel("local").getProperty("/Job");
      this.getView().byId("idSave").setEnabled(false);
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
      }

      job.CONFIGURATION = JSON.stringify(job.CONFIGURATION);
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
    onClear: function() {
      this.getView().getModel("local").setProperty("/Job", {
        "JOB_NAME": null,
        "BASE_SCHEMA": null,
        "TARGET_SCHEMA": null,
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
