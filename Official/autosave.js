//
// Primitive AutoSave FEJscript
//

var saveInterval = '300000';


setInterval(function()
{
	Server.chatConfirm('Saving World in 60 Seconds. Prepare for Lag!');
	
	setTimeout(function() 
	{
		Server.chatConfirm('Saving World!');
		
		var hiddenChatSender = Server.getServer().doAs(null, true);
		Server.runCommand(hiddenChatSender, 'save-all');
	}, '60000');
}, saveInterval);


var hiddenChatSender = Server.getServer().doAs(null, true);
Server.runCommand(hiddenChatSender, 'save-off');
Server.runCommand(hiddenChatSender, 'save-all');
Server.chatConfirm('AutoSave Script Loaded!');