"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function discordCommand(args) {
    args.confirm('Please join our discord server with almost 100 members at https://discord.gg/fZwQXV5');
    return;
}
exports.discordCommand = discordCommand;
FEServer.registerCommand({
    name: 'discord',
    usage: '/discord',
    permission: 'command.discord',
    opOnly: false,
    processCommand: discordCommand,
    tabComplete: discordCommand,
});
