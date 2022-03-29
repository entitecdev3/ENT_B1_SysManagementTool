sap.ui.define([
	"nvid/sample/controller/BaseController",
	"nvid/sample/dbapi/dbAPI",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/ui/core/Core",
	"sap/m/MessageBox"
], function(BaseController, dbAPI, MessageToast, Dialog, DialogType, Button, ButtonType, Core, MessageBox) {
	"use strict";

	return BaseController.extend("nvid.sample.controller.MainApp", {

		idleLogout: function() {
			var t;
			var that = this;
			window.onbeforeunload = function() {
				that.logOutApp();
			};

			window.onload = resetTimer;
			window.onmousemove = resetTimer;
			window.onmousedown = resetTimer; // catches touchscreen presses as well
			window.ontouchstart = resetTimer; // catches touchscreen swipes as well
			window.onclick = resetTimer; // catches touchpad clicks as well
			window.onkeypress = resetTimer;
			window.addEventListener('scroll', resetTimer, true); // improved; see comments

			function yourFunction() {
				// your function for too long inactivity goes here
				// e.g. window.location.href = 'logout.php';
				sap.m.MessageBox.alert(that.getResourceBundle().getText("Page1"));
				window.top.location.href = "/";
			}

			function resetTimer() {
				clearTimeout(t);
				t = setTimeout(yourFunction, 3600000); // time is in milliseconds
			}
		},
		onLogout: function() {
			this.logOutApp();
		},
		onInit: function() {
			this.idleLogout();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oResource = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oRouter = this.getOwnerComponent().getRouter();
			// this.oRouter.getRoute("app").attachMatched(this._onRouteMatched, this);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		_onRouteMatched: function(oEvent) {

		},

		onSubmit: function() {
			this.Login();
		},
		onForgetPassword: function() {
			var that = this;
			var otp;
			if (!this.oSubmitDialog) {
				this.oSubmitDialog = new Dialog({
					type: DialogType.Message,
					contentWidth: "250px",
					title: that.getResourceBundle().getText("ForgetPassword"),
					content: [
						new sap.m.Label({
							text: "Email",
							labelFor: "email"
						}),
						new sap.m.Input("email", {
							// width: "100%",
							placeholder: "E-mail",
							type: "Email",
							liveChange: function(sEvent) {
								var sText = sEvent.getParameter("value");
								var isValid =
									/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
									.test(sText);
								this.oSubmitDialog.getBeginButton().setEnabled(isValid);
							}.bind(this),
							submit: function() {
								that.oSubmitDialog.getBeginButton().firePress();
							}
						}),
						new sap.m.Label("labelOtp", {
							text: "OTP",
							labelFor: "otp",
							visible: false
						}),
						new sap.m.Input("otp", {
							placeholder: "OTP",
							type: "Number",
							visible: false
						}),
						new sap.m.Label("labelNewPassword", {
							text: "New Password",
							labelFor: "newPassword",
							visible: false
						}),
						new sap.m.Input("newPassword", {
							placeholder: "New Password",
							type: "Password",
							visible: false,
							// valueState:"None",
							liveChange: function(sEvent) {
								var cText = sEvent.getParameter("value");
								var nText = Core.byId("confirmPassword").getValue();
								var regularExpression = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
								if (!regularExpression.test(cText)) {
									sEvent.getSource().setValueState("Error");
									sEvent.getSource().setValueStateText(
										"Password must contain at least 8 characters,\n including Upper/lowercase,numbers,\n and special character");
								} else {
									sEvent.getSource().setValueState("None");
								}

								this.oSubmitDialog.getBeginButton().setEnabled(cText === nText);
							}.bind(this)
						}),
						new sap.m.Label("labelConfirmPassword", {
							text: "Confirm Password",
							labelFor: "confirmPassword",
							visible: false
						}),
						new sap.m.Input("confirmPassword", {
							// width: "100%",
							placeholder: "Confirm Password",
							type: "Password",
							visible: false,
							liveChange: function(sEvent) {
								var cText = sEvent.getParameter("value");
								var nText = Core.byId("newPassword").getValue();
								this.oSubmitDialog.getBeginButton().setEnabled(cText === nText);
								this.Fflag = 1;
								if (cText === nText) {
									sEvent.getSource().setValueState("Success");
								} else {
									sEvent.getSource().setValueState("Error");
									sEvent.getSource().setValueStateText("Password not match");
								}
							}.bind(this),
							submit: function() {
								//
								if (this.Fflag === 1) {
									that.oSubmitDialog.getBeginButton().firePress();
								}

							}
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Get OTP",
						enabled: false,
						press: function() {
							if (this.Fflag === 0) {
								MessageBox.error(that.getResourceBundle().getText("Page2"));


								return;
							}
							that.oSubmitDialog.getBeginButton().setEnabled(false);
							that.oSubmitDialog.setBusy(false);
							if (this.oSubmitDialog.getBeginButton().getText() === "Get OTP") {
								var username = Core.byId("email").getValue();
								// body = body ? body : bodyEn;
								var oPayload = {
									"username": username,
									"lang": navigator.language
								};
								$.ajax("/api/GetOTP", {
									type: 'POST', // http method
									contentType: "application/json",
									data: JSON.stringify(oPayload), // data to submit
									success: function(data, status, xhr) {
										that.oSubmitDialog.setBusy(false);
										otp = data.OTP;
										Core.byId("labelOtp").setVisible(true);
										Core.byId("otp").setVisible(true);
										Core.byId("labelNewPassword").setVisible(true);
										Core.byId("newPassword").setVisible(true);
										Core.byId("labelConfirmPassword").setVisible(true);
										Core.byId("confirmPassword").setVisible(true);
										Core.byId("email").setEnabled(false);
										that.oSubmitDialog.getBeginButton().setText("Submit");
										MessageToast.show(that.getResourceBundle().getText("Page3"));
									},
									error: function(jqXhr, textStatus, errorMessage) {
										MessageToast.show(errorMessage);
										that.oSubmitDialog.getBeginButton().setEnabled(true);
										that.oSubmitDialog.setBusy(false);
									}
								});
							} else {
								var uOtp = parseInt(Core.byId("otp").getValue());
								oPayload = {
									username: Core.byId("email").getValue(),
									password: Core.byId("confirmPassword").getValue()
								};
								if (otp === uOtp) {
									that.oSubmitDialog.setBusy(true);
									$.ajax("/api/ChangePassword", {
										type: 'POST', // http method
										contentType: "application/json",
										data: JSON.stringify(oPayload), // data to submit
										success: function(data, status, xhr) {
											that.oSubmitDialog.setBusy(false);
											Core.byId("otp").setValue();
											Core.byId("newPassword").setValue();
											Core.byId("confirmPassword").setValue();
											Core.byId("email").setEnabled(true);
											Core.byId("labelOtp").setVisible(false);
											Core.byId("otp").setVisible(false);
											Core.byId("labelNewPassword").setVisible(false);
											Core.byId("newPassword").setVisible(false);
											Core.byId("labelConfirmPassword").setVisible(false);
											Core.byId("confirmPassword").setVisible(false);
											that.oSubmitDialog.getBeginButton().setText("Get OTP");
											that.oSubmitDialog.close();
											MessageToast.show(that.getResourceBundle().getText("Page6"));
										},
										error: function(jqXhr, textStatus, errorMessage) {
											MessageToast.show(errorMessage);
											that.oSubmitDialog.getBeginButton().setEnabled(true);
											that.getView().setBusy(false);
										}
									});
								} else {
									Core.byId("otp").setValueState("Error");
									Core.byId("otp").focus();
									that.oSubmitDialog.getBeginButton().setEnabled(true);
									that.getView().setBusy(false);
								}
							}
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function() {
							that.oSubmitDialog.getBeginButton().setEnabled(true);
							Core.byId("otp").setValue();
							Core.byId("newPassword").setValue();
							Core.byId("confirmPassword").setValue();
							Core.byId("email").setEnabled(true);
							Core.byId("labelOtp").setVisible(false);
							Core.byId("otp").setVisible(false);
							Core.byId("labelNewPassword").setVisible(false);
							Core.byId("newPassword").setVisible(false);
							Core.byId("labelConfirmPassword").setVisible(false);
							Core.byId("confirmPassword").setVisible(false);
							that.oSubmitDialog.getBeginButton().setText("Get OTP");
							that.oSubmitDialog.close();
						}
					})
				});
			}
			this.oSubmitDialog.open();
		},

		// onLivePassword: function(oEvent) {

		// },
		Login: function() {
			var that = this;
			that.getView().byId("userid").setValueState('None');
			that.getView().byId("pwd").setValueState('None');
			var loginPayload = {
				"username": this.getView().byId("userid").getValue(),
				"password": this.getView().byId("pwd").getValue()
			};
				this.getView().setBusy(true);
			dbAPI.callMiddleWare("/login", "POST", loginPayload).then(function(oData) {
					that.getView().setBusy(false);
        	that.oRouter.navTo("Main");
      }).catch(function(oError) {
					MessageBox.error(oError);
        	that.getView().setBusy(false);
      });
			return;
			// that.oRouter.navTo("Main");
		// 	return;
		// 	this.getView().setBusy(true);
		// 	$.ajax('/api/Login', {
		// 		type: 'POST', // http method
		// 		contentType: "application/json",
		// 		data: JSON.stringify(loginPayload), // data to submit
		// 		success: function(data, status, xhr) {
		// 			that.getView().setBusy(false);
		// 			var isUser = false;
		// 			var isAdmin = false;
		// 			that.getView().getModel("local").setProperty("/AgentType", data.AgentType);
		// 			that.getView().getModel("local").setProperty("/UserName", data.userName);
		// 			sessionStorage.setItem("AgentType", data.AgentType);
		// 			sessionStorage.setItem("UserName", data.userName);
		// 			data.roles.forEach(function(item) {
		// 				if (item.indexOf("Admin") !== -1) {
		// 					that.getView().getModel("local").setProperty("/Role", "Admin");
		// 					isAdmin = true;
		// 					isUser = true;
		// 				} else if (item.indexOf("User") !== -1) {
		// 					isUser = true;
		// 				} else if (item.indexOf("PowerUser") !== -1) {
		// 					isUser = true;
		// 				}
		// 			});
		// 			sessionStorage.setItem("Code", data.code);
		// 			if (data.U_LastLogin === null || data.pwdChangeRequest) {
		// 				if (data.pwdChangeRequest) {
		// 					MessageBox.show(that.getResourceBundle().getText("Page4"));
		// 				}
		// 				var password, userId;
		// 				userId = data.code;
		// 				if (!this.oSubmitDialog) {
		// 					this.oSubmitDialog = new Dialog({
		// 						type: DialogType.Message,
		// 						contentWidth: "300px",
		// 						contentHeight:"auto",
		// 						title:  that.getResourceBundle().getText("changePasswordTitle"),
		// 						content: [
		// 							new sap.m.Label("labelNewPassword3", {
		// 								text: "Password",
		// 								labelFor: "newPassword",
		// 								visible: true
		// 							}),
		// 							new sap.m.Input("newPassword3", {
		// 								placeholder: "Password",
		// 								type: "Password",
		// 								visible: true,
		// 								liveChange: function(sEvent) {
		// 									var cText = sEvent.getParameter("value");
		// 									var regularExpression = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
		// 									if (!regularExpression.test(cText)) {
		// 										sEvent.getSource().setValueState("Error");
		// 										sEvent.getSource().setValueStateText(
		// 											"Password must contain at least 8 characters,\n including Upper/lowercase,numbers,\n and special character");
		// 									} else {
		// 										sEvent.getSource().setValueState("None");
		// 									}
		// 									var nText = Core.byId("confirmPassword3").getValue();
		// 									this.oSubmitDialog.getBeginButton().setEnabled(cText === nText);
		// 								}.bind(this)
		// 							}),
		// 							new sap.m.Label("labelConfirmPassword3", {
		// 								text: "Confirm Password",
		// 								labelFor: "confirmPassword",
		// 								visible: true
		// 							}),
		// 							new sap.m.Input("confirmPassword3", {
		// 								placeholder: "Confirm Password",
		// 								type: "Password",
		// 								visible: true,
		// 								liveChange: function(sEvent) {
		// 									var cText = sEvent.getParameter("value");
		// 									var nText = Core.byId("newPassword3").getValue();
		// 									var regularExpression = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
		// 									this.Nflag = 1;
		//
		// 									if (!regularExpression.test(cText)) {
		// 										sEvent.getSource().setValueState("Error");
		// 										this.Nflag = 0;
		// 										sEvent.getSource().setValueStateText(
		// 											"Password must contain at least 8 characters,\n including Upper/lowercase,numbers,\n and special character");
		// 									} else {
		// 										this.oSubmitDialog.getBeginButton().setEnabled(cText === nText);
		// 										sEvent.getSource().setValueState("None");
		// 									}
		// 									if (cText === nText) {
		// 										sEvent.getSource().setValueState("Success");
		// 									} else {
		// 										sEvent.getSource().setValueState("Error");
		// 									}
		// 								}.bind(this),
		// 								submit: function() {
		//
		// 									if (this.Nflag === 1) {
		// 										this.oSubmitDialog.getBeginButton().firePress();
		// 									}
		// 								}.bind(this)
		// 							})
		// 						],
		// 						beginButton: new Button({
		// 							type: ButtonType.Emphasized,
		// 							text: "Reset",
		// 							enabled: false,
		// 							press: function() {
		// 								if (this.Fflag === 0) {
		// 									MessageBox.error(
		// 										that.getResourceBundle().getText("Page2")
		// 									);
		// 									return;
		// 								}
		// 								var nText = Core.byId("newPassword3").getValue();
		// 								password = Core.byId("confirmPassword3").getValue();
		// 								if (password === "" || password === null || nText !== password) {
		// 									MessageToast.show(that.resourceBundle.getText("EnterPassword"));
		//
		// 									return;
		// 								}
		// 								this.oSubmitDialog.setBusy(true);
		// 								userAPI.changePassword(userId, password, this).then(function() {
		// 									MessageToast.show(that.resourceBundle.getText("Success"));
		// 									if (isAdmin) {
		// 										sessionStorage.setItem("Role", "Admin");
		// 										that.oRouter.navTo("Users");
		// 									} else if (isUser) {
		// 										sessionStorage.setItem("Role", "User");
		// 										that.oRouter.navTo("UserHome");
		// 									} else {
		// 										sap.m.MessageBox.error(that.resourceBundle.getText("NoRole"));
		// 									}
		// 									userAPI.updateUser(data.code, {
		// 										"U_LastLogin": new Date()
		// 									}, this);
		// 									Core.byId("newPassword").setValue();
		// 									Core.byId("confirmPassword").setValue();
		// 									that.oSubmitDialog.close();
		// 								}).catch(function(oError) {
		// 									that.oSubmitDialog.setBusy(false);
		// 									MessageToast.show(oError);
		// 								});
		// 							}.bind(this)
		// 						}),
		// 						endButton: new Button({
		// 							text: "Cancel",
		// 							press: function() {
		// 								this.oSubmitDialog.close();
		// 							}.bind(this)
		// 						})
		// 					});
		// 				}
		// 				this.oSubmitDialog.open();
		// 			} else {
		// 				if (isAdmin) {
		// 					sessionStorage.setItem("Role", "Admin");
		// 					that.oRouter.navTo("UserHome");
		// 				} else if (isUser) {
		// 					sessionStorage.setItem("Role", "User");
		// 					that.oRouter.navTo("UserHome");
		// 				} else {
		// 					sap.m.MessageBox.error(that.resourceBundle.getText("NoRole"));
		// 				}
		// 			}
		// 			that.getView().setBusy(false);
		// 		},
		// 		error: function(jqXhr, textStatus, errorMessage) {
		// 			that.getView().setBusy(false);
		// 			if (jqXhr.responseText.indexOf("Email") !== -1) {
		// 				that.getView().byId("userid").setValueState('Error');
		// 				that.getView().byId("userid").focus();
		// 			} else if (jqXhr.responseText.indexOf("Password") !== -1) {
		// 				that.getView().byId("userid").setValueState('Success');
		// 				that.getView().byId("pwd").setValueState('Error');
		// 				that.getView().byId("pwd").focus();
		// 			} else if (jqXhr.responseText.indexOf("Employee") !== -1) {
		// 				that.getView().byId("userid").focus();
		// 				sap.m.MessageBox.error(jqXhr.responseText);
		// 			} else if (jqXhr.responseText.indexOf("Blocked") !== -1) {
		// 				that.getView().byId("userid").setValueState('None');
		// 				that.getView().byId("pwd").setValueState('None');
		// 				sap.m.MessageBox.error(that.getResourceBundle().getText("Page5"));
		// 			} else {
		// 				that.getView().byId("userid").focus();
		// 				sap.m.MessageBox.error(jqXhr.responseText);
		// 			}
		// 		}
		// 	});
		}

	});

});
