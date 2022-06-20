sap.ui.define([
  "nvid/sample/controller/BaseController",
  "nvid/sample/dbapi/dbAPI",
  'sap/base/util/deepExtend',
  "sap/ui/model/json/JSONModel",
  'sap/m/ColumnListItem',
	'sap/m/Input',
  "sap/m/MessageToast"
], function(BaseController, dbAPI, ColumnListItem, Input, deepExtend, JSONModel, MessageToast) {
  "use strict";

  return BaseController.extend("nvid.sample.controller.Security", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf nvid.sample.view.Empty
     */
    	onInit: function() {
        var that=this;
        this.oModel=this.getOwnerComponent().getModel("local");
        this.oTable = this.byId("idUsersTable");
  			this.oReadOnlyTemplate = this.byId("idUsersTable").removeItem(0);
  			this.oEditableTemplate = new ColumnListItem({
  				cells: [
            new Input({
  						value: "{local>USERNAME}"
  					}), new Input({
              type: "Password",
  						value: "{local>PASSWORD}"
  					})
  				]
  			});
        that.rebindTable(that.oReadOnlyTemplate, "Navigation");
        // that.getView().setBusy(true);
        // dbAPI.callMiddleWare("/users", "GET").then(function(oData) {
        //   that.oModel = new JSONModel({users:oData});
        //   that.getView().setModel(that.oModel);
        //   that.rebindTable(that.oReadOnlyTemplate, "Navigation");
  			// 	that.getView().setBusy(false);
        // }).catch(function(oError) {
        //   dbAPI.errorHandler(oError, that);
        // });
    	},
      rebindTable: function(oTemplate, sKeyboardMode) {
			this.oTable.bindItems({
				path: "local>/users",
				template: oTemplate,
				templateShareable: true,
				key: "USER_ID"
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
      var payload = this.getView().getModel("local").getProperty("/config/security");
      dbAPI.callMiddleWare("/security", "POST", payload).then(function(oData) {
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
			// this.aProductCollection = deepExtend([], this.oModel.getProperty("/users"));
			this.byId("editButton").setVisible(false);
      this.byId("addButton").setVisible(true);
			this.byId("saveButton").setVisible(true);
			this.byId("cancelButton").setVisible(true);
      this.oTable.setMode('Delete');
      // this.rebindTable(this.oEditableTemplate, "Edit");
		},

		onSave: function() {
			this.byId("saveButton").setVisible(false);
      this.byId("addButton").setVisible(false);
			this.byId("cancelButton").setVisible(false);
			this.byId("editButton").setVisible(true);
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
      this.oTable.setMode('None');
		},

		onCancel: function() {
      var that=this;
			this.byId("cancelButton").setVisible(false);
      this.byId("addButton").setVisible(false);
			this.byId("saveButton").setVisible(false);
			this.byId("editButton").setVisible(true);
			// this.oModel.setProperty("/ProductCollection", this.aProductCollection);
			// this.rebindTable(this.oReadOnlyTemplate, "Navigation");
      this.oTable.setMode('None');
      that.getView().setBusy(true);
      dbAPI.callMiddleWare("/users", "GET").then(function(oData) {
        // that.oModel = new JSONModel({serverCollection:oData});
        // that.getView().setModel(that.oModel);
        that.getView().getModel("local").setProperty("/users", oData);
        that.rebindTable(that.oReadOnlyTemplate, "Navigation");
        that.getView().setBusy(false);
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
		},
    onDelete: function(oEvent){
      let sPath = oEvent.getParameter('listItem').getBindingContextPath();
      if(this.getView().getModel('local').getProperty(sPath).USERNAME==='B1SiteUser'){
        MessageToast.show("It's a system user, can't be deleted")
        return;
      }
      this.getView().getModel().getProperty('/serverCollection').splice(parseInt(sPath.split('/')[2]),1);
      this.getView().getModel().refresh();
      // this.getView().getModel().setProperty('/serverCollection',servers);
    },
    onAdd: function(oEvent){
      let users = this.getView().getModel('local').getProperty('/users');
      users.push({})
      this.getView().getModel('local').setProperty('/users',users);
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
