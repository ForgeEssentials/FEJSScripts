export function discordCommand(args: fe.CommandArgs) {
    args.confirm('Please join our discord server with almost 100 members at https://discord.gg/fZwQXV5');
    return;
}

FEServer.registerCommand({
    name: 'discord',
    usage: '/discord',
    permission: 'command.discord',
    opOnly: false,
    processCommand: discordCommand,
    tabComplete: discordCommand,
});