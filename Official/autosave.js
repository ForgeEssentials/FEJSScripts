//
// Primitive AutoSave FEJscript
//

var saveInterval = '300000';


setInterval(function()
{	
	var hiddenChatSender = Server.getServer().doAs(null, true);
	Server.runCommand(hiddenChatSender, 'save-on');
	Server.runCommand(hiddenChatSender, 'save-all');
	setTimeout(function() {
		Server.runCommand(hiddenChatSender, 'save-off');
	}, 5000);
}, saveInterval);


var hiddenChatSender = Server.getServer().doAs(null, true);
setTimeout(function() {
	Server.runCommand(hiddenChatSender, 'save-off');
	Server.runCommand(hiddenChatSender, 'save-all');
}, 30000);
Server.chatConfirm('AutoSave Script Loaded!');