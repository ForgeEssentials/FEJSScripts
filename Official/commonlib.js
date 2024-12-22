"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromMcJson = fromMcJson;
exports.toJson = toJson;
function fromMcJson(json) {
}
function toJson(obj, FEJson, key) {
    if (FEJson === void 0) { FEJson = true; }
    if (key === void 0) { key = null; }
    switch (typeof (obj)) {
        case "undefined":
            return null;
        case "object":
            if (obj == null) {
                return null;
            }
            var isArray = false;
            if (typeof (obj[0]) != "undefined") {
                isArray = true;
                var j_1 = 0;
                for (var i in obj) {
                    if (+i != j_1) {
                        isArray = false;
                    }
                    j_1++;
                }
            }
            var objStr = isArray ? "[" : "{";
            var j = -1;
            if (FEJson != null && !FEJson && isArray && key[0] != NBT_STRING[0]) {
                objStr += key[0];
                objStr += ';';
            }
            for (var i in obj) {
                j++;
                objStr += "".concat(j == 0 ? "" : ",").concat(isArray ? "" : "\"".concat(FEJson ? i : i.substring(2), "\":")).concat(toJson(obj[i], FEJson, isArray ? key : i));
            }
            objStr += isArray ? "]" : "}";
            return j != -1 ? objStr : null;
        case "number":
        case "boolean":
        case "bigint":
            if (FEJson != null && !FEJson && key != null && key[0] != NBT_INT[0] && key[0] != NBT_INT_ARRAY[0]) {
                return obj.toString() + key[0].toLowerCase();
            }
            return obj.toString();
        default:
            return "\"".concat(obj.toString(), "\"");
    }
}
FEServer.registerCommand({
    name: "itemdata",
    usage: "Prints FE complient data of current item",
    opOnly: true,
    permission: "fe.commands.itemdata",
    processCommand: function (args) {
        if (args.player == null) {
            args.sender.chatError("Must be a player!");
            return;
        }
        var FEJson = true;
        if (!args.isEmpty()) {
            FEJson = args.parseBoolean();
        }
        var item = args.player.getInventory().getCurrentItem();
        if (item != mc.item.ItemStack.EMPTY) {
            args.sender.chatConfirm("Item: ".concat(item.getItem().getName(), ", Damage/Meta: ").concat(item.getDamage(), ", Amount: ").concat(item.getStackSize()));
            var nbt = getNbt(item);
            var text = "";
            if (nbt != null) {
                text = toJson(nbt, FEJson);
            }
            else {
                text = "Item does not have nbt!";
            }
            args.sender.tellRaw("{\"text\": \"".concat(text.replace(/"/g, '\\"'), "\", \"hoverEvent\":{\"action\":\"show_item\", \"value\":\"{id:\\\"").concat(item.getItem().getName(), "\\\", Count:").concat(item.getStackSize(), "b").concat(nbt != null ? ", tag:".concat(toJson(nbt, null).replace(/"/g, '\\"')) : "", "}\"}}"));
        }
        else {
            args.sender.chatError("Hand Empty!");
        }
    }
});
FEServer.registerCommand({
    name: "showcase",
    usage: "Shares current item with server!",
    opOnly: true,
    permission: "fe.commands.showcase",
    processCommand: function (args) {
        if (args.player == null) {
            args.sender.chatError("Must be a player!");
            return;
        }
        var FEJson = true;
        if (!args.isEmpty()) {
            FEJson = args.parseBoolean();
        }
        var item = args.player.getInventory().getCurrentItem();
        if (item != mc.item.ItemStack.EMPTY) {
            var nbt = getNbt(item);
            var color = "";
            item.isDamageable;
            if (item.isItemEnchanted()) {
                color = "§b";
            }
            if (nbt != null && 'c:StoredEnchantments' in nbt) {
                color = "§e";
            }
            Server.tellRaw("{\"text\": \"\u00A7f[".concat(item.hasDisplayName() ? "" : color).concat(item.getDisplayName(), "\u00A7f]\", \"hoverEvent\":{\"action\":\"show_item\", \"value\":\"{id:\\\"").concat(item.getItem().getName(), "\\\", Count:").concat(item.getStackSize(), "b").concat(nbt != null ? ", tag:".concat(toJson(nbt, null).replace(/"/g, '\\"')) : "", "}\"}}"));
        }
        else {
            args.sender.chatError("Hand Empty!");
        }
    }
});
FEServer.registerCommand({
    name: "fegive",
    usage: "Spawns an item into a players inventory using FE nbt format.",
    opOnly: true,
    permission: "fe.commands.give",
    tabComplete: function (args) {
        args.parsePlayer(true, true);
        args.parseItem();
        args.parseInt();
        args.parseInt();
    },
    processCommand: function (args) {
        if (args.isEmpty) {
            args.confirm("/fegive [player] [item] [amount] [meta]? [nbtjson]?");
        }
        var ident = args.parsePlayer(true, true);
        var item = args.parseItem();
        var amount = args.parseInt();
        var meta = 0;
        if (!args.isEmpty()) {
            meta = args.parseInt();
        }
        var itemstack = new mc.item.ItemStack(item, amount, meta);
        if (!args.isEmpty()) {
            var jsonStr = args.getAllArgs();
            setNbt(itemstack, JSON.parse(jsonStr));
        }
        ident.getPlayer().getInventory().addItemStackToInventory(itemstack);
    }
});
