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
        STATUS,
        TARGET_SCHEMA,
        CONFIGURATION,
        BASE_SCHEMA
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

      dbAPI.callMiddleWare("/schemaBasePath?BASE_SCHEMA="+BASE_SCHEMA, "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/BasePath", oData);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
      that.getOwnerComponent().getModel("local").setProperty("/TargetPath", CONFIGURATION);

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
        },10000);
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
    onExistingDocsChange: function(oEvent) {
      this.getView().getModel("local").setProperty("/Jobs/" + this.jobIndex + "/CONFIGURATION/Attach_Path_Remap_Existing_Documents", oEvent.getParameter("selected") ? 'Y' : 'N');
    },
    onStatusSelection: function(oEvent) {
      this.getView().getModel("local").setProperty("/Jobs/" + this.jobIndex + "/STATUS", oEvent.getParameter("selectedIndex") === 0 ? "A" : "I");
    },
    onSourceCompany: function(oEvent){
      this.getView().getModel("local").setProperty("/Jobs/" + this.jobIndex +"/BASE_SCHEMA_NAME", oEvent.getParameter("selectedItem").getText().split('(')[1].split(")")[0]);
      var that = this;
      dbAPI.callMiddleWare("/schemaBasePath?BASE_SCHEMA="+oEvent.getParameter("selectedItem").getKey(), "GET").then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/BasePath", oData);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
    onSave: function() {
      var that = this;
      var job = this.getView().getModel("local").getProperty("/Jobs/" + this.jobIndex),
      bPath = this.getView().getModel("local").getProperty("/BasePath"),
      tPath = this.getView().getModel("local").getProperty("/TargetPath");
      if(job.BASE_SCHEMA===job.TARGET_SCHEMA){
        MessageToast.show("Invalid Data, Can't Save")
        return;
      }
      // if(bPath.WordPath===tPath.WordPath || bPath.ExcelPath===tPath.ExcelPath  || bPath.BitmapPath===tPath.BitmapPath ||
      //   bPath.AttachPath===tPath.AttachPath || bPath.ExtPath===tPath.ExtPath || bPath.XmlPath===tPath.XmlPath){
      //   MessageToast.show("Base and Target Path Can't be Same");
      //   return;
      // }
      if((bPath.WordPath===tPath.WordPath&&tPath.WordPath) || (bPath.ExcelPath===tPath.ExcelPath&&tPath.ExcelPath)  || (bPath.BitmapPath===tPath.BitmapPath&&tPath.BitmapPath) ||
        (bPath.AttachPath===tPath.AttachPath&&tPath.AttachPath) || (bPath.ExtPath===tPath.ExtPath&&tPath.ExtPath) || (bPath.XmlPath===tPath.XmlPath&&tPath.XmlPath)){
        MessageToast.show("Base and Target Path Can't be Same");
        return;
      }
      job.CONFIGURATION = {
        JOB_NAME: job.JOB_NAME,
        BASE_SCHEMA: job.BASE_SCHEMA,
        TARGET_SCHEMA: job.TARGET_SCHEMA,
        JOB_TYPE: job.JOB_TYPE,
        Attach_Path_Remap_Existing_Documents: job.CONFIGURATION.Attach_Path_Remap_Existing_Documents
      };
      if (job.JOB_TYPE === "COPY_COMPANY") {
        job.CONFIGURATION.UserName = job.UserName;
        job.CONFIGURATION.Password = job.Password;
        job.CONFIGURATION.BASE_SCHEMA_NAME = job.BASE_SCHEMA_NAME;
        job.CONFIGURATION.TARGET_SCHEMA_NAME = job.TARGET_SCHEMA_NAME;
        job.CONFIGURATION.WordPath = tPath.WordPath;
        job.CONFIGURATION.ExcelPath = tPath.ExcelPath;
        job.CONFIGURATION.BitmapPath = tPath.BitmapPath;
        job.CONFIGURATION.AttachPath = tPath.AttachPath;
        job.CONFIGURATION.ExtPath = tPath.ExtPath;
        job.CONFIGURATION.XmlPath = tPath.XmlPath;
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
        dbAPI.callMiddleWare("/logbyJobId?JOB_ID=" + that.jobId, "GET").then(function(oData) {
          that.getOwnerComponent().getModel("local").setProperty("/Logs", oData);
          that.getView().byId("idLogRefreshTime").setDateValue(new Date());
          that.getView().byId("idIconTabBar").setSelectedKey("logs");
        }).catch(function(oError) {
          dbAPI.errorHandler(oError, that);
        });
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
