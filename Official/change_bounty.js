// Preview: https://youtu.be/_qRKcsqXeJs
// Storing all Entities in an array. (from PermissionList.txt => *.bounty.*)
// remove fe.protection.bounty and fe.protection.bounty.message
var BountyMobs = [
];

// function to activate an command block on x, y, z to execute a "/butcher 25 all" command to replace all visual bunties
// so we wont have millions of entities. WARNING !! this will happen within the same tick !!!
function changeBounty(args) {
    var x = -407, y = 61, z = 398;
    var hiddenChatSender = args.sender.doAs(null, true);

    Server.runCommand(hiddenChatSender, 'setblock', x, y, z  + ' redstone_block');
    Server.runCommand(hiddenChatSender, 'setblock', x, y, z  + ' air');
    setBounty(args);
}

// Function to refresh our (daily) Bounty
function setBounty(args) {
    // adding 3 visual bounties and display a chat message
    // add or remove rN and bN to add or remove bounties (N = any number like r1, b15 etc)

    // Random 1,2,3: Gets an random Entity from our array and stores it in r1, r2 & r3.
    var r1 = Math.floor((Math.random() * BountyMobs.length));
    var r2 = Math.floor((Math.random() * BountyMobs.length));
    var r3 = Math.floor((Math.random() * BountyMobs.length));
    // Bounty 1,2,3: Generates a random float with an precision of 2 and stores it in b1,b2 & b3 => Used as our Bounty multiplier.
    // Example: b1 = 3.76 means the players are getting 3.76 Coins per XP orb.
    var b1 = (Math.random() * (4 - 0.50) + 0.50).toFixed(2); // (MAX - MIN) + MIN
    var b2 = (Math.random() * (4 - 0.50) + 0.50).toFixed(2);
    var b3 = (Math.random() * (4 - 0.50) + 0.50).toFixed(2);
    // "Player" used to execute the command.
    var hiddenChatSender = args.sender.doAs(null, true);
    // for loop variable
    var i;

    // this function will reset ALL bounties
    for(i = 0; i < BountyMobs.length; i++) {
        Server.runCommand(hiddenChatSender, 'p', 'group Hunter clear', BountyMobs[i]);
    }

    // this function will be executed AFTER "/butcher 25 all" otherwise you will
    // end up having tons of entities
    // timer is set to 3.000ms = 3 seconds
    setTimeout(function() {
        var x1 = -397, y1 = 65, z1 = 404; // Pos of Bounty Entity 1
        var x2 = -405, y2 = 65, z2 = 404; // Pos of Bounty Entity 2
        var x3 = -413, y3 = 65, z3 = 404; // Pos of Bounty Entity 3

        // seperating "fe.economy.bounty." from our array and stores it in n1.
        var n1 = BountyMobs[r1].slice(18, 60);
        // Setting the bounty value.
        Server.runCommand(hiddenChatSender, 'p', 'group Hunter value', BountyMobs[r1], b1);
        // Announcing the Bounty.
        Server.chat('§eDaily Bounty I: §4' + n1 + ' §e' + b1 + ' Coins.');
        // Spawning an Entity to display the current Bounty visually with its registry name.
        // NBT Properties are:
        // NoAI = dumb Entity, Silent = no noise, Invulnerable = cant be killed by Players
        // NoGravity = makes the Entity fly, Invisible = unnecessary, but makes your Entity invisible if set to 1
        // CustomName = The display name above the Entity, CustomNameVisible = enables the CustomName || n1 = displaying the registryName of the Entity
        // ActiveEffects: Fire resistance for Mobs that would burn on DayTime
        Server.runCommand(hiddenChatSender, 'summon', n1, x1, y1, z1, '{NoAI:1, Silent:1, Invulnerable:1, NoGravity:1, Invisible:0, CustomName:"', n1, '",CustomNameVisible:1, ActiveEffects:[{Id:12,Duration:1000000,ShowParticles:0b}], Rotation:[180f,0f]}');

        var n2 = BountyMobs[r2].slice(18, 60);
        Server.runCommand(hiddenChatSender, 'p', 'group Hunter value', BountyMobs[r2], b2);
        Server.chat('§eDaily Bounty II: §4' + n2 + ' §e' + b2 + ' Coins.');
        Server.runCommand(hiddenChatSender, 'summon', n2, x2, y2, z2, '{NoAI:1, Silent:1, Invulnerable:1, NoGravity:1, Invisible:0, CustomName:"', n2, '",CustomNameVisible:1, ActiveEffects:[{Id:12,Duration:1000000,ShowParticles:0b}], Rotation:[180f,0f]}');

        var n3 = BountyMobs[r3].slice(18, 60);
        Server.runCommand(hiddenChatSender, 'p', 'group Hunter value', BountyMobs[r3], b3);
        Server.chat('§eDaily Bounty II: §4' + n3 + ' §e' + b3 + ' Coins.');
        Server.runCommand(hiddenChatSender, 'summon', n3, x3, y3, z3, '{NoAI:1, Silent:1, Invulnerable:1, NoGravity:1, Invisible:0, CustomName:"', n3, '",CustomNameVisible:1, ActiveEffects:[{Id:12,Duration:1000000,ShowParticles:0b}], Rotation:[180f,0f]}');
    }, 3000); // timer
}

FEServer.registerCommand({
    name: 'changeBounty', // command thats typed into the chat
    usage: '/changeBounty',
    opOnly: true,
    processCommand: changeBounty
});