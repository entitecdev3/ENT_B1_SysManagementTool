sap.ui.define([
  "nvid/sample/controller/BaseController",
  "nvid/sample/dbapi/dbAPI",
  "sap/m/MessageToast"
], function(BaseController, dbAPI, MessageToast) {
  "use strict";

  return BaseController.extend("nvid.sample.controller.SLConfig", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf nvid.sample.view.Empty
     */
    	onInit: function() {
        var that = this;
    	},
      handleEditPress : function () {

			//Clone the data
			// this._oSupplier = Object.assign({}, this.getView().getModel().getData().SupplierCollection[0]);
			this._toggleButtonsAndView(true);

		},
    handleCancelPress : function () {
			//Restore the data
      this.loadConfig();
			this._toggleButtonsAndView(false);
		},
    handleSavePress : function () {
      var that = this;
      var payload = this.getView().getModel("local").getProperty("/config/b1-sl-config");
      dbAPI.callMiddleWare("/b1SLConfig", "POST", payload).then(function(oData) {
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
    onFetchUrl: function(){
      var that = this;
      that.getView().setBusy(true);
      dbAPI.callMiddleWare("/b1sUrl", "GET").then(function(oData) {
        that.getView().byId("b1sUrl").setValue(oData.SLD_AccessURL);
        that.getView().setBusy(false);
        MessageToast.show("Synced")
      }).catch(function(oError) {
        dbAPI.errorHandler(oError, that);
      });
    },
    onTestPress: function(oEvent){
      var that=this;
      that.testBtn = oEvent.getSource();
      that.getView().setBusy(true);
      dbAPI.callMiddleWare("/testServiceLayer", "GET").then(function(oData) {
        that.testBtn.setIcon("sap-icon://message-success").setType("Accept").setText("Success");
        that.getView().setBusy(false);
        MessageToast.show("Synced")
      }).catch(function(oError) {
        that.testBtn.setIcon("sap-icon://message-error").setType("Reject").setText("Error");
        dbAPI.errorHandler(oError, that);
      });
      setTimeout(function(){
        that.testBtn.setIcon("sap-icon://synchronize").setType("Emphasized").setText("Test");
      },30000);
    },
    onEditTestPress: function(oEvent){
      var that=this;
      that.testBtn = oEvent.getSource();
      var payload = this.getView().getModel("local").getProperty("/config/b1-sl-config");
      that.getView().setBusy(true);
      dbAPI.callMiddleWare("/validateServiceLayer", "POST", payload).then(function(oData) {
        that.testBtn.setIcon("sap-icon://message-success").setType("Accept").setText("Success");
        that.getView().setBusy(false);
        MessageToast.show("Synced")
      }).catch(function(oError) {
        that.testBtn.setIcon("sap-icon://message-error").setType("Reject").setText("Error");
        dbAPI.errorHandler(oError, that);
      });
      setTimeout(function(){
        that.testBtn.setIcon("sap-icon://synchronize").setType("Emphasized").setText("Validate");
      },30000);
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
