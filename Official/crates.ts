//A very simple barebones crate script as an example of some of the more complex things you can do on 1.12
//This relys on inprogress scripting inprovements and will currently only work on builds from the `1.12.2/scripting-improvements` branch.

// note: add `_getNbt(): string;` and `_setNbt(nbt: string): void;` to mc.Item.ItemStack in mc.d.ts in order to transpile this script since these methods are not exposed to typescript
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
                ]
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
                ]
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
                ]
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
function onSigninteract(sender: mc.ICommandSender, data: any) {
    
    if (sender.getPlayer() == null) {
        return;
    }

    var handItem = sender.getPlayer().getInventory().getCurrentItem();
    
    for (var index in config.definitions) {
        
        let definition = config.definitions[index];
        if (data.x == definition.position.x
            && data.y == definition.position.y 
            && data.z == definition.position.z
            && data.dim == definition.position.dim) {
                let crate = config.crates[definition.crate];
                let cdata = JSON.stringify(crate);
                if (handItem.getItem().getName() != config.crateKey) 
                {
                    sender.chatError("You need a key in your hand to open this!")
                    return;
                }
                
                
                //Note: This method is not exposed to typescript and must be added manually to mc.d.ts to transpile!
                //Server.chatConfirm(handItem._getNbt());
                if (JSON.parse(handItem._getNbt())["S:crate"] != definition.crate) {
                    sender.chatError(`You need a ${FirstLetterToUpper(definition.crate)} Key to open this crate!`)
                    return;
                }                
                //Server.chatConfirm("Crate (" + definition.crate + "): " + (cdata != undefined ? cdata : crate));
                openMenu(sender, definition.crate);
        }
    }
}

function openMenu(sender: mc.ICommandSender, crate: string) {
    if (sender && sender.getPlayer() != null) {
        
        let items = []
        for (var i in config.crates[crate].items) {
            var itemDef = config.crates[crate].items[i];
            var item = new mc.item.ItemStack(Item.get(itemDef.name), 1);
            item._setNbt(`{"i:itemdefindex":${i},"c:display":{"S:Lore":["${getActionLore(itemDef.action)}"]}}`)

            if (+itemDef.action == Actions.giveItem) {
                item.setStackSize(itemDef.amount);
            }
            if (Math.random()*100 <= itemDef.chance) {
            //item.setDisplayName()
                items.push(item);
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

var hiddenChatSender = Server.getServer().doAs(null, true);
function onTestMenu(player: mc.entity.EntityPlayer, clickSlot: int, clickFlag: int, clickType: String, inventory: mc.item.Inventory, itemstack: mc.item.ItemStack) {
    var sender = player.asCommandSender();
    //sender.chat("a=" + clickSlot + ", b=" + clickFlag + ", c=" + clickType + ", d=" + inventory.getSize());        
    var crateKey = inventory.getName();
    if (clickType == "PICKUP" && crateKey!= "container.inventory" && itemstack != null) {               
        var itemDef = config.crates[crateKey].items[JSON.parse(itemstack._getNbt())["i:itemdefindex"].toString()];        
        var headerMsg = `A${"aeiou".search(crateKey[0]) != -1 ? "n" : ""} ${FirstLetterToUpper(crateKey)} Chest gave`;
        //TODO: Perhaps replace chatConfirms below to sender...  (Is it important to send a global message everytime a player gets a crate reward?)
        if (+itemDef.action == Actions.giveItem) {
            Server.tryRunCommand(hiddenChatSender, "give", sender.getName(), itemDef.name, itemDef.amount.toString());
            if (config.broadcastItemGifts) {
                Server.chatConfirm(`${headerMsg} ${inventory.getStackInSlot(clickSlot).getDisplayName()} to ${sender.getName()}`);
            } else {
                sender.chatConfirm(`A ${inventory.getStackInSlot(clickSlot).getDisplayName()} has been added to your inventory!`);
            }
        } else if (+itemDef.action == Actions.giveKit) {
            var ident = FEServer.getUserIdent(player.getUuid());

            //This logic below is commented out and was the earlier method but after determing we needed to grant permission to use a kit
            //It followed to simply grant permission to bypass cooldown as well
            //var info = ident.getPlayerInfo();
            //var timeoutName = "KIT_" + itemDef.kit;
            //var timeout = info.getRemainingTimeout(timeoutName);
            //info.removeTimeout(timeoutName)
            //main command logic went here
            //info.startTimeout(timeoutName, timeout)
            
            // Permissions.setPlayerPermission(ident, "fe.commands.kit.bypasscooldown", true);
            // Permissions.setPlayerPermission(ident, `fe.commands.kit.${itemDef.kit}`, true);
            //Server.getServer().chatConfirm("Granted perm");
            Server.tryRunCommand(hiddenChatSender, "fekit", itemDef.kit, "give", sender.getName());
            if (config.broadcastItemGifts) {
                Server.chatConfirm(`${headerMsg} a ${itemDef.kit} Kit to ${sender.getName()}`);
            } else {
                sender.chatConfirm(`You recived the ${itemDef.kit} kit!`);
            }
            
            //Clears permission by setting it to null -- this needs to be a slight timeout to give the kit command time to run
            //Note: the difference between setting a timeout and calling a coroutine is a coroutine is guaranteed to run on the next tick.  a timeout is not.
            //In this specific example, we don't need to wait a full tick, 5 ms is sufficent for the command to finish.
            // setTimeout(function() {
            //     Permissions.setPlayerPermissionProperty(ident, "fe.commands.kit.bypasscooldown", null);
            //     Permissions.setPlayerPermissionProperty(ident, `fe.commands.kit.${itemDef.kit}`, null);
            //     //Server.getServer().chatConfirm("Removed perm");
            // }, 1);                        
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
        
        //Remove key from player
        var handItem = player.getInventory().getCurrentItem();
        handItem.setStackSize(handItem.getStackSize()-1);
        //Never Run closeScreen() from this callback method!
        FEServer.AddCoRoutine(1, 1, "closeScreen", sender);
    }
}

function closeScreen(sender: mc.ICommandSender) {
    if (sender) {
        let player = sender.getPlayer();
        player.closeScreen();
    }
}