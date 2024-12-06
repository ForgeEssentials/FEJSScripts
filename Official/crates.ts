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
} else {
    Server.chatError("Config File 'crates.json' Not found!");
    var config : any = {
        crates: {
            basic: {
                items: [
                    {
                        name: "minecraft:iron_nugget",
                        tag: {
                            
                        },
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
                ],
                pickNumber: 3
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
                      action: 3.0,
                      crate: "diamond",
                      chance: 45
                    }
                ],
                pickNumber: 2
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
                      action: 3.0,
                      crate: "diamond",
                      chance: 15
                    }
                ],
                pickNumber: 1
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
    
    for (var index in config.definitions) {
        
        let definition = config.definitions[index];
        if (pos.getX() == definition.position.x
            && pos.getY() == definition.position.y
            && pos.getZ() == definition.position.z
            && dim == definition.position.dim && right) {
                event.setCanceled(true);

                let crate = config.crates[definition.crate];
                let cdata = JSON.stringify(crate);
                if (handItem.getItem().getName() != config.crateKey) 
                {
                    sender.chatError("You need a key in your hand to open this!")
                    return;
                }
                
                
                //Note: This method is not exposed to typescript and must be added manually to mc.d.ts to transpile!
                //Server.chatConfirm(handItem._getNbt());
                if (getNbt(handItem)["S:crate"] != definition.crate) {
                    sender.chatError(`You need a ${FirstLetterToUpper(definition.crate)} Key to open this crate!`)
                    return;
                }                
                //Server.chatConfirm("Crate (" + definition.crate + "): " + (cdata != undefined ? cdata : crate));
                openMenu(sender, definition.crate);
        }
    }
});

function openMenu(sender: mc.ICommandSender, crate: string) {
    if (sender && sender.getPlayer() != null) {
        
        let items = []
        for (var i in config.crates[crate].items) {
            var itemDef = config.crates[crate].items[i];
            var item = new mc.item.ItemStack(crateItem, 1);
            setNbt(item, {"i:itemdefindex":i,"c:display":{"S:Lore":[getActionLore(itemDef.action)]}});

            items.push(item);
        }
        //Hijaks a sort function to randomize the items
        items.sort(function(a, b) {
            return Math.random() * 2 - 1;
        })

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
        
            if (handNbt["I:selecteditems"].length >= config.crates[crateKey].pickNumber) {
                for (var i in handNbt["I:selecteditems"]) {
                    var itemDef = config.crates[crateKey].items[handNbt["I:selecteditems"][i].toString()];
                    
                    var headerMsg = `A${"aeiou".search(crateKey[0]) != -1 ? "n" : ""} ${FirstLetterToUpper(crateKey)} Chest gave`;

                    if (+itemDef.action == Actions.giveItem) {
                        Server.tryRunCommand(hiddenChatSender, "give", sender.getName(), itemDef.name, itemDef.amount.toString());
                        if (config.broadcastItemGifts) {
                            Server.chatConfirm(`${headerMsg} ${inventory.getStackInSlot(+i).getDisplayName()} to ${sender.getName()}`);
                        } else {
                            sender.chatConfirm(`A ${inventory.getStackInSlot(+i).getDisplayName()} has been added to your inventory!`);
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
                delete handNbt["I:selecteditems"];
                //Remove key from player
                handItem.setStackSize(handItem.getStackSize()-1);
                //Never Run closeScreen() from this callback method!
                FEServer.AddCoRoutine(1, 1, "closeScreen", sender);
            } else {
                //Reveal Item
                var itemDef = config.crates[crateKey].items[_nbt["i:itemdefindex"].toString()];         
                var newItemstack = new mc.item.ItemStack(mc.item.Item.get(itemDef.name), itemDef.action == Actions.giveItem ? itemDef.amount : 1);
                setNbt(newItemstack, _nbt);
                inventory.setStackInSlot(clickSlot, newItemstack);            
                //Server.chatConfirm(JSON.stringify(handNbt));                
            }        
            setNbt(handItem, handNbt);
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

function removeNbt(sender: mc.ICommandSender, handItem: mc.item.ItemStack) {
    var handNbt = getNbt(handItem);
    delete handNbt["I:selecteditems"];
    setNbt(handItem, handNbt); 
}
function closeScreen(sender: mc.ICommandSender) {
    if (sender) {
        let player = sender.getPlayer();
        player.closeScreen();
    }
}