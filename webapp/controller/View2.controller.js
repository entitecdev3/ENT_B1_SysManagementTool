sap.ui.define([
  "nvid/sample/controller/BaseController",
  "nvid/sample/dbapi/dbAPI",
  "nvid/sample/model/formatter",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function(BaseController, dbAPI, formatter, MessageBox, MessageToast) {
  "use strict";

  return BaseController.extend("nvid.sample.controller.View2", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf nvid.sample.view.View2
     */
    onInit: function() {
      this.oRouter = this.getOwnerComponent().getRouter();
      //this.oRouter.attachRoutePatternMatched(this.herculis, this);
      this.oRouter.getRoute("detail").attachMatched(this.herculis, this);
    },

    formatter: formatter,

    herculis: function(oEvent) {
      this.jobIndex = oEvent.getParameter("arguments").navya;
      var sPath = 'local>/Jobs/' + this.jobIndex,
        that = this;
      this.getView().bindElement(sPath);
      const {
        JOB_ID,
        FREQUENCY,
        STATUS
      } = this.getView().getModel("local").getProperty("/Jobs/" + this.jobIndex);
      that.jobId = JOB_ID;
      // dbAPI.callMiddleWare("/jobbyId?JOB_ID=" + jobId, "GET").then(function(jobData) {
      //   that.getOwnerComponent().getModel("local").setProperty("/JobDetails", jobData[0]);
      // }).catch(function(oError) {
      //   dbAPI.errorHandler(oError, that);
      // });
      dbAPI.callMiddleWare("/logbyJobId?JOB_ID=" + that.jobId, "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/Logs", oData);
        that.getView().byId("idLogRefreshTime").setDateValue(new Date());
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });

      this.getView().byId("groupD").setSelectedIndex(STATUS === "A" ? 0 : 1);
      this.getView().byId("groupC").setSelectedIndex(FREQUENCY === "D" ? 0 : FREQUENCY === "W" ? 1 : 2);
      this.loadCompaniesList();
      this.refreshLogsInterval(that);
    },

    refreshLogsInterval: function(that){
      if(that.jobId  && (!that.logInterval)){
        that.logInterval = setInterval(function(){
          // console.log(that.jobId );
          dbAPI.callMiddleWare("/logbyJobId?JOB_ID=" + that.jobId, "GET").then(function(oData) {
            that.getOwnerComponent().getModel("local").setProperty("/Logs", oData);
            that.getView().byId("idLogRefreshTime").setDateValue(new Date());
          }).catch(function(oError) {
            dbAPI.errorHandler(oError, that);
          });
        },30000);
      }else if((!that.jobId) && that.logInterval){
        clearInterval(that.logInterval)
        that.logInterval = null;
        that.getOwnerComponent().getModel("local").setProperty("/Logs", []);
      }
    },

    onBack: function() {
      //Step 1: Get The Container object for this view
      //var oParent = this.getView().getParent();
      //Step 2: use that to navigate to second view
      //oParent.to("idView1");
      this.oRouter.navTo("master");
    },
    onScheduled: function(oEvent) {
      this.getView().getModel("local").setProperty("/Jobs/" + this.jobIndex + "/SCHEDULED", oEvent.getParameter("selected") ? 'Y' : 'N');
    },
    onStatusSelection: function(oEvent) {
      this.getView().getModel("local").setProperty("/Jobs/" + this.jobIndex + "/STATUS", oEvent.getParameter("selectedIndex") === 0 ? "A" : "I");
    },
    onSourceCompany: function(oEvent){
      this.getView().getModel("local").setProperty("/Jobs/" + this.jobIndex +"/BASE_SCHEMA_NAME", oEvent.getParameter("selectedItem").getText().split('(')[1].split(")")[0]);
    },
    onSave: function() {
      var that = this;
      var job = this.getView().getModel("local").getProperty("/Jobs/" + this.jobIndex);
      if(job.BASE_SCHEMA===job.TARGET_SCHEMA){
        MessageToast.show("Invalid Data, Can't Save")
        return;
      }
      job.CONFIGURATION = {
        JOB_NAME: job.JOB_NAME,
        BASE_SCHEMA: job.BASE_SCHEMA,
        TARGET_SCHEMA: job.TARGET_SCHEMA,
        JOB_TYPE: job.JOB_TYPE
      };
      if (job.JOB_TYPE === "COPY_COMPANY") {
        job.CONFIGURATION.UserName = job.UserName;
        job.CONFIGURATION.Password = job.Password;
        job.CONFIGURATION.BASE_SCHEMA_NAME = job.BASE_SCHEMA_NAME;
        job.CONFIGURATION.TARGET_SCHEMA_NAME = job.TARGET_SCHEMA_NAME;
      }
      job.CONFIGURATION = JSON.stringify(job.CONFIGURATION);
      dbAPI.callMiddleWare("/updateJob", "PUT", job).then(function(oData) {
        MessageToast.show("Success");
        that.loadJobs();
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
    onForceRun: function() {
      var that = this;
      var job = this.getView().getModel("local").getProperty("/Jobs/" + this.jobIndex);
      dbAPI.callMiddleWare("/runJob", "POST", job).then(function(oData) {
        MessageToast.show("Job Started");
        that.getView().byId("idIconTabBar").setSelectedKey("logs");
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
    onDelete: function() {
      const JOB_ID = this.getView().getModel("local").getProperty("/Jobs/" + this.jobIndex + "/JOB_ID"),
        that = this;
      dbAPI.callMiddleWare("/jobSoftDelete?JOB_ID=" + JOB_ID, "DELETE").then(function(oData) {
        that.loadJobs();
        that.oRouter.navTo("Jobs");
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    }
    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf nvid.sample.view.View2
     */
    //	onBeforeRendering: function() {
    //
    //	},

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf nvid.sample.view.View2
     */
    //	onAfterRendering: function() {
    //
    //	},

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf nvid.sample.view.View2
     */
    //	onExit: function() {
    //
    //	}

  });

});
