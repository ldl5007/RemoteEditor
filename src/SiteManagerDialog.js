define (function (require, exports){
	"use strict";

	var Dialogs      = brackets.getModule("widgets/Dialogs"),
		Strings      = require("../strings"),
		Logger       = require("./Logger"),
		SiteManager  = require("./SiteManager"),
		FtpClient     = require("./FtpClient"),
		FtpSiteDialog = require("./FtpSiteDialog");

	var DialogTemplate = require("text!templates/site-manager-dialog.html");

	var dialog,
		$dialog,
		selectedSite = null;

	function init(){
		Logger.consoleDebug("SiteManager.init()");
		SiteManager.init();
		refresh();

		$('button[data-button-id="new-site"]', $dialog).on("click", newSiteHandle);
		$('button[data-button-id="edit-site"]', $dialog).on("click", editSiteHandle);
		$('button[data-button-id="connect"]', $dialog).on("click", connectHandle);
	}

	function refresh(){
		Logger.consoleDebug("SiteManagerDialog.refresh()");

		var html = '';
		var siteList = SiteManager.getSitesArray();
		selectedSite = null;

		if (siteList.length === 0){
			html += '<tr class="site-row">';
			html += '<td>' + Strings.DIALOG_EMPTY_LIST + '</tr>';
			html += '</tr>';
		} else {
			for (var index = 0; index < siteList.length; index++) {
				var site = siteList[index];

				if (SiteManager.validateSite(site)){
					html += '<tr class="site-row">';
					html += '<td>' + site.getName() + '</tr>';
					html += '</tr>';
				}
			}
		}

		$("#ftp-site-table", $dialog).html(html);
		$(".site-row", $dialog).on("click", function(){
			var siteName = $(this).text();

			console.log($(this).text());

			selectedSite = SiteManager.getSiteByName(siteName);

			$("#ftp-serverType",    $dialog).val(selectedSite.getRemoteOs());
			$("#ftp-site-hostName", $dialog).val(selectedSite.getHostAddr());
			$("#ftp-site-rootDir",  $dialog).val(selectedSite.getRootDir());
			$("#ftp-site-userName", $dialog).val(selectedSite.getUserName());

			$(this).addClass("selected").siblings().removeClass("selected");
		});
	}

	function show(){
		Logger.consoleDebug("SiteManagerDialog.show()");
		var compiledTemplate = Mustache.render(DialogTemplate, Strings);

		dialog = Dialogs.showModalDialogUsingTemplate(compiledTemplate);
		$dialog = dialog.getElement();

		init();
	}

	function newSiteHandle(e){
		Logger.consoleDebug("SiteManagerDialog.newSiteHandle()");
		e.stopPropagation();

		var dialog = FtpSiteDialog.show();
		dialog.done(refresh);
	}

	function editSiteHandle(e){
		Logger.consoleDebug("SiteManagerDialog.editSiteHandle()");
		e.stopPropagation();

		if (SiteManager.validateSite(selectedSite)){
			var dialog = FtpSiteDialog.show(selectedSite);
			dialog.done(refresh);
		}
	}

	function connectHandle(e){
		Logger.consoleDebug("SiteManagerDialog.connectHandle()");
		e.stopPropagation();

		console.log(selectedSite);

		FtpClient.debug(selectedSite);
	}

	exports.show = show;
});
