/*
============================================================
save.js
Version 0.4

役割
・現在シーンの保存
・クリア済みステージの保存
・アイテムの保存
・続きから / 最初から
・壊れたセーブデータへの安全対策

localStorageはブラウザ内だけに保存されます。
サーバーや外部サービスは使用しません。
============================================================
*/


"use strict";


/* =========================================================
   1. セーブ設定
   ========================================================= */

const SAVE_KEY = "nazotoki_save_v2";

const DEFAULT_SAVE_DATA = {
    version: 2,
    currentScene: "top",
    clearedStages: [],
    items: [],
    hasStarted: false,
    updatedAt: null
};


/*
    保存可能なシーンの一覧です。
    不正な文字列を保存・復元しないために使用します。
*/
const SAVEABLE_SCENES = new Set([
    "intro",
    "stage1",
    "stage1-clear",
    "stage2",
    "stage2-clear",
    "stage3",
    "stage3-clear",
    "stage4",
    "stage4-clear",
    "stage5"
]);


/* =========================================================
   2. データ整形
   ========================================================= */

/**
 * セーブデータを安全な形へ整えます。
 *
 * @param {object} source
 * @returns {object}
 */
function normalizeSaveData(source) {

    const data = Object.assign(
        {},
        DEFAULT_SAVE_DATA,
        source || {}
    );

    if (
        !SAVEABLE_SCENES.has(
            data.currentScene
        )
    ) {
        data.currentScene = "top";
    }

    if (!Array.isArray(data.clearedStages)) {
        data.clearedStages = [];
    }

    if (!Array.isArray(data.items)) {
        data.items = [];
    }

    data.clearedStages = Array.from(
        new Set(
            data.clearedStages.filter(
                Number.isFinite
            )
        )
    );

    data.items = Array.from(
        new Set(
            data.items.filter(function (item) {
                return (
                    typeof item === "string" &&
                    item.length > 0
                );
            })
        )
    );

    data.hasStarted =
        Boolean(data.hasStarted);

    return data;
}


/* =========================================================
   3. 読み込み・保存
   ========================================================= */

/**
 * 現在のセーブデータを取得します。
 *
 * @returns {object}
 */
function getSaveData() {

    try {
        const raw =
            window.localStorage.getItem(
                SAVE_KEY
            );

        if (!raw) {
            return normalizeSaveData(
                DEFAULT_SAVE_DATA
            );
        }

        return normalizeSaveData(
            JSON.parse(raw)
        );

    } catch (error) {
        console.warn(
            "セーブデータを読み込めませんでした。",
            error
        );

        return normalizeSaveData(
            DEFAULT_SAVE_DATA
        );
    }
}


/**
 * セーブデータを保存します。
 *
 * @param {object} source
 */
function saveData(source) {

    const data = normalizeSaveData(source);

    data.updatedAt =
        new Date().toISOString();

    try {
        window.localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(data)
        );

    } catch (error) {
        console.warn(
            "進行状況を保存できませんでした。",
            error
        );
    }
}


/* =========================================================
   4. 現在シーン
   ========================================================= */

/**
 * 現在のシーンを保存します。
 *
 * TOPと再開確認画面は保存しません。
 *
 * @param {string} sceneName
 */
function saveCurrentScene(sceneName) {

    if (!SAVEABLE_SCENES.has(sceneName)) {
        return;
    }

    const data = getSaveData();

    data.currentScene = sceneName;
    data.hasStarted = true;

    saveData(data);
}


/**
 * 続きから開始できるか確認します。
 *
 * @returns {boolean}
 */
function hasResumeData() {

    const data = getSaveData();

    return (
        data.hasStarted === true &&
        SAVEABLE_SCENES.has(
            data.currentScene
        )
    );
}


/**
 * 保存されている再開シーンを取得します。
 *
 * @returns {string}
 */
function getResumeScene() {

    const data = getSaveData();

    if (!hasResumeData()) {
        return "top";
    }

    return data.currentScene;
}


/* =========================================================
   5. ステージクリア
   ========================================================= */

/**
 * ステージクリアを保存します。
 *
 * 以前作成したpuzzle.jsからも呼べるよう、
 * 関数名 clearStage を維持しています。
 *
 * @param {number} stageNumber
 */
function clearStage(stageNumber) {

    if (!Number.isFinite(stageNumber)) {
        return;
    }

    const data = getSaveData();

    if (
        !data.clearedStages.includes(
            stageNumber
        )
    ) {
        data.clearedStages.push(
            stageNumber
        );
    }

    saveData(data);
}


/**
 * ステージがクリア済みか確認します。
 *
 * @param {number} stageNumber
 * @returns {boolean}
 */
function isStageCleared(stageNumber) {

    return getSaveData()
        .clearedStages
        .includes(stageNumber);
}


/* =========================================================
   6. アイテム
   ========================================================= */

function addItem(itemName) {

    if (
        typeof itemName !== "string" ||
        itemName.length === 0
    ) {
        return;
    }

    const data = getSaveData();

    if (!data.items.includes(itemName)) {
        data.items.push(itemName);
    }

    saveData(data);
}


function hasItem(itemName) {

    return getSaveData()
        .items
        .includes(itemName);
}


/* =========================================================
   7. 最初から
   ========================================================= */

/**
 * セーブデータを完全に削除します。
 */
function resetSave() {

    try {
        window.localStorage.removeItem(
            SAVE_KEY
        );

        /*
            初期版で使っていたキーも削除します。
        */
        window.localStorage.removeItem(
            "nazotoki_save"
        );

    } catch (error) {
        console.warn(
            "セーブデータを削除できませんでした。",
            error
        );
    }
}


/* =========================================================
   8. グローバル公開
   ========================================================= */

window.getSaveData = getSaveData;
window.saveData = saveData;
window.saveCurrentScene = saveCurrentScene;
window.hasResumeData = hasResumeData;
window.getResumeScene = getResumeScene;
window.clearStage = clearStage;
window.isStageCleared = isStageCleared;
window.addItem = addItem;
window.hasItem = hasItem;
window.resetSave = resetSave;

/* Version 0.8 Rebuild: 第4問内部状態 */
function getStage4State(){
    const data=getSaveData();
    const state=data.stage4State;
    return state&&typeof state==="object"
        ? Object.assign({folded:false,doorOpened:false},state)
        : {folded:false,doorOpened:false};
}
function saveStage4State(partial){
    const data=getSaveData();
    data.stage4State=Object.assign(getStage4State(),partial||{});
    saveData(data);
}
function resetStage4State(){
    const data=getSaveData();
    data.stage4State={folded:false,doorOpened:false};
    saveData(data);
}
window.getStage4State=getStage4State;
window.saveStage4State=saveStage4State;
window.resetStage4State=resetStage4State;
