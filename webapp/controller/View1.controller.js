sap.ui.define([
  "nvid/sample/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "nvid/sample/util/formatter"
], function(BaseController, JSONModel, Formatter) {
  "use strict";

  return BaseController.extend("nvid.sample.controller.View1", {
    formatter: Formatter,
    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf nvid.sample.view.View1
     */
    onInit: function() {
      this.oRouter = this.getOwnerComponent().getRouter();
      var that = this;
      that._localModel = this.getOwnerComponent().getModel("local");
      this.loadJobs();
      this.loadCompaniesList();
    },
    onItemSelect: function(oEvent) {
      var oSelectedItem = oEvent.getParameter("listItem");
      var sTitle = oSelectedItem.getTitle();
      this.onNext(sTitle);
    },
    oRouter: null,
    onSelectChange: function(oEvent) {
      var oList = oEvent.getSource();
      var sPath = oList.getSelectedItem().getBindingContextPath();
      var sIndex = sPath.split("/")[sPath.split("/").length - 1];
      this.onNext(sIndex);
    },
    onSearch: function(oEvent) {
      var sSearchValue = oEvent.getParameter("newValue"),
        oList = this.getView().byId("idList"),
        dFilter = [new sap.ui.model.Filter("STATUS", sap.ui.model.FilterOperator.NE, 'D')];
      if (sSearchValue) {
        //Step 2: prepare a filter object - 2 operands and 1 operator
        var oFilter = new sap.ui.model.Filter("JOB_NAME", sap.ui.model.FilterOperator.Contains, sSearchValue);
        var oFilter2 = new sap.ui.model.Filter("JOB_TYPE", sap.ui.model.FilterOperator.Contains, sSearchValue);
				var oFilter3 = new sap.ui.model.Filter("BASE_SCHEMA", sap.ui.model.FilterOperator.Contains, sSearchValue);
        var aFilter = [oFilter, oFilter2, oFilter3];
        var oFilterFinal = new sap.ui.model.Filter({
        	filters: aFilter,
        	and: false
        });
				dFilter.push(oFilterFinal);
      }
      oList.getBinding("items").filter(dFilter);
      //step 4: Inject the filter into the binding of list
    },
    onCreateJob: function() {
      this.getView().byId("idList").removeSelections();
      this.oRouter.navTo("Jobs");
    },
    onNavBack: function(){
      this.getView().byId("idList").removeSelections();
      this.oRouter.navTo("Main");
    },
    onNext: function(sIndex) {
      // WHO IS RESPONSIBLE FOR NAVIGATION
      this.oRouter.navTo("detail", {
        navya: sIndex
      });
    }
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
