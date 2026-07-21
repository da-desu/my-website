/*
============================================================
inventory.js
Version 0.11.9.2

役割
・取得済みアイテムの表示
・少し長押しして並べ替える操作
・アイテム同士を重ねる合成
・赤ペン＋青ペン → 紫のインク
・レシート＋ハンドクリーム → 女神へのレシート
============================================================
*/

"use strict";

const INVENTORY_META_KEY = "nazotokiInventoryMetaV0119";
const INVENTORY_HOLD_TIME = 430;
const INVENTORY_MOVE_CANCEL_DISTANCE = 10;

const ITEM_PRESENTATIONS = {
    "寿司屋への地図": {
        icon: "▧",
        description: "海辺から寿司屋までの道が描かれた地図。"
    },
    "醤油": {
        icon: "瓶",
        description: "大将から受け取った醤油。寿司屋では「むらさき」とも呼ばれる。"
    },
    "赤ペン": {
        icon: "赤",
        description: "桜の木の下の女の子から受け取った赤いペン。"
    },
    "青ペン": {
        icon: "青",
        description: "桜の木の下の女の子から受け取った青いペン。"
    },
    "紫のインク": {
        icon: "紫",
        description: "赤ペンと青ペンを重ねて作った紫のインク。"
    },
    "ハンドクリーム": {
        icon: "香",
        description: "電柱の看板から受け取った、ノスタルジックな香りのハンドクリーム。"
    },
    "レシート": {
        icon: "紙",
        description: "感熱紙で出てきている。"
    },
    "女神へのレシート": {
        icon: "女",
        description: "印字が消え、「女神に会いに行ってね」という文字だけが残ったレシート。"
    },
    "いぶしぎん": {
        icon: "銀",
        description: "渋い輝きを放つ銀。"
    }
};

let inventoryDragState = null;

function readInventoryMeta() {
    try {
        const parsed = JSON.parse(localStorage.getItem(INVENTORY_META_KEY) || "null");
        return {
            order: Array.isArray(parsed?.order) ? parsed.order : [],
            consumed: Array.isArray(parsed?.consumed) ? parsed.consumed : []
        };
    } catch (error) {
        console.warn("持ち物の並び順を読み込めませんでした。", error);
        return { order: [], consumed: [] };
    }
}

function writeInventoryMeta(meta) {
    localStorage.setItem(INVENTORY_META_KEY, JSON.stringify({
        order: Array.from(new Set(meta.order || [])),
        consumed: Array.from(new Set(meta.consumed || []))
    }));
}

function getRawInventoryItems() {
    if (typeof window.getSaveData !== "function") {
        return [];
    }

    const saveData = window.getSaveData();
    return Array.isArray(saveData?.items) ? saveData.items.slice() : [];
}

function getInventoryItems() {
    const meta = readInventoryMeta();
    const consumed = new Set(meta.consumed);
    const rawItems = Array.from(new Set(getRawInventoryItems()))
        .filter(itemName => !consumed.has(itemName));

    const ordered = [];

    meta.order.forEach(itemName => {
        if (rawItems.includes(itemName) && !ordered.includes(itemName)) {
            ordered.push(itemName);
        }
    });

    rawItems.forEach(itemName => {
        if (!ordered.includes(itemName)) {
            ordered.push(itemName);
        }
    });

    if (JSON.stringify(ordered) !== JSON.stringify(meta.order)) {
        meta.order = ordered;
        writeInventoryMeta(meta);
    }

    return ordered;
}

function hasUsableItem(itemName) {
    return getInventoryItems().includes(itemName);
}

function addInventoryItem(itemName) {
    if (typeof itemName !== "string" || !itemName) {
        return;
    }

    const meta = readInventoryMeta();
    meta.consumed = meta.consumed.filter(name => name !== itemName);

    const alreadySaved = typeof window.hasItem === "function"
        ? window.hasItem(itemName)
        : getRawInventoryItems().includes(itemName);

    if (!alreadySaved && typeof window.addItem === "function") {
        window.addItem(itemName);
    }

    if (!meta.order.includes(itemName)) {
        meta.order.push(itemName);
    }

    writeInventoryMeta(meta);
}

function obtainItem(itemName) {
    addInventoryItem(itemName);
    renderInventory();
    document.dispatchEvent(new CustomEvent("inventory:changed"));
}

function consumeInventoryItems(itemNames) {
    const meta = readInventoryMeta();

    itemNames.forEach(itemName => {
        if (!meta.consumed.includes(itemName)) {
            meta.consumed.push(itemName);
        }
        meta.order = meta.order.filter(name => name !== itemName);
    });

    writeInventoryMeta(meta);
}

function setInventoryMessage(text, type = "") {
    const message = document.getElementById("inventoryCraftMessage");
    if (!message) return;

    message.textContent = text;
    message.classList.remove("is-error", "is-success");
    if (type) message.classList.add(`is-${type}`);
}

function normalizeRecipePair(first, second) {
    return [first, second].sort((a, b) => a.localeCompare(b, "ja")).join("::");
}


let finalReceiptForceTransitionPromise = null;

function showPreFinalStoryDirectlyV01192() {
    const target = document.getElementById("scene-pre-final-story");
    if (!target) {
        console.error("FINAL前ストーリーのシーンが見つかりません。");
        return false;
    }

    document.querySelectorAll(".scene").forEach(scene => {
        scene.classList.remove("is-active");
        scene.hidden = true;
        scene.setAttribute("aria-hidden", "true");
    });

    const transitionLayer = document.getElementById("transitionLayer");
    if (transitionLayer) {
        transitionLayer.classList.remove("is-visible");
        transitionLayer.style.transitionDuration = "";
    }

    target.hidden = false;
    target.setAttribute("aria-hidden", "false");
    target.scrollTop = 0;

    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
            target.classList.add("is-active");
        });
    });

    if (window.SceneManager) {
        window.SceneManager.currentScene = "pre-final-story";
    }

    window.saveCurrentScene?.("pre-final-story");
    window.scrollTo?.(0, 0);
    return true;
}

async function forcePreFinalStoryTransitionV01192() {
    const target = document.getElementById("scene-pre-final-story");

    if (target && !target.hidden && target.classList.contains("is-active")) {
        return true;
    }

    if (finalReceiptForceTransitionPromise) {
        return finalReceiptForceTransitionPromise;
    }

    finalReceiptForceTransitionPromise = (async () => {
        closeInventory();

        const panel = document.getElementById("inventoryPanel");
        if (panel) {
            panel.hidden = true;
            panel.setAttribute("aria-hidden", "true");
            panel.style.display = "none";
        }

        await new Promise(resolve => {
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(resolve);
            });
        });

        try {
            if (window.SceneManager && typeof window.SceneManager.changeScene === "function") {
                await window.SceneManager.changeScene("pre-final-story", {
                    fadeOutTime: 520,
                    blackTime: 240,
                    fadeInTime: 720
                });
            }
        } catch (error) {
            console.error("通常の画面遷移に失敗したため、直接表示へ切り替えます。", error);
        }

        const transitioned = target && !target.hidden;
        if (!transitioned) {
            showPreFinalStoryDirectlyV01192();
        }

        if (panel) {
            panel.style.display = "";
        }

        return true;
    })().finally(() => {
        finalReceiptForceTransitionPromise = null;
    });

    return finalReceiptForceTransitionPromise;
}

function combineInventoryItems(first, second) {
    const pair = normalizeRecipePair(first, second);
    const penPair = normalizeRecipePair("赤ペン", "青ペン");
    const receiptPair = normalizeRecipePair("レシート", "ハンドクリーム");

    if (pair === penPair) {
        if (hasUsableItem("紫のインク")) {
            setInventoryMessage("紫のインクは、すでに作ってある。", "success");
            return true;
        }

        const meta = readInventoryMeta();
        const firstIndex = Math.min(
            meta.order.indexOf("赤ペン") === -1 ? Number.MAX_SAFE_INTEGER : meta.order.indexOf("赤ペン"),
            meta.order.indexOf("青ペン") === -1 ? Number.MAX_SAFE_INTEGER : meta.order.indexOf("青ペン")
        );

        consumeInventoryItems(["赤ペン", "青ペン"]);
        addInventoryItem("紫のインク");

        const nextMeta = readInventoryMeta();
        nextMeta.order = nextMeta.order.filter(name => name !== "紫のインク");
        nextMeta.order.splice(Number.isFinite(firstIndex) ? firstIndex : nextMeta.order.length, 0, "紫のインク");
        writeInventoryMeta(nextMeta);

        setInventoryMessage("赤と青が重なり、「紫のインク」ができた。", "success");
        renderInventory();
        document.dispatchEvent(new CustomEvent("inventory:changed"));
        return true;
    }

    if (pair === receiptPair) {
        if (hasUsableItem("女神へのレシート")) {
            setInventoryMessage("レシートには、もう女神への言葉だけが残っている。", "success");
            window.setTimeout(() => {
                void forcePreFinalStoryTransitionV01192();
            }, 180);
            return true;
        }

        const meta = readInventoryMeta();
        const receiptIndex = meta.order.indexOf("レシート");

        consumeInventoryItems(["レシート"]);
        addInventoryItem("女神へのレシート");

        const nextMeta = readInventoryMeta();
        nextMeta.order = nextMeta.order.filter(name => name !== "女神へのレシート");
        nextMeta.order.splice(receiptIndex >= 0 ? receiptIndex : nextMeta.order.length, 0, "女神へのレシート");
        writeInventoryMeta(nextMeta);

        setInventoryMessage("印字が消え、「女神に会いに行ってね」という文字だけが残った。", "success");
        renderInventory();
        document.dispatchEvent(new CustomEvent("inventory:changed"));
        document.dispatchEvent(new CustomEvent("inventory:finalReceiptReady"));

        window.setTimeout(() => {
            void forcePreFinalStoryTransitionV01192();
        }, 720);

        return true;
    }

    return false;
}

function reorderInventory(sourceName, targetName) {
    if (!sourceName || !targetName || sourceName === targetName) return;

    const meta = readInventoryMeta();
    const current = getInventoryItems();
    const next = current.filter(name => name !== sourceName);
    const targetIndex = next.indexOf(targetName);

    if (targetIndex === -1) {
        next.push(sourceName);
    } else {
        next.splice(targetIndex, 0, sourceName);
    }

    meta.order = next;
    writeInventoryMeta(meta);
    setInventoryMessage("持ち物の順番を入れ替えた。", "success");
    renderInventory();
}

function createInventoryRow(itemName) {
    const presentation = ITEM_PRESENTATIONS[itemName] || {
        icon: "◇",
        description: ""
    };

    const row = document.createElement("div");
    row.className = "inventory-list__item";
    row.dataset.itemName = itemName;
    row.tabIndex = 0;
    row.setAttribute("role", "listitem");
    row.setAttribute("aria-label", `${itemName}。少し長押しして動かせます。`);

    const icon = document.createElement("span");
    icon.className = "inventory-list__icon";
    icon.textContent = presentation.icon;

    const textArea = document.createElement("div");
    textArea.className = "inventory-list__text";

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

    const grip = document.createElement("span");
    grip.className = "inventory-list__grip";
    grip.setAttribute("aria-hidden", "true");
    grip.textContent = "⋮⋮";

    row.append(icon, textArea, grip);
    installInventoryHoldDrag(row);
    return row;
}

function renderInventory() {
    const items = getInventoryItems();
    const button = document.getElementById("inventoryButton");
    const count = document.getElementById("inventoryCount");
    const list = document.getElementById("inventoryList");

    if (button) button.hidden = items.length === 0;
    if (count) count.textContent = String(items.length);
    if (!list) return;

    list.replaceChildren();
    list.setAttribute("role", "list");

    if (items.length === 0) {
        const empty = document.createElement("p");
        empty.className = "inventory-list__empty";
        empty.textContent = "まだ何も持っていない。";
        list.appendChild(empty);
        return;
    }

    items.forEach(itemName => list.appendChild(createInventoryRow(itemName)));
}

function installInventoryHoldDrag(row) {
    let holdTimer = null;
    let startX = 0;
    let startY = 0;
    let pointerId = null;

    function cancelHold() {
        if (holdTimer !== null) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
        row.classList.remove("is-hold-pending");
    }

    row.addEventListener("contextmenu", event => event.preventDefault());

    row.addEventListener("pointerdown", event => {
        if (inventoryDragState) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;

        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        row.classList.add("is-hold-pending");

        holdTimer = window.setTimeout(() => {
            holdTimer = null;
            beginInventoryDrag(row, event);
        }, INVENTORY_HOLD_TIME);
    });

    row.addEventListener("pointermove", event => {
        if (pointerId !== event.pointerId) return;

        if (!inventoryDragState) {
            const distance = Math.hypot(event.clientX - startX, event.clientY - startY);
            if (distance > INVENTORY_MOVE_CANCEL_DISTANCE) cancelHold();
            return;
        }

        if (inventoryDragState.source !== row) return;
        event.preventDefault();
        moveInventoryDrag(event.clientX, event.clientY);
    });

    const end = event => {
        if (pointerId !== event.pointerId) return;
        cancelHold();

        if (inventoryDragState?.source === row) {
            event.preventDefault();
            finishInventoryDrag(event.clientX, event.clientY);
        }

        pointerId = null;
    };

    row.addEventListener("pointerup", end);
    row.addEventListener("pointercancel", end);
}

function beginInventoryDrag(row, initialEvent) {
    const rect = row.getBoundingClientRect();
    const ghost = row.cloneNode(true);
    ghost.classList.add("inventory-drag-ghost");
    ghost.classList.remove("is-hold-pending");
    ghost.style.width = `${rect.width}px`;
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    document.body.appendChild(ghost);

    inventoryDragState = {
        source: row,
        sourceName: row.dataset.itemName,
        ghost,
        offsetX: initialEvent.clientX - rect.left,
        offsetY: initialEvent.clientY - rect.top,
        target: null
    };

    row.classList.remove("is-hold-pending");
    row.classList.add("is-drag-source");
    row.setPointerCapture?.(initialEvent.pointerId);
    setInventoryMessage("重ねるか、別の位置へ動かそう。", "");
}

function moveInventoryDrag(clientX, clientY) {
    const state = inventoryDragState;
    if (!state) return;

    state.ghost.style.left = `${clientX - state.offsetX}px`;
    state.ghost.style.top = `${clientY - state.offsetY}px`;

    document.querySelectorAll(".inventory-list__item.is-drop-target")
        .forEach(element => element.classList.remove("is-drop-target"));

    const beneath = document.elementFromPoint(clientX, clientY);
    const target = beneath?.closest?.(".inventory-list__item");

    if (target && target !== state.source) {
        target.classList.add("is-drop-target");
        state.target = target;
    } else {
        state.target = null;
    }
}

function finishInventoryDrag(clientX, clientY) {
    const state = inventoryDragState;
    if (!state) return;

    moveInventoryDrag(clientX, clientY);

    const targetName = state.target?.dataset.itemName || "";
    const sourceName = state.sourceName;

    state.source.classList.remove("is-drag-source");
    state.target?.classList.remove("is-drop-target");
    state.ghost.remove();
    inventoryDragState = null;

    if (!targetName || targetName === sourceName) {
        setInventoryMessage("", "");
        return;
    }

    if (!combineInventoryItems(sourceName, targetName)) {
        reorderInventory(sourceName, targetName);
    }
}

function openInventory() {
    const panel = document.getElementById("inventoryPanel");
    if (!panel) return;

    renderInventory();
    setInventoryMessage("", "");
    panel.style.display = "";
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
}

function closeInventory() {
    const panel = document.getElementById("inventoryPanel");
    if (panel) {
        panel.hidden = true;
        panel.setAttribute("aria-hidden", "true");
    }
}

function initializeInventory() {
    document.getElementById("inventoryButton")?.addEventListener("click", openInventory);
    document.getElementById("inventoryCloseButton")?.addEventListener("click", closeInventory);
    document.getElementById("inventoryBackdrop")?.addEventListener("click", closeInventory);
    renderInventory();
}

/* 最初から遊ぶ時は、並び順・合成状態も初期化します。 */
const resetSaveBeforeInventoryV0119 = window.resetSave;
if (typeof resetSaveBeforeInventoryV0119 === "function") {
    window.resetSave = function resetSaveWithInventoryV0119() {
        resetSaveBeforeInventoryV0119();
        localStorage.removeItem(INVENTORY_META_KEY);
        renderInventory();
    };
}

document.addEventListener("DOMContentLoaded", initializeInventory);

window.obtainItem = obtainItem;
window.renderInventory = renderInventory;
window.getUsableInventoryItems = getInventoryItems;
window.hasUsableItem = hasUsableItem;
window.combineInventoryItems = combineInventoryItems;
window.closeInventory = closeInventory;
window.forcePreFinalStoryTransition = forcePreFinalStoryTransitionV01192;
