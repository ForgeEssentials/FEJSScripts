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

    Server.runCommand(hiddenChatSender, 'setblock', x, y, z + ' redstone_block');
    Server.runCommand(hiddenChatSender, 'setblock', x, y, z + ' air');

    // this function will be executed AFTER "/butcher 25 all" otherwise you will
    // end up having tons of entities => timer is set to 3.000ms = 3 seconds
    setTimeout(function () {
        setBounty(args);
    }, 3000);
}

// Function to refresh our (daily) Bounty
function setBounty(args) {
    // adding 3 visual bounties and display a chat message
    // add or remove rN and bN to add or remove bounties (N = any number like rand1, mod15 etc)

    // Random 1,2,3: Gets an random Entity from our array and stores it in rand1, rand2 & rand3.
    var rand1 = Math.floor((Math.random() * BountyMobs.length));
    var rand2 = Math.floor((Math.random() * BountyMobs.length));
    var rand3 = Math.floor((Math.random() * BountyMobs.length));
    // Bounty 1,2,3: Generates a random float with an precision of 2 and stores it in mod1,mod2 & mod3 => Used as our Bounty multiplier.
    // Example: mod1 = 3.76 means the players are getting 3.76 Coins per XP orb.
    var mod1 = (Math.random() * (2.5 - 0.50) + 0.50).toFixed(2); // (MAX - MIN) + MIN
    var mod2 = (Math.random() * (2.5 - 0.50) + 0.50).toFixed(2);
    var mod3 = (Math.random() * (2.5 - 0.50) + 0.50).toFixed(2);
    // "Player" used to execute the command.
    var hiddenChatSender = args.sender.doAs(null, true);
    // for loop variable
    var i;

    // this function will reset ALL bounties
    for (i = 0; i < BountyMobs.length; i++) {
        Server.runCommand(hiddenChatSender, 'p', 'group Hunter clear', BountyMobs[i]);
    }
    var x1 = -397, y1 = 65, z1 = 404; // Pos of Bounty Entity 1
    var x2 = -405, y2 = 65, z2 = 404; // Pos of Bounty Entity 2
    var x3 = -413, y3 = 65, z3 = 404; // Pos of Bounty Entity 3
    var yn = 64, zn1 = 400;
    var xn2 = -405, xn3 = -413;

    // seperating "fe.economy.bounty." from our array and stores it in name1.
    var name1 = BountyMobs[rand1].slice(18, 60);
    // Setting the bounty value.
    Server.runCommand(hiddenChatSender, 'p', 'group Hunter value', BountyMobs[rand1], mod1);
    // Announcing the Bounty.
    Server.chat('§eDaily Bounty I: §4' + name1 + ' §e' + mod1 + ' Coins.');
    // Spawning an Entity to display the current Bounty visually with its registry name.
    // NBT Properties are:
    // NoAI = dumb Entity, Silent = no noise, Invulnerable = cant be killed by Players
    // NoGravity = makes the Entity fly
    // CustomName = The display name above the Entity, CustomNameVisible = enables the CustomName || name1 = displaying the registryName of the Entity
    // ActiveEffects: Fire resistance for Mobs that would burn on DayTime
    Server.runCommand(hiddenChatSender, 'summon', name1, x1, y1, z1, '{NoAI:1, Silent:1, Invulnerable:1, NoGravity:1, CustomName:"",CustomNameVisible:1, ActiveEffects:[{Id:12,Duration:1000000,ShowParticles:0b}], Rotation:[180f,0f], PersistenceRequired:1}');
    // displaying registryName and Bounty as floating text (set it to armorstand and add Invisible:1 to NBT to make it invis)
    Server.runCommand(hiddenChatSender, 'summon', 'rabbit', x1, yn - 1, zn1, '{NoAI:1, Silent:1, Invulnerable:1, NoGravity:1, CustomName:"' + name1 + '", CustomNameVisible:1, ActiveEffects:[{Id:12,Duration:1000000,ShowParticles:0b}], Rotation:[180f,0f], PersistenceRequired:1}');
    Server.runCommand(hiddenChatSender, 'summon', 'rabbit', x1, yn, zn1, '{NoAI:1, Silent:1, Invulnerable:1, NoGravity:1, CustomName:"§6' + mod1 + ' Coins", CustomNameVisible:1, ActiveEffects:[{Id:12,Duration:1000000,ShowParticles:0b}], Rotation:[180f,0f], PersistenceRequired:1}');

    var name2 = BountyMobs[rand2].slice(18, 60);
    Server.runCommand(hiddenChatSender, 'p', 'group Hunter value', BountyMobs[rand2], mod2);
    Server.chat('§eDaily Bounty II: §4' + name2 + ' §e' + mod2 + ' Coins.');
    Server.runCommand(hiddenChatSender, 'summon', name2, x2, y2, z2, '{NoAI:1, Silent:1, Invulnerable:1, NoGravity:1, CustomName:"",CustomNameVisible:1, ActiveEffects:[{Id:12,Duration:1000000,ShowParticles:0b}], Rotation:[180f,0f], PersistenceRequired:1}');
    Server.runCommand(hiddenChatSender, 'summon', 'rabbit', xn2, yn, zn1, '{NoAI:1, Silent:1, Invulnerable:1, NoGravity:1, CustomName:"§6' + mod2 + ' Coins", CustomNameVisible:1, ActiveEffects:[{Id:12,Duration:1000000,ShowParticles:0b}], Rotation:[180f,0f], PersistenceRequired:1}');
    Server.runCommand(hiddenChatSender, 'summon', 'rabbit', xn2, yn - 1, zn1, '{NoAI:1, Silent:1, Invulnerable:1, NoGravity:1, CustomName:"' + name2 + '", CustomNameVisible:1, ActiveEffects:[{Id:12,Duration:1000000,ShowParticles:0b}], Rotation:[180f,0f], PersistenceRequired:1}');

    var name3 = BountyMobs[rand3].slice(18, 60);
    Server.runCommand(hiddenChatSender, 'p', 'group Hunter value', BountyMobs[rand3], mod3);
    Server.chat('§eDaily Bounty III: §4' + name3 + ' §e' + mod3 + ' Coins.');
    Server.runCommand(hiddenChatSender, 'summon', name3, x3, y3, z3, '{NoAI:1, Silent:1, Invulnerable:1, NoGravity:1, CustomName:"",CustomNameVisible:1, ActiveEffects:[{Id:12,Duration:1000000,ShowParticles:0b}], Rotation:[180f,0f], PersistenceRequired:1}');
    Server.runCommand(hiddenChatSender, 'summon', 'rabbit', xn3, yn, zn1, '{NoAI:1, Silent:1, Invulnerable:1, NoGravity:1, CustomName:"§6' + mod3 + ' Coins", CustomNameVisible:1, ActiveEffects:[{Id:12,Duration:1000000,ShowParticles:0b}], Rotation:[180f,0f], PersistenceRequired:1}');
    Server.runCommand(hiddenChatSender, 'summon', 'rabbit', xn3, yn - 1, zn1, '{NoAI:1, Silent:1, Invulnerable:1, NoGravity:1, CustomName:"' + name3 + '", CustomNameVisible:1, ActiveEffects:[{Id:12,Duration:1000000,ShowParticles:0b}], Rotation:[180f,0f], PersistenceRequired:1}');
}

FEServer.registerCommand({
    name: 'bounty', // command thats typed into the chat
    usage: '/bounty',
    opOnly: true,
    processCommand: changeBounty
});