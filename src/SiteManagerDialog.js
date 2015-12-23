define (function (require, exports){
	"use strict";

	var Dialogs      = brackets.getModule("widgets/Dialogs"),
		Strings      = require("../strings"),
		Events       = require("./Events"),
		EventEmitter = require("./EventEmitter"),
		Logger       = require("./Logger"),
		FtpSiteDialog = require("./FtpSiteDialog");

	var DialogTemplate = require("text!templates/site-manager-dialog.html");

	var dialog,
		$dialog;

	function init(){
		refresh();

		$('button[data-button-id="new-site"]', $dialog).on("click", newSite);
		$('button[data-button-id="edit-site"]', $dialog).on("click", editSite);
	}

	function refresh(){
		Logger.consoleDebug("SiteManagerDialog.refresh()");
	}

	function show(){
		Logger.consoleDebug("SiteManagerDialog.show()");
		var compiledTemplate = Mustache.render(DialogTemplate, Strings);

		dialog = Dialogs.showModalDialogUsingTemplate(compiledTemplate);
		$dialog = dialog.getElement();

		init();
	}

	function newSite(e){
		Logger.consoleDebug("SiteManagerDialog.newSite()");
		e.stopPropagation();

		FtpSiteDialog.show();

	}

	function editSite(e){
		Logger.consoleDebug("SiteManagerDialog.editSite()");

		e.stopPropagation();
	}

	exports.show = show;
});
