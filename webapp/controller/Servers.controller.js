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

  return BaseController.extend("nvid.sample.controller.Servers", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf nvid.sample.view.Empty
     */
    	onInit: function() {
        var that=this;
        this.oTable = this.byId("idProductsTable");
  			this.oReadOnlyTemplate = this.byId("idProductsTable").removeItem(0);
  			this.oEditableTemplate = new ColumnListItem({
  				cells: [
  					new Input({
  						value: "{HOSTNAME}"
  					}), new Input({
  						value: "{PORT}"
  					}), new Input({
  						value: "{USERNAME}"
  					}), new Input({
              type: "Password",
  						value: "{PASSWORD}"
  					})
  				]
  			});
        that.getView().setBusy(true);
        // debugger;
        dbAPI.callMiddleWare("/hostInfo", "GET").then(function(oData) {
          // debugger;
          that.oModel = new JSONModel({serverCollection:oData});
          that.getView().setModel(that.oModel);
          that.rebindTable(that.oReadOnlyTemplate, "Navigation");
  				that.getView().setBusy(false);
        }).catch(function(oError) {
          dbAPI.errorHandler(oError, that);
        });
        this.deletedServers = [];
    	},

      rebindTable: function(oTemplate, sKeyboardMode) {
			this.oTable.bindItems({
				path: "/serverCollection",
				template: oTemplate,
				templateShareable: true,
				key: "SERVER_ID"
			}).setKeyboardMode(sKeyboardMode);
		},
    handleEditPress : function () {

			this._toggleButtonsAndView(true);

		},
    handleCancelPress : function () {
			//Restore the data
      this.loadConfig();
			this._toggleButtonsAndView(false);
		},
    handleSavePress : function () {
      var that = this;
      var payload = this.getView().getModel("local").getProperty("/config/path-for-export-import");
      dbAPI.callMiddleWare("/pathforExportImport", "POST", {
        "path-for-export-import" : payload
      }).then(function(oData) {
        that.getView().setBusy(false);
        that._toggleButtonsAndView(false);
        MessageToast.show("Saved")
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
  },
    _toggleButtonsAndView : function (bEdit) {
			var oView = this.getView();
			// Show the appropriate action buttons
      oView.byId("FormDisplay354").setVisible(!bEdit);
      oView.byId("FormChange354").setVisible(bEdit);
			oView.byId("edit").setVisible(!bEdit);
			oView.byId("save").setVisible(bEdit);
			oView.byId("cancel").setVisible(bEdit);
		},

		onEdit: function() {
			this.aProductCollection = deepExtend([], this.oModel.getProperty("/serverCollection"));
			this.byId("editButton").setVisible(false);
      this.byId("addButton").setVisible(true);
			this.byId("saveButton").setVisible(true);
			this.byId("cancelButton").setVisible(true);
			this.rebindTable(this.oEditableTemplate, "Edit");
      this.oTable.setMode('Delete');
		},

		onSave: function() {
			this.byId("saveButton").setVisible(false);
      this.byId("addButton").setVisible(false);
			this.byId("cancelButton").setVisible(false);
			this.byId("editButton").setVisible(true);
      this.oTable.setMode('None');
      var that = this;
      var payload = {
        upsert: this.oModel.getProperty("/serverCollection"),
        delete: this.deletedServers
      };
      dbAPI.callMiddleWare("/servers", "POST", payload).then(function(oData) {
        that.getView().setBusy(false);
        that.deletedServers = [];
        that.rebindTable(that.oReadOnlyTemplate, "Navigation");
        MessageToast.show("Saved")
      }).catch(function(oError) {
        that.deletedServers = [];
        dbAPI.errorHandler(oError, that);
      });
		},

		onCancel: function() {
      var that=this;
			this.byId("cancelButton").setVisible(false);
      this.byId("addButton").setVisible(false);
			this.byId("saveButton").setVisible(false);
			this.byId("editButton").setVisible(true);
			this.oModel.setProperty("/serverCollection", this.aProductCollection);
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
      this.oTable.setMode('None');
      this.deletedServers = [];
      // that.getView().setBusy(true);
      // dbAPI.callMiddleWare("/hostInfo", "GET").then(function(oData) {
      //   that.oModel = new JSONModel({serverCollection:oData});
      //   that.getView().setModel(that.oModel);
      //   that.rebindTable(that.oReadOnlyTemplate, "Navigation");
      //   that.getView().setBusy(false);
      // }).catch(function(oError) {
      //   dbAPI.errorHandler(oError, that);
      // });
		},
    onDelete: function(oEvent){
      let sPath = oEvent.getParameter('listItem').getBindingContext().sPath;
      const delItem = this.getView().getModel().getProperty('/serverCollection').splice(parseInt(sPath.split('/')[2]),1);
      if(delItem[0].SERVER_ID){
        this.deletedServers.push(delItem[0].SERVER_ID);
      }
      this.getView().getModel().refresh();
      // this.getView().getModel().setProperty('/serverCollection',servers);
    },
    onAdd: function(oEvent){
      let servers = this.getView().getModel().getProperty('/serverCollection');
      servers.push({PORT:22})
      this.getView().getModel().setProperty('/serverCollection',servers);
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
