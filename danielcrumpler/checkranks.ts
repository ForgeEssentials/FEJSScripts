// Developed by Daniel "Crump" Crumpler. Need Help? Contact me on [Discord: Crump#4626], [Instagram: dacrumpler], or [LinkedIn: daniel-crumpler-61601a173].
export function checkRanksCommand(args: fe.CommandArgs) {
    if (args.isEmpty()) {
        args.confirm('/checkranks [player]');
        return;
    }
    var player = args.parsePlayer(true,true);
    var info = player.getPlayerInfo();
    var time = info.getTimePlayed();  
    var hiddenChatSender = args.sender.doAs(null, true);

    if (time >= 4320000000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'GLOBAL');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'SUPREME');
        return;
    }
    else if (time >= 3456000000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'SUPREME');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'LEM');
        return;
    }
    else if (time >= 2592000000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'LEM');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'LE');
        return;
    }
    else if (time >= 1728000000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'LE');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'DMG');
        return;
    }
    else if (time >= 864000000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'DMG');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'MGE');
        return;
    }
    else if (time >= 432000000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'MGE');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'MG2');
        return;
    }
    else if (time >= 345600000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'MG2');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'MG1');
        return;
    }
    else if (time >= 259200000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'MG1');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'GM');
        return;
    }
    else if (time >= 172800000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'GM');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'G3');
        return;
    }
    else if (time >= 86400000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'G3');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'G2');
        return;
    }
    else if (time >= 64800000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'G2');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'G1');
        return;
    }
    else if (time >= 43200000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'G1');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'SEM');
        return;
    }
    else if (time >= 28800000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'SEM');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'SE');
        return;
    }
    else if (time >= 14400000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'SE');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'S4');
        return;
    }
    else if (time >= 7200000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'S4');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'S3');
        return;
    }
    else if (time >= 3600000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'S3');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'S2');
        return;
    }
    else if (time >= 1800000) {
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'S2');
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'remove', 'S1');
        return;
    }
    else if (time >= 10000){
        Server.runCommand(hiddenChatSender, 'p', 'user', player.getUsername(), 'group', 'add', 'S1');
        return;
    }
    else {
        Server.runCommand(hiddenChatSender, 'spawn')
    }
}

FEServer.registerCommand({
    name: 'checkranks',
    usage: '/checkranks [player]',
    permission: 'fe.commands.checkranks',
    opOnly: true,
    processCommand: checkRanksCommand,
    tabComplete: checkRanksCommand,
});