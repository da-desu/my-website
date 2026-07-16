/*
============================================================
puzzle.js
Version 0.3

役割
・第一問の画像選択
・選択状態の管理
・正解判定
・正解後のシーン遷移

後から別の謎を追加する際も、このファイルへまとめます。
============================================================
*/


"use strict";


/* =========================================================
   1. 第一問の状態
   ========================================================= */

let isStage1Clearing = false;


/* =========================================================
   2. 画像タイル選択
   ========================================================= */

/**
 * 桜画像の選択状態を切り替えます。
 *
 * @param {HTMLButtonElement} tile
 */
function toggleSakuraTile(tile) {

    if (
        !tile ||
        isStage1Clearing
    ) {
        return;
    }

    const isSelected =
        tile.classList.toggle("is-selected");

    tile.setAttribute(
        "aria-pressed",
        String(isSelected)
    );

    /*
        選択を変更したら、前回のエラーメッセージを消します。
    */
    setStage1Message("", "");
}


/* =========================================================
   3. メッセージ表示
   ========================================================= */

/**
 * 第一問のメッセージを表示します。
 *
 * @param {string} text
 * @param {string} type "error" / "success" / ""
 */
function setStage1Message(
    text,
    type
) {
    const message =
        document.getElementById(
            "stage1Message"
        );

    if (!message) {
        return;
    }

    message.textContent = text;

    message.classList.remove(
        "is-error",
        "is-success"
    );

    if (type === "error") {
        message.classList.add(
            "is-error"
        );
    }

    if (type === "success") {
        message.classList.add(
            "is-success"
        );
    }
}


/* =========================================================
   4. 正解判定
   ========================================================= */

async function verifyStage1Answer() {

    if (isStage1Clearing) {
        return;
    }

    const tiles = Array.from(
        document.querySelectorAll(
            "#sakuraGrid .sakura-tile"
        )
    );

    const verifyButton =
        document.getElementById(
            "stage1VerifyButton"
        );

    if (
        tiles.length === 0 ||
        !verifyButton
    ) {
        return;
    }

    const selectedTiles =
        tiles.filter(function (tile) {
            return tile.classList.contains(
                "is-selected"
            );
        });


    /*
        1枚も選ばれていない場合
    */
    if (selectedTiles.length === 0) {
        setStage1Message(
            "画像を選択してください。",
            "error"
        );

        return;
    }


    /*
        今回は16枚すべてがソメイヨシノです。
        すべて選択されているか確認します。
    */
    const allCorrect =
        tiles.every(function (tile) {
            return (
                tile.dataset.correct === "true" &&
                tile.classList.contains(
                    "is-selected"
                )
            );
        });


    if (!allCorrect) {
        setStage1Message(
            "まだ選ばれていない桜があるようだ。",
            "error"
        );

        return;
    }


    /*
        正解処理
    */
    isStage1Clearing = true;
    verifyButton.disabled = true;

    setStage1Message(
        "確認できました。",
        "success"
    );

    /*
        既存のセーブ機能が読み込まれている場合のみ記録します。
        読み込まれていなくてもゲームは止まりません。
    */
    if (
        typeof window.clearStage ===
        "function"
    ) {
        window.clearStage(1);
    }

    await wait(700);

    await SceneManager.changeScene(
        "stage1-clear",
        {
            fadeOutTime: 720,
            blackTime: 260,
            fadeInTime: 960
        }
    );

    isStage1Clearing = false;
}


/* =========================================================
   5. 第一問の初期化
   ========================================================= */

function resetStage1Puzzle() {

    const tiles =
        document.querySelectorAll(
            "#sakuraGrid .sakura-tile"
        );

    const verifyButton =
        document.getElementById(
            "stage1VerifyButton"
        );

    tiles.forEach(function (tile) {
        tile.classList.remove(
            "is-selected"
        );

        tile.setAttribute(
            "aria-pressed",
            "false"
        );
    });

    if (verifyButton) {
        verifyButton.disabled = false;
    }

    setStage1Message("", "");

    isStage1Clearing = false;
}


/* =========================================================
   6. イベント登録
   ========================================================= */

function initializePuzzles() {

    const tiles =
        document.querySelectorAll(
            "#sakuraGrid .sakura-tile"
        );

    const verifyButton =
        document.getElementById(
            "stage1VerifyButton"
        );

    tiles.forEach(function (tile) {

        tile.addEventListener(
            "click",
            function () {
                toggleSakuraTile(tile);
            }
        );

    });

    if (verifyButton) {
        verifyButton.addEventListener(
            "click",
            verifyStage1Answer
        );
    }

}


/* =========================================================
   7. 他ファイルから使用できるように公開
   ========================================================= */

window.initializePuzzles =
    initializePuzzles;

window.resetStage1Puzzle =
    resetStage1Puzzle;
