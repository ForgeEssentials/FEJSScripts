var Actions;
(function (Actions) {
    Actions[Actions["giveItem"] = 0] = "giveItem";
    Actions[Actions["giveKit"] = 1] = "giveKit";
    Actions[Actions["giveMoney"] = 2] = "giveMoney";
    Actions[Actions["crateKey"] = 3] = "crateKey";
})(Actions || (Actions = {}));
var configVersion = 1;
if (typeof config !== 'undefined') {
    if (config.version < configVersion) {
    }
}
else {
    Server.chatError("Config File 'crates.json' Not found!");
    var config = {
        crates: {
            basic: {
                items: [
                    {
                        name: "minecraft:iron_nugget",
                        tag: {},
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
                        action: 3.0,
                        crate: "diamond",
                        chance: 25
                    }
                ]
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
                        action: 3.0,
                        crate: "diamond",
                        chance: 45
                    }
                ]
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
                        action: 3.0,
                        crate: "diamond",
                        chance: 15
                    }
                ]
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
            }
        ],
        crateKey: "minecraft:tripwire_hook",
        broadcastItemGifts: true,
        version: configVersion
    };
}
function main() {
    if (config.version > configVersion) {
        Server.chatError("Config Version is greater than current script version!");
        return;
    }
}
main();
function getActionLore(action) {
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
Server.registerEvent("PlayerInteractEvent", function (event) {
    if (event.getPlayer() == null) {
        return;
    }
    if (event.toString().search("RightClickBlock") == -1) {
        return;
    }
    var pos = event.getPos();
    var dim = event.getWorld().getDimension();
    var sender = event.getPlayer().asCommandSender();
    var handItem = event.getPlayer().getInventory().getCurrentItem();
    for (var index in config.definitions) {
        var definition = config.definitions[index];
        if (pos.getX() == definition.position.x
            && pos.getY() == definition.position.y
            && pos.getZ() == definition.position.z
            && dim == definition.position.dim) {
            event.setCanceled(true);
            var crate = config.crates[definition.crate];
            var cdata = JSON.stringify(crate);
            if (handItem.getItem().getName() != config.crateKey) {
                sender.chatError("You need a key in your hand to open this!");
                return;
            }
            if (JSON.parse(handItem._getNbt())["S:crate"] != definition.crate) {
                sender.chatError("You need a ".concat(FirstLetterToUpper(definition.crate), " Key to open this crate!"));
                return;
            }
            openMenu(sender, definition.crate);
        }
    }
});
function openMenu(sender, crate) {
    if (sender && sender.getPlayer() != null) {
        var items = [];
        for (var i in config.crates[crate].items) {
            var itemDef = config.crates[crate].items[i];
            var item = new mc.item.ItemStack(Item.get(itemDef.name), 1);
            item._setNbt("{\"i:itemdefindex\":".concat(i, ",\"c:display\":{\"S:Lore\":[\"").concat(getActionLore(itemDef.action), "\"]}}"));
            if (+itemDef.action == Actions.giveItem) {
                item.setStackSize(itemDef.amount);
            }
            if (Math.random() * 100 <= itemDef.chance) {
                items.push(item);
            }
        }
        if (items.length == 0) {
            sender.chatConfirm("The chest seems to be empty!");
            return;
        }
        var inventory = FEServer.createCustomInventory(crate, true, items);
        var menu = FEServer.getMenuChest(crate, FirstLetterToUpper(crate) + " Chest", inventory, "onTestMenu");
        sender.getPlayer().displayGUIChest(menu.getInventory());
    }
}
function FirstLetterToUpper(s) {
    return s[0].toUpperCase() + s.substring(1);
}
var hiddenChatSender = Server.getServer().doAs(null, true);
function onTestMenu(player, clickSlot, clickFlag, clickType, inventory, itemstack) {
    var sender = player.asCommandSender();
    var crateKey = inventory.getName();
    if (clickType == "PICKUP" && crateKey != "container.inventory" && itemstack != null) {
        var itemDef = config.crates[crateKey].items[JSON.parse(itemstack._getNbt())["i:itemdefindex"].toString()];
        var headerMsg = "A".concat("aeiou".search(crateKey[0]) != -1 ? "n" : "", " ").concat(FirstLetterToUpper(crateKey), " Chest gave");
        if (+itemDef.action == Actions.giveItem) {
            Server.tryRunCommand(hiddenChatSender, "give", sender.getName(), itemDef.name, itemDef.amount.toString());
            if (config.broadcastItemGifts) {
                Server.chatConfirm("".concat(headerMsg, " ").concat(inventory.getStackInSlot(clickSlot).getDisplayName(), " to ").concat(sender.getName()));
            }
            else {
                sender.chatConfirm("A ".concat(inventory.getStackInSlot(clickSlot).getDisplayName(), " has been added to your inventory!"));
            }
        }
        else if (+itemDef.action == Actions.giveKit) {
            var ident = FEServer.getUserIdent(player.getUuid());
            Server.tryRunCommand(hiddenChatSender, "fekit", itemDef.kit, "give", sender.getName());
            if (config.broadcastItemGifts) {
                Server.chatConfirm("".concat(headerMsg, " a ").concat(itemDef.kit, " Kit to ").concat(sender.getName()));
            }
            else {
                sender.chatConfirm("You recived the ".concat(itemDef.kit, " kit!"));
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
            Server.tryRunCommand(hiddenChatSender, "give", sender.getName(), config.crateKey, 1, 0, "{display:{Name:\"".concat(FirstLetterToUpper(itemDef.crate), " Key\"},crate:\"").concat(itemDef.crate, "\"}"));
            if (config.broadcastItemGifts) {
                Server.chatConfirm("".concat(headerMsg, " ").concat(FirstLetterToUpper(itemDef.crate), " Key to ").concat(sender.getName()));
            }
            else {
                sender.chatConfirm("You won a  ".concat(FirstLetterToUpper(itemDef.crate), " Key!"));
            }
        }
        var handItem = player.getInventory().getCurrentItem();
        handItem.setStackSize(handItem.getStackSize() - 1);
        FEServer.AddCoRoutine(1, 1, "closeScreen", sender);
    }
}
function closeScreen(sender) {
    if (sender) {
        var player = sender.getPlayer();
        player.closeScreen();
    }
}
