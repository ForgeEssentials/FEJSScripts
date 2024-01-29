const jailCoordinates = { x: 507, y: 66, z: 764 };
const jailedPlayers: Record<
    string,
    {
        time: number;
        start: number;
        intervalId: number;
        previousPosition: Position;
    }
> = {};

function jailCommandHandler(args: fe.CommandArgs) {
    const hiddenChatSender = args.sender.doAs(null, true);

    if (args.isEmpty()) {
        return args.confirm(
            '/jail <player> [time]: Jails a player for x minutes'
        );
    }

    const playerInfo = args.parsePlayer(true, true);

    if (args.isTabCompletion) {
        return;
    }

    let time: number;
    try {
        time = args.size() > 0 ? args.parseInt(1, 15) : 1;
    } catch {
        return args.error('Invalid time');
    }

    const player = playerInfo.getPlayer();

    jail(args, hiddenChatSender, player, time);
}

function unjailCommandHandler(args: fe.CommandArgs) {
    if (args.isEmpty()) {
        return args.confirm('/unjail <player>: Releases a player from jail');
    }

    const playerInfo = args.parsePlayer(true, true);

    if (args.isTabCompletion) {
        return;
    }

    if (!jailedPlayers[playerInfo.getPlayer().getName()]) {
        return args.error('Player is not jailed');
    }

    unjail(args.sender, playerInfo.getPlayer());
}

function jail(
    args: fe.CommandArgs,
    sender: mc.ICommandSender,
    player: mc.entity.EntityPlayer,
    time: number
) {
    if (player.getDimension() !== 0) {
        args.error('You can only jail players in the overworld');
        args.error('But player is in dimension ' + player.getDimension());
        return;
    }

    const playerName = player.getName();
    const hiddenChatSender = sender.doAs(null, true);

    if (jailedPlayers[playerName]) {
        const remainingTime = getRemainingTime(playerName);

        const minutes = remainingTime === 1 ? 'minute' : 'minutes';

        args.notify(
            `This player is already jailed. Remaining time: ${remainingTime} ${minutes}`
        );
        return;
    }

    const minutes = time === 1 ? 'minute' : 'minutes';

    Server.runCommand(
        hiddenChatSender,
        'gamemode',
        'adventure',
        player.getName()
    );

    const previousPosition = {
        x: player.getX(),
        y: player.getY(),
        z: player.getZ(),
    };

    setTimeout(() => playSound(hiddenChatSender, player, 2), 0);
    setTimeout(() => playSound(hiddenChatSender, player, 1.5), 200);
    setTimeout(() => playSound(hiddenChatSender, player, 1), 400);
    setTimeout(() => tp(sender, playerName, jailCoordinates), 1000);

    args.notify(`Jailed ${player.getName()} for ${time} ${minutes}`);
    player
        .asCommandSender()
        .chatError(`You have been jailed for ${time} ${minutes}`);

    setTime(sender, player, 60);
    setSubtitle(sender, player, `Time remaining: ${time} ${minutes}`, 'red');
    setTitle(sender, player, 'You are in jail', 'red');

    jailedPlayers[playerName] = {
        time,
        start: Date.now(),
        intervalId: setInterval(() => {
            const remainingTime = getRemainingTime(playerName);
            if (remainingTime <= 0) {
                unjail(sender, player);
                return;
            }

            const minutes = remainingTime === 1 ? 'minute' : 'minutes';

            clearTitle(sender, player);
            setTime(sender, player, 60);
            setSubtitle(
                sender,
                player,
                `Time remaining: ${remainingTime} ${minutes}`,
                'red'
            );
            setTitle(sender, player, 'You are in jail', 'red');
            playSound(sender, player);
        }, 60 * 1000),
        previousPosition: previousPosition,
    };
}

function tp(sender: mc.ICommandSender, playerName: string, position: Position) {
    Server.runCommand(
        sender.doAs(null, true),
        'tp',
        playerName,
        position.x,
        position.y + 1,
        position.z
    );
}

function getRemainingTime(playerName: string) {
    const jailedPlayer = jailedPlayers[playerName];

    if (!jailedPlayer) {
        return 0;
    }

    const startTime = jailedPlayer.start;
    const givenTime = jailedPlayer.time;
    const remainingTime =
        givenTime - Math.floor((Date.now() - startTime) / 1000 / 60);
    return remainingTime;
}

function unjail(sender: mc.ICommandSender, player: mc.entity.EntityPlayer) {
    const playerName = player.getName();

    const jailedPlayer = jailedPlayers[playerName];
    const previousPosition = jailedPlayer.previousPosition;
    const hiddenChatSender = sender.doAs(null, true);

    clearInterval(jailedPlayer.intervalId);

    Server.runCommand(
        hiddenChatSender,
        'gamemode',
        'survival',
        player.getName()
    );

    player.asCommandSender().chatConfirm('Your jail time has ended.');
    delete jailedPlayers[player.getName()];

    clearTitle(sender, player);

    setTimeout(() => playSound(hiddenChatSender, player, 1.0), 0);
    setTimeout(() => playSound(hiddenChatSender, player, 1.5), 200);
    setTimeout(() => playSound(hiddenChatSender, player, 2), 400);
    setTimeout(() => tp(sender, playerName, previousPosition), 1000);

    clearTitle(hiddenChatSender, player);

    setTimeout(() => {
        setTime(hiddenChatSender, player, 3, 0, 0.5);
        setSubtitle(hiddenChatSender, player, '', 'white');
        setTitle(hiddenChatSender, player, 'You have been released.', 'green');
    }, 1000);
}

function playSound(
    sender: mc.ICommandSender,
    player: mc.entity.EntityPlayer,
    pitch: number = 0.0
) {
    // /playsound minecraft:block.note.pling master @p[name=FatalMerlin] ~ ~ ~ 1.0 0.0

    Server.runCommand(
        sender.doAs(null, true),
        'playsound',
        'minecraft:block.note.pling',
        'master',
        player.getName(),
        player.getX(),
        player.getY(),
        player.getZ(),
        1,
        pitch,
        1
    );
}

function setActionBar(
    sender: mc.ICommandSender,
    player: mc.entity.EntityPlayer,
    text: string,
    color: string
) {
    Server.runCommand(
        sender.doAs(null, true),
        'title',
        `@p[name=${player.getName()}]`,
        'actionbar',
        JSON.stringify({
            text,
            color,
        })
    );
}

function setTime(
    sender: mc.ICommandSender,
    player: mc.entity.EntityPlayer,
    time: number,
    fadeInDuration: number = 0,
    fadeOutDuration: number = fadeInDuration
) {
    const fadeInString = Math.floor(fadeInDuration * 20).toString();
    const fadeOutString = Math.floor(fadeOutDuration * 20).toString();
    const timeString = Math.floor(time * 20).toString();

    Server.runCommand(
        sender.doAs(null, true),
        'title',
        `@p[name=${player.getName()}]`,
        'times',
        fadeInString,
        timeString,
        fadeOutString
    );
}

function setSubtitle(
    sender: mc.ICommandSender,
    player: mc.entity.EntityPlayer,
    text: string,
    color: string
) {
    Server.runCommand(
        sender.doAs(null, true),
        'title',
        `@p[name=${player.getName()}]`,
        'subtitle',
        JSON.stringify({
            text,
            color,
        })
    );
}

function setTitle(
    sender: mc.ICommandSender,
    player: mc.entity.EntityPlayer,
    text: string,
    color: string
) {
    Server.runCommand(
        sender.doAs(null, true),
        'title',
        `@p[name=${player.getName()}]`,
        'title',
        JSON.stringify({
            text,
            color,
        })
    );
}

function clearTitle(sender: mc.ICommandSender, player: mc.entity.EntityPlayer) {
    Server.runCommand(
        sender.doAs(null, true),
        'title',
        `@p[name=${player.getName()}]`,
        'clear'
    );
}

function resetTitle(sender: mc.ICommandSender, player: mc.entity.EntityPlayer) {
    Server.runCommand(
        sender.doAs(null, true),
        'title',
        `@p[name=${player.getName()}]`,
        'reset'
    );
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
