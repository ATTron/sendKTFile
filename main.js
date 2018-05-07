define(function (require, exports, module) {
    "use strict";

    // global vars
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
    var URLs = [];
    var CSS = [];
    var alreadyFound = false;

    // setup preferences
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        prefs = PreferencesManager.getExtensionPrefs("sendKTFile");

    prefs.definePreference("username", "string", "username");
    prefs.definePreference("password", "string", "password");
    prefs.definePreference("domain", "string", "https://example.kintone.com", {
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
        URLs = [];
        CSS = [];
        alreadyFound = false;
    }

    function handleSendKTFile() {
        resetValues();
        var DocumentManager = brackets.getModule('document/DocumentManager');
        fullPath = DocumentManager.getCurrentDocument()['file']['_path'];
        docPath = fullPath.substring(fullPath.lastIndexOf("/") + 1);

        var FileSystem = brackets.getModule('filesystem/FileSystem');
        var FileUtils = brackets.getModule('file/FileUtils');

        var file = FileSystem.getFileForPath(fullPath);
        var promise = FileUtils.readAsText(file);
        promise.done(function (resp) {
                myFile = resp;
            })
            .fail(function (errorCode) {
                console.log("Error: " + errorCode);
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
        xhttp.open("GET", BASE_URL + "preview/app/customize.json" + params);
        xhttp.setRequestHeader("X-Cybozu-Authorization", encoded);
        xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhttp.onload = function () {
            if (xhttp.status === 200) {
                // success
                console.log("success");
                var obj = JSON.parse(xhttp.responseText);
                console.log(obj);
                searchJS(obj);
            } else {
                // error
                alert("An error occured! " + JSON.parse(xhttp.responseText));
                console.log(JSON.parse(xhttp.responseText));
            }
        };
        xhttp.send();
    }

    function searchJS(obj) {
        // get js
        fileList = obj['desktop']['js'];
        var key;
        for (var i = 0; i < fileList.length; i++) {
            if (fileList[i]['type'] === 'FILE') {
                jsFiles[i] = fileList[i]['file']['name'];
                key = fileList[i]['file']['fileKey'];
                allFiles.push({
                    'type': fileList[i]['type'],
                    'file': {
                        'name': fileList[i]['file']['name'],
                        'fileKey': key
                    }
                });
                if (jsFiles[i] === docPath) {
                    alreadyFound = true;
                    console.log("Found file to replace!");
                    uploadFile(fullPath, 0, true);
                    continue;
                } else {
                    uploadFile(jsFiles[i], key, false);
                }

                if (!alreadyFound) {
                    uploadFile(fullPath, 0, true);
                }
            } else if (fileList[i]['type'] === 'URL') {
                var url = fileList[i]['url'];
                URLs.push({
                    'type': fileList[i]['type'],
                    'url': url
                });
            }
        }
        
        // get css
        var cssList = obj['desktop']['css'];
        for (var i = 0; i < cssList.length; i++) {
            CSS.push({
                'type': cssList[i]['type'],
                'file': {
                    'name': cssList[i]['file']['name'],
                    'fileKey': cssList[i]['file']['fileKey']
                }
            });
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

            var url = BASE_URL + 'file.json'
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
                    console.log("File has been uploaded!");
                } else {
                    // error
                    console.log(JSON.parse(xhttp.responseText));
                }
            };
            xhttp.send(formData);
        } else {}

    }


    function filterFiles(myArr) {
        return myArr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj['file']['name']).lastIndexOf(obj['file']['name']) === pos;
        });
    }

    function sendFile() {
        var urlFiles = URLs;
        var unique = filterFiles(allFiles);
        var combined = urlFiles.concat(unique);
        var body = {
            "app": id,
            "scope": "ALL",
            "desktop": {
                "js": combined,
                "css": CSS
            }
        };
        console.log(body);

        var BASE_URL = DOMAIN + "/k/v1/";

        var xhttp = new XMLHttpRequest();
        xhttp.open("PUT", BASE_URL + "preview/app/customize.json");
        xhttp.setRequestHeader("X-Cybozu-Authorization", encoded);
        xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhttp.setRequestHeader("Content-Type", 'application/json');
        xhttp.onload = function () {
            if (xhttp.status === 200) {
                // success
                var obj = JSON.parse(xhttp.responseText);
                console.log(obj);
            } else {
                // error
                console.log(JSON.parse(xhttp.responseText));
            }
        };
        return xhttp.send(JSON.stringify(body));
    }

    function runSendPromise() {
        var deferred = new $.Deferred();
        setTimeout(function () {
            sendFile();
            deferred.resolve();
        }, 2000);
        return deferred.promise();
    }

    function deploySent() {
        runSendPromise().done(deployChange());
    }

    function deployChange() {
        var BASE_URL = DOMAIN + "/k/v1/";
        var body = {
            "apps": [
                {
                    "app": id
                }
            ]
        };
        var xhttp = new XMLHttpRequest();
        xhttp.open('POST', BASE_URL + "preview/app/deploy.json");
        xhttp.setRequestHeader("X-Cybozu-Authorization", encoded);
        xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.onload = function () {
            if (xhttp.status === 200) {
                // success
                console.log("Finish Deploying");
                console.log(JSON.parse(xhttp.responseText));
                window.alert("File has been deployed!");
            } else {
                // error
                console.log(JSON.parse(xhttp.responseText));
            }
        };
        xhttp.send(JSON.stringify(body));
    }

    var SEND_COMMAND = "sendktfile.sendDoc";
    CommandManager.register("Send to Kintone", SEND_COMMAND, handleSendKTFile);

    var DEPLOY_COMMAND = 'sendktfile.deployfile';
    CommandManager.register("Deploy Kintone App", DEPLOY_COMMAND, deploySent);

    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuItem(SEND_COMMAND, "Ctrl-Shift-K");
    menu.addMenuItem(DEPLOY_COMMAND, "Ctrl-Alt-Shift-K");

});