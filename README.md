# sendKTFile
**Currently this extention only supports desktop js files**
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
Go into your brackets settings and setup your username, password, appID, and domain. After you reload you should be able to use *Ctrl-Shift-K* to run the extention and upload your file. If the shortcut does not work you can still go into *File -> Send to Kintone*.

# Usage
Run *Ctrl-Shift-K* or *File -> Send to Kintone* with your javascript file open and the primary docuemnt in brackets.

# Important Note
If you see it throwing an error about objects it is possible to ignore it and the extention should still work. This has to do with how the API calls are made to Kintone. If you don't see the files update you may have to run it a second time.

# Change History
4/27/18 - Inital Release

# Upcoming changes
- Not showing password in plain text
- General QOL improvements
- Stability improvements

# Support & Issues
Post your feature requests, issues, errors. I will keep working to improve it when I can.

# Additionally resources
- [Kintone Developer Portal](https://developer.kintone.io)
- [Adobe Brackets API Documentation](http://brackets.io/docs/current/)
