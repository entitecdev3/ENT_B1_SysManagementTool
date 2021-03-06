//The method callCRUD will be used to communicate to the backend returns the JS promise
//You can use the jQuery ajax or some other framework dependency to make REST Call
var pendingRequests = {};
sap.ui.define([
  "jquery.sap.global",
  "sap/m/MessageBox",
  "nvid/sample/controller/BaseController"
], function(jQuery, MessageBox, BaseController) {
  "use strict";

  return {
    callMiddleWare: function(sUrl, sMethod, oPayload = {}, asyncBol = true) {
      return new Promise(function(resolve, reject) {
        // asyncBol = asyncBol ? asyncBol : true;
        var currentDate = new Date();
        //prefilter for ajax to cancel the duplicate calls
        // $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        // 	//


        // });

        if (!(sUrl && sMethod)) {
          reject("Invalid parameters passed");
        }
        switch (sMethod.toUpperCase()) {
          case "GET":
            $.ajax("/api" + sUrl, {
              async: asyncBol,
              type: 'GET', // http method
              contentType: "application/json",
              timeout: 300000,
              // data: JSON.stringify(oPayload), // data to submit
              success: function(data, status, xhr) {
                resolve(data);
              },
              //everytime time call goes it first came to before Send Method
              // beforeSend: function (jqXHR, options) { //
              // 	// var key = options.url;
              // 	// if (!pendingRequests[key]) {
              // 	// 	pendingRequests[key] = jqXHR;
              // 	// } else {
              // 	// 	jqXHR.abort();
              // 	// 	// pendingRequests[key].abort(); // abort the first triggered submission
              // 	// }
              // 	// var complete = options.complete;
              // 	// options.complete = function (jqXHR, textStatus) {
              // 	// 	pendingRequests[key] = null;
              // 	// 	if (jQuery.isFunction(complete)) {
              // 	// 		complete.apply(this, arguments);
              // 	// 	}
              // 	// }
              // },
              // complete: function() {
              // 	$(this).data('requestRunning', false);
              // },
              error: function(jqXhr, textStatus, errorMessage) {
                reject(jqXhr.responseText || errorMessage);
              }
            });

            break;
          case "POST":
            $.ajax("/api" + sUrl, {
              type: 'POST', // http method
              contentType: "application/json",
              data: JSON.stringify(oPayload), // data to submit
              success: function(data, status, xhr) {
                resolve(data);
              },
              error: function(jqXhr, textStatus, errorMessage) {
                reject(jqXhr.responseText || errorMessage);
              }
            });

            break;
          case "POST_A":
            $.ajax("/api" + sUrl, {
              type: 'POST', // http method
              contentType: "multipart/form-data; boundary=AttachmentBoundary",
              data: oPayload, // data to submit
              success: function(data, status, xhr) {
                resolve(data);
              },
              error: function(jqXhr, textStatus, errorMessage) {
                reject(jqXhr.responseText || errorMessage);
              }
            });

            break;
          case "PUT":
            $.ajax("/api" + sUrl, {
              type: 'PUT', // http method
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              contentType: "application/json",
              data: JSON.stringify(oPayload), // data to submit
              success: function(data, status, xhr) {
                resolve(data);
              },
              error: function(jqXhr, textStatus, errorMessage) {
                reject(jqXhr.responseText || errorMessage);
              }
            });

            break;
          case "PATCH":
            $.ajax("/api" + sUrl, {
              type: 'PATCH', // http method
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              contentType: "application/json",
              data: JSON.stringify(oPayload), // data to submit
              success: function(data, status, xhr) {
                resolve(data);
              },
              error: function(jqXhr, textStatus, errorMessage) {
                reject(jqXhr.responseText || errorMessage);
              }
            });

            break;
          case "DELETE":
            $.ajax("/api" + sUrl, {
              type: 'DELETE', // http method
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              success: function(data, status, xhr) {
                resolve(data);
              },
              error: function(jqXhr, textStatus, errorMessage) {
                reject(jqXhr.responseText || errorMessage);
              }
            });

            break;
          default:
            jQuery.sap.log.error("No case matched");
            break;
        }
      });
    },
    errorHandler: function(jqr, then) {
      then.getView().setBusy(false);
      // if (jqr === "abort") {
      // 	return;
      // }
      // var that = this;
      var type = typeof(jqr);
      switch (type) {
        case 'string':
          try {
            const text = JSON.parse(JSON.parse(jqr).text).error.message;
            if (text.value) {
              MessageBox.error(text.value);
            } else {
              MessageBox.error(text);
            }

          } catch (error) {
            if (jqr.includes('Session expired.') || jqr.includes('authenticated')) {
              sessionStorage.session_id = null;
              var oMessage = jqr;
              MessageBox.error(oMessage, {
                actions: [MessageBox.Action.OK],
                onClose: function() {

                  window.location.href = "/ui/index.html";
                }
              });
            } else if (jqr.includes('User Not Found')) {
              var oEmail = jqr.split(":")[1];
              var oMessage = then.getModel("i18n").getProperty("notFoundUser");
              // oMessage=oMessage.replace('"', '');
              // var oEmail=then.getModel("appView").getProperty("/User");
              oMessage = oMessage.replace("<login-email>", oEmail)
              MessageBox.error(oMessage);
            } else {
              MessageBox.error(jqr);
            }
          }

          break;
        case 'object':
          if (jqr.responseText) {
            MessageBox.error(jqr.responseText);
            break;
          }
          MessageBox.error(jqr.toString());
          break;
        default:
          MessageBox.error(jqr.toString());
          break;
      }
    },
    onTimeZone: function(d) {
      if (d.getTimezoneOffset() > 0) {
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      } else {
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      }
      return d;
    },
    oDataV2Date: function(jsonDate) {
      var offset = new Date().getTimezoneOffset();
      var parts = /\/Date\((-?\d+)([+-]\d{2})?(\d{2})?.*/.exec(jsonDate);
      if (parts[1]) {

        if (parts[1].length > 1) {
          var oDate = new Date(+parts[1]);
          //commented due to the date is converted in GMT by this, not in locale
          //don't not use for locale date format
          //only use while posting, because it automatically converted into server locale
          // if (oDate.getTimezoneOffset() > 0) {
          // 	oDate.setMinutes(oDate.getMinutes() - oDate.getTimezoneOffset());
          // } else {
          // 	oDate.setMinutes(oDate.getMinutes() + oDate.getTimezoneOffset());
          // }
          return oDate;
        } else {
          return null;
        }

      }
    },
    batchPayloadGenerator: function(sUrl, sMethod, oPayload, oKey) {
      // sMethod="POST","PATCH","DELETE","PUT"
      if (!oPayload) {
        return [];
      }
      if (oPayload.length === 0) {
        return [];
      }
      var aPayload = [];
      var oIndex = 0;
      var oResPay = {
        "method": sMethod,
        "atomicityGroup": "",
        "url": sUrl,
        "headers": {
          "content-type": "application/json; odata.metadata=minimal; odata.streaming=true",
          "odata-version": "4.0"
        },
        "id": "",
        "body": null
      };
      for (let i = 0; i < oPayload.length; i++) {
        var oRes = JSON.parse(JSON.stringify(oResPay));
        if (sMethod !== "POST") {
          var oObj = oPayload[i]
          for (const key in oObj) {
            if (key == oKey) {
              oRes.url = oRes.url + "(" + oObj[key] + ")";
              break;
            }
          }
        }
        oIndex++;
        oRes.atomicityGroup = "g" + oIndex;
        oRes.id = "g" + oIndex + "-r1"
        oRes.body = oPayload[i];
        aPayload.push(oRes);
      }
      return aPayload;
    },
  };
});
