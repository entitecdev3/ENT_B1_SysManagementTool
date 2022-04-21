sap.ui.define([
	"nvid/sample/controller/BaseController",
	"nvid/sample/model/formatter",
	"sap/m/GenericTile",
	"sap/m/TileContent",
	"sap/m/NumericContent",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, formatter, GenericTile, TileContent, NumericContent, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("nvid.sample.controller.Main", {
		formatter: formatter,
		onInit: function onInit() {
			this.getOwnerComponent().getRouter().getRoute("Main").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function _onRouteMatched(oEvent) {
			this.getView().getModel("local").setProperty("/Date", {
				"START_ON": new Date(),
				"END_ON": new Date()
			});
		},
		press: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo(oEvent.getSource().getId().split("--")[oEvent.getSource().getId().split("--").length - 1]);
		}
	});
});
