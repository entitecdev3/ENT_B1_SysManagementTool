sap.ui.define([
  "nvid/sample/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "nvid/sample/util/formatter"
], function(BaseController, JSONModel, Formatter) {
  "use strict";

  return BaseController.extend("nvid.sample.controller.Confiuraton", {
    formatter: Formatter,
    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf nvid.sample.view.View1
     */
    onInit: function() {
      this.oRouter = this.getOwnerComponent().getRouter();
      var that = this;
      that.loadConfig();
      this.loadConfigStatus();
      this.loadUsers();
      that._localModel = this.getOwnerComponent().getModel("local");
    },
    onActionPress: function(oEvent) {
      this.oRouter.navTo(oEvent.getSource().getSelectedItem().getId().split("--")[oEvent.getSource().getSelectedItem().getId().split("--").length - 1]);
    },
    onNavBack: function(){
      this.oRouter.navTo("Main");
    },
    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf nvid.sample.view.View1
     */
    //	onBeforeRendering: function() {
    //
    //	},

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf nvid.sample.view.View1
     */
    //	onAfterRendering: function() {
    //
    //	},

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf nvid.sample.view.View1
     */
    //	onExit: function() {
    //
    //	}

  });

});
