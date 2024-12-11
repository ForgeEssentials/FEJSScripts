//A very simple barebones crate script as an example of some of the more complex things you can do on 1.12
//This relys on inprogress scripting inprovements and will currently only work on builds from the `1.12.2/scripting-improvements` branch.

enum Actions {
    giveItem, //Gives an amount of items
    giveKit, //Gives a specified kit
    giveMoney, //Gives an amount of money,
    crateKey //Gives an crate key
}

let configVersion = 1;

if (typeof config !== 'undefined') {    
    if (config.version < configVersion) {
        //TODO: do any config updates as needed
    }
    //Only send debug message to server.  (Also, will not broadcast to discord)
    let jsonConfig = toJson(config);
    config = JSON.parse(jsonConfig);
    Server.getServer().chat(`Config File Loaded: ${jsonConfig}`)
} else {
    Server.chatError("Config File 'crates.json' Not found!");
    var config : any = {
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
                        tag: {
                            
                        },
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
                        tag: {
                            
                        },
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
                    x:-190, 
                    y:66, 
                    z:255, 
                    dim:0
                },
                crate: "basic"
            },
            {
                position: {
                    x:-189, 
                    y:66, 
                    z:255, 
                    dim:0
                },
                crate: "iron"
            },
            {
                position: {
                    x:-191, 
                    y:66, 
                    z:255, 
                    dim:0
                },
                crate: "diamond"
            }
        ],
        crateKey: "minecraft:tripwire_hook",
        crateItem: "minecraft:chest",
        broadcastItemGifts: false,
        version: configVersion
    };
}


let crateItem = Item.get(config.crateItem);

function main() {
    if (config.version > configVersion) {
        Server.chatError("Config Version is greater than current script version!");        
        return;
    }
}
main();

function getActionLore(action: Actions) : string {
    switch(+action) {
        case Actions.crateKey:
            return "Gives a Crate Key"
        case Actions.giveItem:
            return "Gives an Item"
        case Actions.giveKit:
            return "Gives a Kit"
        case Actions.giveMoney:
            return "Gives an amount of credits"
        default:
            return null;
    }
}

Permissions.registerPermission("fe.crates.admin", PermissionLevel.OP, "Allows Editing of Crates");

FEServer.registerCommand({
    name: "itemdata",
    usage: "Prints FE complient data of current item",
    opOnly: true,
    permission: "fe.crates.admin",
    processCommand: function(args: fe.CommandArgs) {
        if (args.player == null) {
            args.sender.chatError("Must be a player!");
            return;
        }
        let FEJson =  true;
        if (!args.isEmpty()) {
            FEJson = args.parseBoolean();
        }        
        args.sender.chatConfirm(toJson(getNbt(args.player.getInventory().getCurrentItem()), FEJson));
    }
});

Server.registerEvent("PlayerInteractEvent", function(event: mc.event.entity.player.PlayerInteractEvent) {      
    if (event.getPlayer() == null) {
        return;
    }

    var right = false;
    var eventString = event.toString();
    if (eventString.search("RightClickBlock") != -1) {
        right = true;
    } else if (eventString.search("LeftClickBlock") != -1) {
        right = false;
    } else {
        return;
    }
    
    var pos = event.getPos();
    var dim = event.getWorld().getDimension();
    var sender = event.getPlayer().asCommandSender();
    var handItem = event.getPlayer().getInventory().getCurrentItem();    
    let handNbt = getNbt(handItem);

    for (var index in config.definitions) {
        
        let definition = config.definitions[index];
        if (pos.getX() == definition.position.x
            && pos.getY() == definition.position.y
            && pos.getZ() == definition.position.z
            && dim == definition.position.dim && right && event.getHand() == 0) {
                event.setCanceled(true);
                
                if (handItem.getItem().getName() != config.crateKey) 
                {
                    sender.chatError("This isn't a crate key!")
                    return;
                }
                
                if (handNbt == null || handNbt["S:crate"] != definition.crate) {
                    sender.chatError(`You need a ${FirstLetterToUpper(definition.crate)} Key to open this crate!`)
                    return;
                }
                //Only send debug message to server.  (Also, will not broadcast to discord)
                //Server.getServer().chatConfirm("Crate (" + definition.crate + "): " + (config.crates[definition.crate] instanceof Object ? JSON.stringify(config.crates[definition.crate]) : toJson(config.crates[definition.crate])));
                openMenu(sender, definition.crate);
        }
    }
    

    if (right && handItem.getItem().getName() == config.crateKey && handNbt != null && handNbt["S:crate"]) {
        sender.chatError("This doesn't go here!");
        event.setCanceled(true);
    }
});

function openMenu(sender: mc.ICommandSender, crate: string) {
    if (sender && sender.getPlayer() != null) {
        
        let items = []
        let chanceMap = []
        let totalChance = 0;
        for (let i in config.crates[crate].items) {            
            totalChance += config.crates[crate].items[i].chance;
            chanceMap.push(totalChance);
        }
        for (let i = 0; i < config.crates[crate].size; i++) {
            let chance = Math.random() * totalChance;            
            for (let j in chanceMap) {
                if (chance <= chanceMap[j]) {
                    var itemDef = config.crates[crate].items[j];            
                    var item = new mc.item.ItemStack(crateItem, 1);
                    setNbt(item, {"i:itemdefindex":j,"c:display":{"S:Lore":[getActionLore(itemDef.action)]}});
        
                    items.push(item);
                    break;
                }
            }
        }

        if (items.length == 0) {
            sender.chatConfirm("The chest seems to be empty!");
            return;
        }

        let inventory = FEServer.createCustomInventory(crate, true, items);
        let menu = FEServer.getMenuChest(crate, FirstLetterToUpper(crate) + " Chest", inventory, "onTestMenu");
        
        sender.getPlayer().displayGUIChest(menu.getInventory());
    }
}

function FirstLetterToUpper(s: string): string {
    return s[0].toUpperCase() + s.substring(1);
}

function toJson(obj : any, FEJson = true, key = null) : string {
    
    switch(typeof(obj)) {
        case "undefined":
            return null;
        case "object":
            if (obj == null) {
                return null;
            }
            let isArray = false;
            if (typeof(obj[0]) != "undefined") {
                isArray = true;
                let j = 0;
                for (let i in obj) {
                    if (+i != j) {
                        isArray = false;
                    }
                    j++;
                }
            }
            let objStr = isArray ? "[" :"{";
            let j = -1;
            if (!FEJson && isArray && key[0] != NBT_STRING[0]) {
                objStr+=key[0]
                objStr+=';'
            }
            for (let i in obj) {                
                j++;
                objStr += `${j == 0 ? "" : ","}${isArray ? "": `"${FEJson ? i : i.substring(2)}":`}${toJson(obj[i], FEJson, isArray ? key : i)}`;                
            }
            objStr += isArray ? "]" : "}";
            return j != -1 ? objStr : null;       
        case "number":
        case "boolean":
        case "bigint":
            if (!FEJson && key != null && key[0] != NBT_INT[0] && key[0] != NBT_INT_ARRAY[0]) {
                return obj.toString() + key[0].toLowerCase();
            }
            return obj.toString();
        default:
            return `"${obj.toString()}"`;
    }
}
var hiddenChatSender = Server.getServer().doAs(null, true);
function onTestMenu(player: mc.entity.EntityPlayer, clickSlot: int, clickFlag: int, clickType: String, inventory: mc.item.Inventory, itemstack: mc.item.ItemStack) : mc.item.ItemStack {
    var sender = player.asCommandSender();
    //Server.chat("a=" + clickSlot + ", b=" + clickFlag + ", c=" + clickType + ", d=" + inventory.getSize());        
    var crateKey = inventory.getName();    
    var handItem = player.getInventory().getCurrentItem();
    
    if (clickType == "PICKUP" && crateKey!= "container.inventory" && itemstack != mc.item.ItemStack.EMPTY) {
        var handNbt = getNbt(handItem);                       
        if (handNbt["I:selecteditems"] == null) {
            handNbt["I:selecteditems"] = [];
        }        
        var _nbt = getNbt(itemstack);
        if (itemstack.getItem() == crateItem) {
            handNbt["I:selecteditems"].push(_nbt["i:itemdefindex"]);
            //Reveal Item
            if (handNbt["I:selecteditems"].length <= config.crates[crateKey].pickNumber) {
                var itemDef = config.crates[crateKey].items[_nbt["i:itemdefindex"].toString()];         
                var meta : int = itemDef["meta"];
                if (meta == null) {
                    meta = 0;
                }
                var newItemstack = new mc.item.ItemStack(mc.item.Item.get(itemDef.name), itemDef.action == Actions.giveItem ? itemDef.amount : 1, meta);                
                setNbt(newItemstack, itemDef.action == Actions.giveItem && itemDef.tag != null ? itemDef.tag : _nbt);
                inventory.setStackInSlot(clickSlot, newItemstack);
                //Server.chatConfirm(JSON.stringify(handNbt));                    
                setNbt(handItem, handNbt);
            }
            if (handNbt["I:selecteditems"].length == config.crates[crateKey].pickNumber) {
                for (var i in handNbt["I:selecteditems"]) {
                    var itemDef = config.crates[crateKey].items[handNbt["I:selecteditems"][i].toString()];
                    
                    var headerMsg = `A${"aeiouAEIOU".search(crateKey[0]) != -1 ? "n" : ""} ${FirstLetterToUpper(crateKey)} Chest gave`;

                    if (+itemDef.action == Actions.giveItem) {
                        var meta : int = itemDef["meta"];
                        if (meta == null) {
                            meta = 0;
                        }
                        //Server.chatConfirm(nbtString);
                        let stack = new mc.item.ItemStack(mc.item.Item.get(itemDef.name), itemDef.amount, meta);
                        if (itemDef.tag != null) {
                            setNbt(stack, JSON.parse(toJson(itemDef.tag)));
                        }
                        player.getInventory().addItemStackToInventory(stack);
                        let displayName = stack.getDisplayName();
                        if (config.broadcastItemGifts) {
                            Server.chatConfirm(`${headerMsg} ${displayName} to ${sender.getName()}`);
                        } else {
                            sender.chatConfirm(`A${("aeiouAEIOU".search(displayName[0]) != -1 ? "n " : " ") + displayName} has been added to your inventory!`);
                        }
                    } else if (+itemDef.action == Actions.giveKit) {
                        var ident = FEServer.getUserIdent(player.getUuid());

                        Server.tryRunCommand(hiddenChatSender, "fekit", itemDef.kit, "give", sender.getName());
                        if (config.broadcastItemGifts) {
                            Server.chatConfirm(`${headerMsg} a ${itemDef.kit} Kit to ${sender.getName()}`);
                        } else {
                            sender.chatConfirm(`You recived the ${itemDef.kit} kit!`);
                        }
                                        
                    } else if (+itemDef.action == Actions.giveMoney) {
                        Server.tryRunCommand(hiddenChatSender, "wallet", sender.getName(), "add", itemDef.amount.toString())
                        if (config.broadcastItemGifts) {
                            Server.chatConfirm(`${headerMsg} \$${itemDef.amount.toString()} Credits to ${sender.getName()}`);
                        } else {
                            sender.chatConfirm(`\$${itemDef.amount.toString()} Credits were added to your account!`)
                        }
                    } else if (+itemDef.action == Actions.crateKey) {
                        Server.tryRunCommand(hiddenChatSender, "give", sender.getName(), config.crateKey, 1, 0, `{display:{Name:"${FirstLetterToUpper(itemDef.crate)} Key"},crate:"${itemDef.crate}"}`);
                        if (config.broadcastItemGifts) {
                            Server.chatConfirm(`${headerMsg} ${FirstLetterToUpper(itemDef.crate)} Key to ${sender.getName()}`)
                        } else {
                            sender.chatConfirm(`You won a  ${FirstLetterToUpper(itemDef.crate)} Key!`)
                        }
                    }
                }
                //Remove key from player
                handItem.setStackSize(handItem.getStackSize()-1);
                //Never Run closeScreen() from this callback method!
                FEServer.AddCoRoutine(1, 60, "closeScreen", sender);
            }
        }
    } else if (clickType == "CLOSE") {
        //Remove nbt data on a seperate thread to prevent a desync
        setTimeout(function() {
            var handNbt = getNbt(handItem);
            if (handNbt != null && handNbt["I:selecteditems"] != null) {
                delete handNbt["I:selecteditems"];
                setNbt(handItem, handNbt);
            }
        }, 1);
    } else if (clickType == "QUICK_MOVE") {                    
        //Return itemstack to block quick_move operation
        return itemstack;
    } 
    return mc.item.ItemStack.EMPTY;
}

function closeScreen(sender: mc.ICommandSender) {
    if (sender) {
        let player = sender.getPlayer();
        player.closeScreen();
    }
}