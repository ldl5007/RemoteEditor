/*
 *
 *
 */


define(function (require, exports, module) {
    'use strict';

    var AppInit        = brackets.getModule("utils/AppInit"),
		CommandManager = brackets.getModule("command/CommandManager"),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
		Menus          = brackets.getModule("command/Menus");


	var FileManager = require("src/FileManager");


	var Logger = require("src/Logger"),
		Main   = require("src/Main");

	// Load stylesheet
	ExtensionUtils.loadStyleSheet(module, "styles/brackets-remote-editor.less");

    var COMMAND_ID = "testing.tutorialExt.LogHelloWorld";
    var COMMAND_NAME = "Log Hello World";

    CommandManager.register(COMMAND_NAME, COMMAND_ID, FileManager.testingDebug);
    var fileMenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    fileMenu.addMenuItem(COMMAND_ID);

	AppInit.appReady(function() {
		Logger.consoleDebug("main.appReady()");
		Main.init();
	});

});
