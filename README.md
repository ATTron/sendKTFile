# sendKTFile
**Currently this extention only supports desktop js files**\
sendKTFile is an [adobe brackets](http://brackets.io/) extention ment to help make Kintone Development more streamlined. This is ment to be an alternative to other kintone development solutions such as [jsEdit for Kintone](https://github.com/kintone/plugin-sdk/tree/master/examples/js-edit). This way you do not have to worry about removing and reuploading files over and over again. This plugin will update the file attached to the most recent version you have written in brackets.

# Installation

## Using Extention Manager
- Open the extention manager and search for the extention
- Click install and head to the setup

## Using URL/Zip
- Open the extention manager
- Download Zip from [github](https://github.com/ATTron/sendKTFile)
- Drag & Drop the zip file into the area inside the extention manager
- Head to the setup

## Setting up
Go into your brackets settings and setup your username, password, appID, and domain. After you reload you should be able to use *Ctrl-Shift-K* to run the file upload. Do see your changes in Kintone you must also deploy the files with *Ctrl-Alt-Shift-K*.\
**IMPORTANT You must run the deploy function twice in order for the change to take effect**

# Usage
**During file edits/creattions**
- Run *Ctrl-Shift-K* or *File -> Send to Kintone*
- Run *Ctrl-Alt-Shift-K* or *File -> Deploy Kintone App*.\
**Note: You must run deploy app **__twice___** to have it take effect**

# Important Note
If you see it throwing an error about objects it is possible to ignore it and the extention should still work. This has to do with how the API calls are made to Kintone.

# Change History
4/28/18 - Code refactor and stability updates

4/27/18 - Inital Release

# Upcoming changes
- [ ]Not showing password in plain text
- [ ]General QOL improvements
- [x]Stability improvements

# Support & Issues
Post your feature requests, issues, errors. I will keep working to improve it when I can.

# Additional resources
- [Kintone Developer Portal](https://developer.kintone.io)
- [Adobe Brackets API Documentation](http://brackets.io/docs/current/)
