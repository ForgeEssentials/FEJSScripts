var jailCoordinates = { x: 507, y: 66, z: 764 };
var jailedPlayers = {};
function jailCommandHandler(args) {
    var hiddenChatSender = args.sender.doAs(null, true);
    if (args.isEmpty()) {
        return args.confirm('/jail <player> [time]: Jails a player for x minutes');
    }
    var playerInfo = args.parsePlayer(true, true);
    if (args.isTabCompletion) {
        return;
    }
    var time;
    try {
        time = args.size() > 0 ? args.parseInt(1, 15) : 1;
    }
    catch (_a) {
        return args.error('Invalid time');
    }
    var player = playerInfo.getPlayer();
    jail(args, hiddenChatSender, player, time);
}
function unjailCommandHandler(args) {
    if (args.isEmpty()) {
        return args.confirm('/unjail <player>: Releases a player from jail');
    }
    var playerInfo = args.parsePlayer(true, true);
    if (args.isTabCompletion) {
        return;
    }
    if (!jailedPlayers[playerInfo.getPlayer().getName()]) {
        return args.error('Player is not jailed');
    }
    unjail(args.sender, playerInfo.getPlayer());
}
function jail(args, sender, player, time) {
    if (player.getDimension() !== 0) {
        args.error('You can only jail players in the overworld');
        args.error('But player is in dimension ' + player.getDimension());
        return;
    }
    var playerName = player.getName();
    var hiddenChatSender = sender.doAs(null, true);
    if (jailedPlayers[playerName]) {
        var remainingTime = getRemainingTime(playerName);
        var minutes_1 = remainingTime === 1 ? 'minute' : 'minutes';
        args.notify("This player is already jailed. Remaining time: ".concat(remainingTime, " ").concat(minutes_1));
        return;
    }
    var minutes = time === 1 ? 'minute' : 'minutes';
    Server.runCommand(hiddenChatSender, 'gamemode', 'adventure', player.getName());
    var previousPosition = {
        x: player.getX(),
        y: player.getY(),
        z: player.getZ(),
    };
    setTimeout(function () { return playSound(hiddenChatSender, player, 2); }, 0);
    setTimeout(function () { return playSound(hiddenChatSender, player, 1.5); }, 200);
    setTimeout(function () { return playSound(hiddenChatSender, player, 1); }, 400);
    setTimeout(function () { return tp(sender, playerName, jailCoordinates); }, 1000);
    args.notify("Jailed ".concat(player.getName(), " for ").concat(time, " ").concat(minutes));
    player
        .asCommandSender()
        .chatError("You have been jailed for ".concat(time, " ").concat(minutes));
    setTime(sender, player, 60);
    setSubtitle(sender, player, "Time remaining: ".concat(time, " ").concat(minutes), 'red');
    setTitle(sender, player, 'You are in jail', 'red');
    jailedPlayers[playerName] = {
        time: time,
        start: Date.now(),
        intervalId: setInterval(function () {
            var remainingTime = getRemainingTime(playerName);
            if (remainingTime <= 0) {
                unjail(sender, player);
                return;
            }
            var minutes = remainingTime === 1 ? 'minute' : 'minutes';
            clearTitle(sender, player);
            setTime(sender, player, 60);
            setSubtitle(sender, player, "Time remaining: ".concat(remainingTime, " ").concat(minutes), 'red');
            setTitle(sender, player, 'You are in jail', 'red');
            playSound(sender, player);
        }, 60 * 1000),
        previousPosition: previousPosition,
    };
}
function tp(sender, playerName, position) {
    Server.runCommand(sender.doAs(null, true), 'tp', playerName, position.x, position.y + 1, position.z);
}
function getRemainingTime(playerName) {
    var jailedPlayer = jailedPlayers[playerName];
    if (!jailedPlayer) {
        return 0;
    }
    var startTime = jailedPlayer.start;
    var givenTime = jailedPlayer.time;
    var remainingTime = givenTime - Math.floor((Date.now() - startTime) / 1000 / 60);
    return remainingTime;
}
function unjail(sender, player) {
    var playerName = player.getName();
    var jailedPlayer = jailedPlayers[playerName];
    var previousPosition = jailedPlayer.previousPosition;
    var hiddenChatSender = sender.doAs(null, true);
    clearInterval(jailedPlayer.intervalId);
    Server.runCommand(hiddenChatSender, 'gamemode', 'survival', player.getName());
    player.asCommandSender().chatConfirm('Your jail time has ended.');
    delete jailedPlayers[player.getName()];
    clearTitle(sender, player);
    setTimeout(function () { return playSound(hiddenChatSender, player, 1.0); }, 0);
    setTimeout(function () { return playSound(hiddenChatSender, player, 1.5); }, 200);
    setTimeout(function () { return playSound(hiddenChatSender, player, 2); }, 400);
    setTimeout(function () { return tp(sender, playerName, previousPosition); }, 1000);
    clearTitle(hiddenChatSender, player);
    setTimeout(function () {
        setTime(hiddenChatSender, player, 3, 0, 0.5);
        setSubtitle(hiddenChatSender, player, '', 'white');
        setTitle(hiddenChatSender, player, 'You have been released.', 'green');
    }, 1000);
}
function playSound(sender, player, pitch) {
    if (pitch === void 0) { pitch = 0.0; }
    Server.runCommand(sender.doAs(null, true), 'playsound', 'minecraft:block.note.pling', 'master', player.getName(), player.getX(), player.getY(), player.getZ(), 1, pitch, 1);
}
function setActionBar(sender, player, text, color) {
    Server.runCommand(sender.doAs(null, true), 'title', "@p[name=".concat(player.getName(), "]"), 'actionbar', JSON.stringify({
        text: text,
        color: color,
    }));
}
function setTime(sender, player, time, fadeInDuration, fadeOutDuration) {
    if (fadeInDuration === void 0) { fadeInDuration = 0; }
    if (fadeOutDuration === void 0) { fadeOutDuration = fadeInDuration; }
    var fadeInString = Math.floor(fadeInDuration * 20).toString();
    var fadeOutString = Math.floor(fadeOutDuration * 20).toString();
    var timeString = Math.floor(time * 20).toString();
    Server.runCommand(sender.doAs(null, true), 'title', "@p[name=".concat(player.getName(), "]"), 'times', fadeInString, timeString, fadeOutString);
}
function setSubtitle(sender, player, text, color) {
    Server.runCommand(sender.doAs(null, true), 'title', "@p[name=".concat(player.getName(), "]"), 'subtitle', JSON.stringify({
        text: text,
        color: color,
    }));
}
function setTitle(sender, player, text, color) {
    Server.runCommand(sender.doAs(null, true), 'title', "@p[name=".concat(player.getName(), "]"), 'title', JSON.stringify({
        text: text,
        color: color,
    }));
}
function clearTitle(sender, player) {
    Server.runCommand(sender.doAs(null, true), 'title', "@p[name=".concat(player.getName(), "]"), 'clear');
}
function resetTitle(sender, player) {
    Server.runCommand(sender.doAs(null, true), 'title', "@p[name=".concat(player.getName(), "]"), 'reset');
}
FEServer.registerCommand({
    name: 'jail',
    usage: '/jail <player> [time]: Jails a player',
    permission: 'commands.jail',
    opOnly: false,
    processCommand: jailCommandHandler,
    tabComplete: jailCommandHandler,
});
FEServer.registerCommand({
    name: 'unjail',
    usage: '/unjail <player>: Releases a player from jail',
    permission: 'commands.jail',
    opOnly: false,
    processCommand: unjailCommandHandler,
    tabComplete: unjailCommandHandler,
});
