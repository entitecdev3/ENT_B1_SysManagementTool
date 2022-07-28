sap.ui.define([
	"sap/ui/core/format/NumberFormat"
], function(NumberFormat) {
	"use strict";

	var formatter = {

		generatePass: function() {
			var result = '';
			var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
			var charactersLength = characters.length;
			for (var i = 0; i < 8; i++) {
				result += characters.charAt(Math.floor(Math.random() * charactersLength));
			}
			return result;
		},
		getStatus: function(status){
			return status ? status==='Online' ? "Online" : status==='Offline' ? "Offline" : "Warning" : "Loading..."
			// actual=false or formal=false then "Warning"
		},
		getState: function(status){
			return status==='Online' ? "Success" : status==='Offline' ? "Error" : "Warning"
			// actual=false or formal=false then "Warning"
		},
		getStatusIcon: function(status){
			return status ? status==='Online' ? "sap-icon://circle-task-2" : status==='Offline' ? "sap-icon://appear-offline" : "sap-icon://message-warning" : "sap-icon://lateness"
			// actual=false or formal=false then "Warning"
		},
		formatNumberToLocale: function(num) {
			var oCurrencyFormat = NumberFormat.getCurrencyInstance({
				currencyCode: false
			});
			return Boolean(parseFloat(num.toFixed(2))) ? oCurrencyFormat.format(num) : 0;
		},
		formatNumberToLocaleForKPI: function(num) {
			var oCurrencyFormat = NumberFormat.getCurrencyInstance({
				currencyCode: false
			});
			return Boolean(parseFloat(num)) ? oCurrencyFormat.format(num) : 0;
		},
		appendLeadingZeroes: function(n) {
			if (n <= 9) {
				return "0" + n;
			}
			return n;
		},
		uuidv4: function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0,
					v = c === "x" ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},

		titleCase: function(str) {
			if (str) {
				return str.toLowerCase().split(' ').map(function(word) {
					return (word.charAt(0).toUpperCase() + word.slice(1));
				}).join(' ');
			}
			return "........";
		},
		getFormattedDate: function(monthInc) {
			var dateObj = new Date();
			dateObj.setDate(dateObj.getDate());
			var dd = dateObj.getDate();
			dateObj.setMonth(dateObj.getMonth() + monthInc);
			var mm = dateObj.getMonth() + 1;
			var yyyy = dateObj.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm;
			}
			return dd + '.' + mm + '.' + yyyy;
		},
		getDateDDMMYYYYFormat: function(date) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd.mm.yyyy"
			});

			var oNow = new Date(date);
			return oDateFormat.format(oNow); //string in the same format as "Thu, Jan 29, 2017"
		},
		getFormatedDate: function(date){
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd HH:mm:ss"
			});
			var oNow = new Date(date);
			return oDateFormat.format(oNow); //string in the same format as "Thu, Jan 29, 2017"
		},
		getFormatedAppName: function(val){
				if(val.includes('ServiceLayer')){
					return 'Service Layer';
				}else if(val.includes('HDBStudio')){
					return 'HANA Studio';
				}else{
					return val;
				}
		},
		checkEmail: function(oInput) {
			if (oInput) {
				var email = oInput.getValue();
				var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
				if (!email.match(mailregex)) {
					//alert("Invalid Email");
					oInput.setValueState("Error");
					return false;
				} else {
					oInput.setValueState("None");
					return true;
				}
			}
		}
	};

	return formatter;
});
