/*
============================================================
inventory.js
Version 0.9.1

役割
・取得済みアイテムの表示
・アイテムごとのアイコンと説明
・地図、醤油、隠しアイテム「いぶしぎん」に対応
============================================================
*/

"use strict";

const ITEM_PRESENTATIONS = {
    "寿司屋への地図": {
        icon: "▧",
        description: "海辺から寿司屋までの道が描かれた地図。"
    },
    "醤油": {
        icon: "瓶",
        description: "大将から受け取った醤油。"
    },
    "いぶしぎん": {
        icon: "銀",
        description: "渋い輝きを放つ銀。"
    }
};

function getInventoryItems() {
    if (typeof window.getSaveData !== "function") {
        return [];
    }

    const saveData = window.getSaveData();

    return Array.isArray(saveData.items)
        ? saveData.items
        : [];
}

function obtainItem(itemName) {
    if (typeof itemName !== "string" || itemName.length === 0) {
        return;
    }

    if (typeof window.addItem === "function") {
        window.addItem(itemName);
    }

    renderInventory();
}

function renderInventory() {
    const items = getInventoryItems();
    const button = document.getElementById("inventoryButton");
    const count = document.getElementById("inventoryCount");
    const list = document.getElementById("inventoryList");

    if (button) {
        button.hidden = items.length === 0;
    }

    if (count) {
        count.textContent = String(items.length);
    }

    if (!list) {
        return;
    }

    list.replaceChildren();

    if (items.length === 0) {
        const empty = document.createElement("p");
        empty.className = "inventory-list__empty";
        empty.textContent = "まだ何も持っていない。";
        list.appendChild(empty);
        return;
    }

    items.forEach(function (itemName) {
        const presentation = ITEM_PRESENTATIONS[itemName] || {
            icon: "◇",
            description: ""
        };

        const row = document.createElement("div");
        row.className = "inventory-list__item";

        const icon = document.createElement("span");
        icon.className = "inventory-list__icon";
        icon.textContent = presentation.icon;

        const textArea = document.createElement("div");

        const name = document.createElement("div");
        name.className = "inventory-list__name";
        name.textContent = itemName;
        textArea.appendChild(name);

        if (presentation.description) {
            const description = document.createElement("div");
            description.className = "inventory-list__description";
            description.textContent = presentation.description;
            textArea.appendChild(description);
        }

        row.appendChild(icon);
        row.appendChild(textArea);
        list.appendChild(row);
    });
}

function openInventory() {
    const panel = document.getElementById("inventoryPanel");

    if (!panel) {
        return;
    }

    renderInventory();
    panel.hidden = false;
}

function closeInventory() {
    const panel = document.getElementById("inventoryPanel");

    if (panel) {
        panel.hidden = true;
    }
}

function initializeInventory() {
    document.getElementById("inventoryButton")?.addEventListener("click", openInventory);
    document.getElementById("inventoryCloseButton")?.addEventListener("click", closeInventory);
    document.getElementById("inventoryBackdrop")?.addEventListener("click", closeInventory);
    renderInventory();
}

document.addEventListener("DOMContentLoaded", initializeInventory);

window.obtainItem = obtainItem;
window.renderInventory = renderInventory;
