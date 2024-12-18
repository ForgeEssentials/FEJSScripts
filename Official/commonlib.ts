/**
 * Parses data in the mc nbt json format (used by give) and outputs an object in the fejson nbt format
 * @param json string in json format
 */
export function fromMcJson(json: string): any {

}

/**
 * Converts an object provided in raw json or fejson format and outputs a string representation, either in normal json or mcjson.
 * Also can be used to take a raw nashorn object and convert it to a canoncial object that can be used by JSON.stringify
 * ex: JSON.parse(toJson(object))
 * @param obj input object
 * @param FEJson output object in normal (fe) json
 * @param key current key for recursive operations
 * @returns 
 */
export function toJson(obj : any, FEJson = true, key = null) : string {
    
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

FEServer.registerCommand({
    name: "itemdata",
    usage: "Prints FE complient data of current item",
    opOnly: true,
    permission: "fe.commands.itemdata",
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

FEServer.registerCommand({
    name: "fegive",
    usage: "Spawns an item into a players inventory using FE nbt format.",
    opOnly: true,
    permission: "fe.commands.give",
    tabComplete: function(args: fe.CommandArgs) {
        args.parsePlayer(true, true);
        args.parseItem();
        args.parseInt();
        args.parseInt();
    },
    processCommand: function(args: fe.CommandArgs) {
        if (args.isEmpty) {
            args.confirm("/fegive [player] [item] [amount] [meta]? [nbtjson]?")
        }
        let ident = args.parsePlayer(true, true);
        
        let item = args.parseItem();

        let amount = args.parseInt();
        let meta = 0;
        if (!args.isEmpty()) {
            meta = args.parseInt();
        }

        let itemstack = new mc.item.ItemStack(item, amount, meta);
        
        if (!args.isEmpty()) {
            let jsonStr = args.getAllArgs();           

            setNbt(itemstack, JSON.parse(jsonStr));
        }
        
        ident.getPlayer().getInventory().addItemStackToInventory(itemstack);
    }
})