/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    "use strict";

    var userName = '';
    var userPassword = '';
    var DOMAIN = '';
    var id = '';
    var fullPath = '';
    var docPath = '';
    var encoded = '';
    var jsFiles = [];
    var myFile = '';
    var fileList = [];
    var allFiles = [];
    var uniqueFiles = [];
    var alreadyFound = false;

    // setup preferences
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        prefs = PreferencesManager.getExtensionPrefs("myextensionname");

    prefs.definePreference("username", "string", "username");
    prefs.definePreference("password", "string", "password");
    prefs.definePreference("domain", "string", "https://exmaple.kintone.com", {
        description: "change 'example' to your subdomain"
    });
    prefs.definePreference("appID", "number", "120");

    prefs.on("change", function () {
        userName = prefs.get("username");
        userPassword = prefs.get("password");
        DOMAIN = prefs.get("domain");
        id = prefs.get("appID");
    });

    var CommandManager = brackets.getModule("command/CommandManager"),
        Menus = brackets.getModule("command/Menus");

    function resetValues() {
        jsFiles = [];
        myFile = '';
        fileList = [];
        allFiles = [];
        uniqueFiles = [];
        alreadyFound = false;
    }
    
    function sleep(milliseconds) {
       var start = new Date().getTime();
       for (var i = 0; i < 1e7; i++) {
           if ((new Date().getTime() - start) > milliseconds){
               break;
           }
       }
   }

    // Function to run when the menu item is clicked
    function handleSendKTFile() {
        resetValues();
        var DocumentManager = brackets.getModule('document/DocumentManager');
        fullPath = DocumentManager.getCurrentDocument()['file']['_path'];
        docPath = fullPath.substring(fullPath.lastIndexOf("/") + 1);

        var FileSystem = brackets.getModule('filesystem/FileSystem');
        var FileUtils = brackets.getModule('file/FileUtils');

        var file = FileSystem.getFileForPath(fullPath);
        var promise = FileUtils.readAsText(file); // completes asynchronously
        promise.done(function (resp) {
                myFile = resp;
            })
            .fail(function (errorCode) {
                console.log("Error: " + errorCode); // one of the FileSystemError constants
            });

        getLoginInfo();
        window.alert("Sending file to kintone . . .");
    }

    function getLoginInfo() {
        var params = "?app=" + id;

        var BASE_URL = DOMAIN + "/k/v1/"

        // needs base64 encoding
        encoded = window.btoa(userName + ":" + userPassword);
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", BASE_URL + "/preview/app/customize.json" + params);
        xhttp.setRequestHeader("X-Cybozu-Authorization", encoded);
        xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhttp.onload = function () {
            if (xhttp.status === 200) {
                // success
                console.log("success");
                var obj = JSON.parse(xhttp.responseText);
                searchJS(obj);
            } else {
                // error
                alert("An error occured! " + JSON.parse(xhttp.responseText));
                console.log(JSON.parse(xhttp.responseText));
            }
        };
        xhttp.send();
        deployChange();
    }

    function searchJS(obj) {
        fileList = obj['desktop']['js'];
        var key;
        for (var i = 0; i < fileList.length; i++) {
            if (fileList[i]['type'] === 'FILE') {
                jsFiles[i] = fileList[i]['file']['name'];
                if (jsFiles[i] === docPath) {
                    alreadyFound = true;
                    console.log("Found file to replace!");
                    uploadFile(fullPath, 0, true);
                } else {
                    key = fileList[i]['file']['fileKey'];
                    allFiles.push({
                        'type': fileList[i]['type'],
                        'file': {
                            'name': fileList[i]['file']['name'],
                            'fileKey': key
                        }
                    });
                    uploadFile(jsFiles[i], key, false);
                }
            }
            if (!alreadyFound) {
                uploadFile(fullPath, 0, true);
            }
        }
    }

    function uploadFile(file, key, reuse) {
        var key;

        if (reuse) {
            var blob = new Blob([myFile], {
                type: "text/javascript"
            });
            var formData = new FormData();
            formData.append("file", blob, file);

            var BASE_URL = DOMAIN + "/k/v1/"

            var url = BASE_URL + '/file.json'
            var xhttp = new XMLHttpRequest();
            xhttp.open('POST', url);
            xhttp.setRequestHeader("X-Cybozu-Authorization", encoded);
            xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhttp.onload = function () {
                if (xhttp.status === 200) {
                    // success
                    var obj = JSON.parse(xhttp.responseText);
                    key = obj['fileKey'];
                    if (allFiles[allFiles.length - 1]['file']['name'] === docPath) {
                        allFiles.pop();
                    }
                    allFiles.push({
                        'type': 'FILE',
                        'file': {
                            'name': docPath,
                            'fileKey': key
                        }
                    });
                    sendFile(file, key)
                } else {
                    // error
                    console.log(JSON.parse(xhttp.responseText));
                }
            };
            xhttp.send(formData);
        } else {
            sendFile(file, key);
        }
    }

    function sendFile(file, key) {
        console.log(allFiles);
        var body = {
            "app": id,
            "scope": "ALL",
            "desktop": {
                "js": allFiles
            }
        };
        console.log(body);

        var BASE_URL = DOMAIN + "/k/v1/";

        var xhttp = new XMLHttpRequest();
        xhttp.open("PUT", BASE_URL + "/preview/app/customize.json");
        xhttp.setRequestHeader("X-Cybozu-Authorization", encoded);
        xhttp.setRequestHeader("Content-Type", 'application/json');
        xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhttp.onload = function () {
            if (xhttp.status === 200) {
                // success
                var obj = JSON.parse(xhttp.responseText);
                alert("File has been uploaded!");
            } else {
                // error
                alert("An error occured! " + JSON.parse(xhttp.responseText));
                console.log(JSON.parse(xhttp.responseText));
            }
        };
        xhttp.send(JSON.stringify(body));
    }

    function deployChange() {
        var BASE_URL = DOMAIN + "/k/v1";
        var body = {
            "apps": [
                {
                    "app": id,
                }
            ],
        };
        var xhttp = new XMLHttpRequest();
        xhttp.open('POST', BASE_URL + "/preview/app/deploy.json");
        xhttp.setRequestHeader("X-Cybozu-Authorization", encoded);
        xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.onload = function () {
            if (xhttp.status === 200) {
                // success
                window.alert(JSON.parse(xhttp.responseText));
            } else {
                // error
                console.log(JSON.parse(xhttp.responseText));
            }
        };
        xhttp.send(JSON.stringify(body));
    }

    var SEND_COMMAND = "sendktfile.sendfile";
    CommandManager.register("Send KT", SEND_COMMAND, handleSendKTFile);

    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuItem(SEND_COMMAND, "Ctrl-Shift-K");

});
