"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function playtimeCommand(args) {
    if (args.isEmpty()) {
        args.confirm('/playtime [player]');
        return;
    }
    var player = args.parsePlayer(true, false);
    var info = player.getPlayerInfo();
    var time = info.getTimePlayed();
    var timeDays = Math.floor(time / 86400000);
    var timeHours = Math.floor((time - (timeDays * 86400000)) / 3600000);
    var timeMinutes = Math.floor((time - (timeDays * 86400000) - (timeHours * 3600000)) / 60000);
    var timeSeconds = Math.floor((time - (timeDays * 86400000) - (timeHours * 3600000) - (timeMinutes * 60000)) / 1000);
    var timeMilliseconds = (time - (timeDays * 86400000) - (timeHours * 3600000) - (timeMinutes * 60000) - (timeSeconds * 1000));
    args.confirm(player.getUsername() + " has a current playtime of: " + timeDays + " days " + timeHours + " hours " + timeMinutes + " minutes " + timeSeconds + " seconds " + timeMilliseconds + " milliseconds.");
    return;
}
exports.playtimeCommand = playtimeCommand;
FEServer.registerCommand({
    name: 'playtime',
    usage: '/playtime [player]',
    permission: 'fe.commands.playtime',
    opOnly: false,
    processCommand: playtimeCommand,
    tabComplete: playtimeCommand,
});
