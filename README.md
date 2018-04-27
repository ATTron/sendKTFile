# sendKTFile
sendKTFile is an [adobe brackets](http://brackets.io/) extention ment to help make Kintone Development more streamlined. This is ment to be an alternative to other kintone development solutions such as [jsEdit for Kintone](https://github.com/kintone/plugin-sdk/tree/master/examples/js-edit). This way you do not have to worry about removing and reuploading files over and over again. This plugin will update the file attached to the most recent version you have written in brackets.

# Setting up
Go into your brackets settings and setup your username, password, appID, and domain. After you reload you should be able to use *Ctrl-Shift-K* to run the extention and upload your file. If the shortcut does not work you can still go into *File->Send KT*.

# Important Note
If you see when you run it throwing an error about objects it is possible to ignore it and the extention should still work. This has to do with how the API calls are made to Kintone. If you do not see an update run it once more and check again.

# Additionally resources
- [Kintone Developer Portal](https://developer.kintone.io)
- [Adobe Brackets API Documentation](http://brackets.io/docs/current/)
