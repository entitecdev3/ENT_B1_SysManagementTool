sap.ui.define([
  "nvid/sample/controller/BaseController",
  "nvid/sample/dbapi/dbAPI",
  'sap/base/util/deepExtend',
  "sap/ui/model/json/JSONModel",
  'sap/m/ColumnListItem',
	'sap/m/Input',
  "sap/m/MessageToast"
], function(BaseController, dbAPI, deepExtend, JSONModel, ColumnListItem, Input, MessageToast) {
  "use strict";

  return BaseController.extend("nvid.sample.controller.Empty", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf nvid.sample.view.Empty
     */
    	onInit: function() {
        var that = this;
        this.oModel=this.getOwnerComponent().getModel("local");
        this.oTable = this.byId("idQueriesTable");
  			this.oReadOnlyTemplate = this.byId("idQueriesTable").removeItem(0);
  			this.oEditableTemplate = new ColumnListItem({
  				cells: [
            new Input({
             value: "{local>Name}",
           }), new Input({
             value: "{local>Query}"
           })
  				]
  			});
        that.rebindTable(that.oReadOnlyTemplate, "Navigation");
        setTimeout(function(){
          that.getOwnerComponent().getModel("local").setProperty("/Date", {
            "START_ON": new Date(),
            "END_ON": new Date()
          });
        }, 2000)
    	},
      rebindTable: function(oTemplate, sKeyboardMode) {
			this.oTable.bindItems({
				path: "local>/Job/CONFIGURATION/Custom_SQL_Queries",
				template: oTemplate
			});
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

      if((bPath.WordPath===tPath.WordPath&&tPath.WordPath) || (bPath.ExcelPath===tPath.ExcelPath&&tPath.ExcelPath)  || (bPath.BitmapPath===tPath.BitmapPath&&tPath.BitmapPath) ||
        (bPath.AttachPath===tPath.AttachPath&&tPath.AttachPath) || (bPath.ExtPath===tPath.ExtPath&&tPath.ExtPath) || (bPath.XmlPath===tPath.XmlPath&&tPath.XmlPath)){
        MessageToast.show("Base and Target Path Can't be Same");
        return;
      }
      // Default Configuration
      job.CONFIGURATION = {
        JOB_NAME: job.JOB_NAME,
        BASE_SCHEMA: job.BASE_SCHEMA,
        JOB_TYPE: job.JOB_TYPE,
        Attach_Path_Remap_Existing_Documents: job.CONFIGURATION.Attach_Path_Remap_Existing_Documents,
        Custom_SQL_Queries: job.CONFIGURATION.Custom_SQL_Queries
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
    onExistingDocsChange: function(oEvent) {
      this.getView().getModel("local").setProperty("/Job/CONFIGURATION/Attach_Path_Remap_Existing_Documents", oEvent.getParameter("selected") ? 'Y' : 'N');
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
        "CONFIGURATION": {
          "Attach_Path_Remap_Existing_Documents": "N",
          "Custom_SQL_Queries":[]
        },
        "CREATED_ON": null
      });
      this.getView().getModel("local").setProperty("/Date", {
        "START_ON": new Date(),
        "END_ON": new Date()
      });
      this.getView().getModel("local").setProperty("/BasePaths",{}),
      this.getView().getModel("local").setProperty("/TargetPaths",{});
      this.getView().byId("groupD").setSelectedIndex(0);
      this.getView().byId("groupC").setSelectedIndex(0);
    },

		onQueriesEdit: function() {
			this.aUserCollection = deepExtend([], this.oModel.getProperty("/Job/CONFIGURATION/Custom_SQL_Queries"));
			this.byId("editButton").setVisible(false);
      this.byId("addButton").setVisible(true);
			// this.byId("saveButton").setVisible(true);
			this.byId("cancelButton").setVisible(true);
      this.oTable.setMode('Delete');
      this.rebindTable(this.oEditableTemplate, "Edit");
		},

		onQueriesSave: function() {
			// this.byId("saveButton").setVisible(false);
      this.byId("addButton").setVisible(false);
			this.byId("cancelButton").setVisible(false);
			this.byId("editButton").setVisible(true);
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
      this.oTable.setMode('None');
		},

		onQueriesCancel: function() {
      var that=this;
			this.byId("cancelButton").setVisible(false);
      this.byId("addButton").setVisible(false);
			this.byId("saveButton").setVisible(false);
			this.byId("editButton").setVisible(true);
			this.oModel.setProperty("/Job/CONFIGURATION/Custom_SQL_Queries", this.aUserCollection);
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
      this.oTable.setMode('None');
		},
    onQueriesDelete: function(oEvent){
      let sPath = oEvent.getParameter('listItem').getBindingContextPath();
      this.getView().getModel('local').getProperty('/Job/CONFIGURATION/Custom_SQL_Queries').splice(parseInt(sPath.split('/')[4]),1);
      this.getView().getModel('local').refresh();
      // this.getView().getModel().setProperty('/serverCollection',servers);
    },
    onQueriesAdd: function(oEvent){
      let customSQLQueries = this.getView().getModel('local').getProperty('/Job/CONFIGURATION/Custom_SQL_Queries');
      customSQLQueries.push({})
      this.getView().getModel('local').setProperty('/Job/CONFIGURATION/Custom_SQL_Queries',customSQLQueries);
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
