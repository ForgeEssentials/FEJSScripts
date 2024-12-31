"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Actions;
(function (Actions) {
    Actions[Actions["giveItem"] = 0] = "giveItem";
    Actions[Actions["giveKit"] = 1] = "giveKit";
    Actions[Actions["giveMoney"] = 2] = "giveMoney";
    Actions[Actions["crateKey"] = 3] = "crateKey";
})(Actions || (Actions = {}));
var commonlib_1 = require("../commonlib");
var configVersion = 1;
if (typeof config !== 'undefined') {
    if (config.version < configVersion) {
    }
    var jsonConfig = (0, commonlib_1.toJson)(config);
    config = JSON.parse(jsonConfig);
    Server.getServer().chat("Config File Loaded: ".concat(jsonConfig));
}
else {
    Server.chatError("Config File 'crates.json' Not found!");
    var config = {
        crates: {
            basic: {
                items: [
                    {
                        name: "minecraft:iron_nugget",
                        tag: {
                            'c:display': {
                                'S:Name': "The Denver Nuggets",
                                'S:Lore': ["A legendary nugget!"]
                            }
                        },
                        meta: 0,
                        action: Actions.giveItem,
                        amount: 9,
                        chance: 25
                    },
                    {
                        name: "minecraft:iron_ingot",
                        action: Actions.giveKit,
                        kit: "starter",
                        chance: 25
                    },
                    {
                        name: "minecraft:iron_block",
                        action: Actions.giveMoney,
                        amount: 1000,
                        chance: 25
                    },
                    {
                        name: "minecraft:diamond",
                        action: Actions.crateKey,
                        crate: "iron",
                        chance: 25
                    },
                    {
                        name: "minecraft:planks",
                        action: Actions.crateKey,
                        crate: "diamond",
                        chance: 25
                    }
                ],
                pickNumber: 3,
                size: 54
            },
            iron: {
                items: [
                    {
                        name: "minecraft:iron_nugget",
                        tag: {},
                        action: Actions.giveItem,
                        amount: 9,
                        chance: 55
                    },
                    {
                        name: "minecraft:iron_ingot",
                        action: Actions.giveKit,
                        kit: "starter",
                        chance: 35
                    },
                    {
                        name: "minecraft:iron_block",
                        action: Actions.giveMoney,
                        amount: 1000,
                        chance: 55
                    },
                    {
                        name: "minecraft:diamond",
                        action: Actions.crateKey,
                        crate: "iron",
                        chance: 15
                    },
                    {
                        name: "minecraft:planks",
                        action: Actions.crateKey,
                        crate: "diamond",
                        chance: 45
                    }
                ],
                pickNumber: 2,
                size: 27
            },
            diamond: {
                items: [
                    {
                        name: "minecraft:iron_nugget",
                        tag: {},
                        action: Actions.giveItem,
                        amount: 9,
                        chance: 75
                    },
                    {
                        name: "minecraft:iron_ingot",
                        action: Actions.giveKit,
                        kit: "starter",
                        chance: 15
                    },
                    {
                        name: "minecraft:iron_block",
                        action: Actions.giveMoney,
                        amount: 1000,
                        chance: 55
                    },
                    {
                        name: "minecraft:diamond",
                        action: Actions.crateKey,
                        crate: "iron",
                        chance: 65
                    },
                    {
                        name: "minecraft:planks",
                        action: Actions.crateKey,
                        crate: "diamond",
                        chance: 15
                    }
                ],
                pickNumber: 1,
                size: 36
            }
        },
        definitions: [
            {
                position: {
                    x: -190,
                    y: 66,
                    z: 255,
                    dim: 0
                },
                crate: "basic"
            },
            {
                position: {
                    x: -189,
                    y: 66,
                    z: 255,
                    dim: 0
                },
                crate: "iron"
            },
            {
                position: {
                    x: -191,
                    y: 66,
                    z: 255,
                    dim: 0
                },
                crate: "diamond"
            }
        ],
        hideCrateType: false,
        crateKey: "minecraft:tripwire_hook",
        crateItem: "minecraft:chest",
        broadcastItemGifts: false,
        version: configVersion
    };
}
var crateItem = Item.get(config.crateItem);
function main() {
    if (config.version > configVersion) {
        Server.chatError("Config Version is greater than current script version!");
        return;
    }
}
main();
function getActionLore(action) {
    if (config.hideCrateType) {
        return "You hear something rattling inside...";
    }
    switch (+action) {
        case Actions.crateKey:
            return "Gives a Crate Key";
        case Actions.giveItem:
            return "Gives an Item";
        case Actions.giveKit:
            return "Gives a Kit";
        case Actions.giveMoney:
            return "Gives an amount of credits";
        default:
            return null;
    }
}
Permissions.registerPermission("fe.crates.admin", PermissionLevel.OP, "Allows Editing of Crates");
function FirstLetterToUpper(s) {
    return s[0].toUpperCase() + s.substring(1);
}
Server.registerEvent("PlayerInteractEvent", function (event) {
    if (event.getPlayer() == null) {
        return;
    }
    var right = false;
    var eventString = event.toString();
    if (eventString.search("RightClickBlock") != -1) {
        right = true;
    }
    else if (eventString.search("LeftClickBlock") != -1) {
        right = false;
    }
    else {
        return;
    }
    var pos = event.getPos();
    var dim = event.getWorld().getDimension();
    var sender = event.getPlayer().asCommandSender();
    var handItem = event.getPlayer().getInventory().getCurrentItem();
    var handNbt = getNbt(handItem);
    var found = false;
    for (var index in config.definitions) {
        var definition = config.definitions[index];
        if (pos.getX() == definition.position.x
            && pos.getY() == definition.position.y
            && pos.getZ() == definition.position.z
            && dim == definition.position.dim && right && event.getHand() == 0) {
            event.setCanceled(true);
            found = true;
            if (handItem.getItem().getName() != config.crateKey) {
                sender.chatError("This isn't a crate key!");
                return;
            }
            if (handNbt == null || handNbt["S:crate"] != definition.crate) {
                sender.chatError("You need a ".concat(FirstLetterToUpper(definition.crate), " Key to open this crate!"));
                return;
            }
            openMenu(sender, definition.crate);
        }
    }
    if (!found && right && handItem.getItem().getName() == config.crateKey && handNbt != null && handNbt["S:crate"]) {
        sender.chatError("This doesn't go here!");
        event.setCanceled(true);
    }
});
var inventoryDef = {};
var selectedItems = {};
function openMenu(sender, crate) {
    if (sender && sender.getPlayer() != null) {
        var items = [];
        var chanceMap = [];
        var totalChance = 0;
        for (var i in config.crates[crate].items) {
            totalChance += config.crates[crate].items[i].chance;
            chanceMap.push(totalChance);
        }
        var playerInf = [];
        for (var i = 0; i < config.crates[crate].size; i++) {
            var chance = Math.random() * totalChance;
            for (var j in chanceMap) {
                if (chance <= chanceMap[j]) {
                    var itemDef = config.crates[crate].items[j];
                    var item = new mc.item.ItemStack(crateItem, 1);
                    setNbt(item, { "c:display": { "S:Lore": [getActionLore(itemDef.action)] } });
                    items.push(item);
                    playerInf.push(j);
                    break;
                }
            }
        }
        inventoryDef[sender.getPlayer().getUuid().toString()] = playerInf;
        selectedItems[sender.getPlayer().getUuid().toString()] = [];
        if (items.length == 0) {
            sender.chatConfirm("The chest seems to be empty!");
            return;
        }
        var inventory = FEServer.createCustomInventory(crate, true, items);
        var menu = FEServer.getMenuChest(crate, FirstLetterToUpper(crate) + " Chest", inventory, "onTestMenu");
        sender.getPlayer().displayGUIChest(menu.getInventory());
    }
}
var hiddenChatSender = Server.getServer().doAs(null, true);
function onTestMenu(player, clickSlot, clickFlag, clickType, inventory, itemstack) {
    var sender = player.asCommandSender();
    var crateKey = inventory.getName();
    var handItem = player.getInventory().getCurrentItem();
    if (clickType == "PICKUP" && crateKey != "container.inventory" && itemstack != mc.item.ItemStack.EMPTY) {
        var _nbt = getNbt(itemstack);
        var itemIndex = inventoryDef[player.getUuid().toString()][clickSlot];
        if (itemstack.getItem() == crateItem) {
            selectedItems[player.getUuid().toString()].push(itemIndex);
            if (selectedItems[player.getUuid().toString()].length <= config.crates[crateKey].pickNumber) {
                var itemDef = config.crates[crateKey].items[itemIndex];
                var meta = itemDef["meta"];
                if (meta == null) {
                    meta = 0;
                }
                var newItemstack = new mc.item.ItemStack(mc.item.Item.get(itemDef.name), itemDef.action == Actions.giveItem ? itemDef.amount : 1, meta);
                setNbt(newItemstack, itemDef.action == Actions.giveItem && itemDef.tag != null ? itemDef.tag : _nbt);
                inventory.setStackInSlot(clickSlot, newItemstack);
            }
            if (selectedItems[player.getUuid().toString()].length == config.crates[crateKey].pickNumber) {
                for (var i in selectedItems[player.getUuid().toString()]) {
                    var itemDef = config.crates[crateKey].items[selectedItems[player.getUuid().toString()][i].toString()];
                    var headerMsg = "A".concat("aeiouAEIOU".search(crateKey[0]) != -1 ? "n" : "", " ").concat(FirstLetterToUpper(crateKey), " Crate gave");
                    if (+itemDef.action == Actions.giveItem) {
                        var meta = itemDef["meta"];
                        if (meta == null) {
                            meta = 0;
                        }
                        var stack = new mc.item.ItemStack(mc.item.Item.get(itemDef.name), itemDef.amount, meta);
                        if (itemDef.tag != null) {
                            setNbt(stack, JSON.parse((0, commonlib_1.toJson)(itemDef.tag)));
                        }
                        var displayName = stack.getDisplayName();
                        player.getInventory().addItemStackToInventory(stack);
                        if (config.broadcastItemGifts) {
                            Server.chatConfirm("".concat(headerMsg, " ").concat(displayName, " to ").concat(sender.getName()));
                        }
                        else {
                            sender.chatConfirm("A".concat(("aeiouAEIOU".search(displayName[0]) != -1 ? "n " : " ") + displayName, " has been added to your inventory!"));
                        }
                    }
                    else if (+itemDef.action == Actions.giveKit) {
                        var ident = FEServer.getUserIdent(player.getUuid());
                        Server.tryRunCommand(hiddenChatSender, "fekit", itemDef.kit, "give", sender.getName());
                        if (config.broadcastItemGifts) {
                            Server.chatConfirm("".concat(headerMsg, " a ").concat(itemDef.kit, " Kit to ").concat(sender.getName()));
                        }
                        else {
                            sender.chatConfirm("You received the ".concat(itemDef.kit, " kit!"));
                        }
                    }
                    else if (+itemDef.action == Actions.giveMoney) {
                        Server.tryRunCommand(hiddenChatSender, "wallet", sender.getName(), "add", itemDef.amount.toString());
                        if (config.broadcastItemGifts) {
                            Server.chatConfirm("".concat(headerMsg, " $").concat(itemDef.amount.toString(), " Credits to ").concat(sender.getName()));
                        }
                        else {
                            sender.chatConfirm("$".concat(itemDef.amount.toString(), " Credits were added to your account!"));
                        }
                    }
                    else if (+itemDef.action == Actions.crateKey) {
                        var stack = new mc.item.ItemStack(mc.item.Item.get(config.crateKey), 1);
                        setNbt(stack, {
                            'c:display': {
                                'S:Name': FirstLetterToUpper(itemDef.crate)
                            },
                            'S:crate': itemDef.crate
                        });
                        player.getInventory().addItemStackToInventory(stack);
                        if (config.broadcastItemGifts) {
                            Server.chatConfirm("".concat(headerMsg, " ").concat(FirstLetterToUpper(itemDef.crate), " Key to ").concat(sender.getName()));
                        }
                        else {
                            sender.chatConfirm("You won a  ".concat(FirstLetterToUpper(itemDef.crate), " Key!"));
                        }
                    }
                }
                handItem.setStackSize(handItem.getStackSize() - 1);
                FEServer.AddCoRoutine(1, 45, "closeScreen", sender);
            }
        }
    }
    else if (clickType == "CLOSE") {
        delete inventoryDef[player.getUuid().toString()];
        delete selectedItems[player.getUuid().toString()];
    }
    else if (clickType == "QUICK_MOVE") {
        return itemstack;
    }
    return mc.item.ItemStack.EMPTY;
}
function closeScreen(sender) {
    if (sender) {
        var player = sender.getPlayer();
        delete inventoryDef[player.getUuid().toString()];
        delete selectedItems[player.getUuid().toString()];
        player.closeScreen();
    }
}
