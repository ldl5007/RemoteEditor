/*
 *
 */


define(function (require, exports, module) {
    'use strict';

    var AppInit        = brackets.getModule("utils/AppInit"),
		CommandManager = brackets.getModule("command/CommandManager"),
		Menus          = brackets.getModule("command/Menus");

	var Main = require("src/Main");

    var COMMAND_ID = "testing.tutorialExt.LogHelloWorld";
    var COMMAND_NAME = "Log Hello World";

    function sayHello() {
        console.log("Hello World");
    }

    CommandManager.register(COMMAND_NAME, COMMAND_ID, sayHello);
    var fileMenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    fileMenu.addMenuItem(COMMAND_ID);

	AppInit.appReady(function() {
		Main.init();
	});

});
