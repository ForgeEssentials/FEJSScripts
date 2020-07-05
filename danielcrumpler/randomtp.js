"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function randomTpCommand(args) {
    if (args.isEmpty()) {
        args.confirm('/randomtp [range]: Teleport to some random location');
        return;
    }
    var player = args.player;
    var r = args.parseInt();
    var x;
    var z;
    if (!args.isEmpty()) {
        x = args.parseInt();
        z = args.parseInt();
    }
    else if (args.player) {
        x = args.player.getX();
        z = args.player.getZ();
    }
    else {
        args.confirm('Error: no player!');
        return;
    }
    if (!args.isEmpty()) {
        player = args.parsePlayer(true, true).getPlayer();
    }
    if (args.isTabCompletion)
        return;
    var hiddenChatSender = args.sender.doAs(null, true);
    Server.runCommand(hiddenChatSender, 'spreadplayers', x, z, 0, r, false, args.sender.getName());
}
exports.randomTpCommand = randomTpCommand;
FEServer.registerCommand({
    name: 'randomtp',
    usage: '/randomtp range [x z] [player]',
    permission: 'fe.teleport.randomtp',
    opOnly: false,
    processCommand: randomTpCommand,
    tabComplete: randomTpCommand,
});
