/*
============================================================
scenes.js
Version 0.1

役割
・各シーン固有の動作
・TOP画面の「世界」崩壊演出
・ボタン操作
============================================================
*/


"use strict";


/* =========================================================
   1. 二重操作防止
   ========================================================= */

/*
    「はじめる」を連打しても、
    演出が複数回同時に動かないようにします。
*/
let isStarting = false;


/* =========================================================
   2. TOP画面演出
   ========================================================= */

/**
 * 「世界」の文字を崩壊させます。
 *
 * 流れ:
 * 1. ボタンを消す
 * 2. 文字を揺らす
 * 3. 文字化け
 * 4. モザイク化
 * 5. 一瞬だけ元に戻す
 * 6. INTROへ移動
 */
async function runTopOpening() {

    if (isStarting) {
        return;
    }

    isStarting = true;

    const startButton =
        document.getElementById("startButton");

    const worldWord =
        document.getElementById("worldWord");

    if (!startButton || !worldWord) {
        console.error(
            "TOP演出に必要な要素が見つかりません。"
        );
        isStarting = false;
        return;
    }


    /* -----------------------------------------------------
       Step 1: はじめるボタンを消す
       ----------------------------------------------------- */

    startButton.disabled = true;
    startButton.classList.add("is-disappearing");

    await wait(520);


    /* -----------------------------------------------------
       Step 2: 「世界」を小刻みに揺らす
       ----------------------------------------------------- */

    worldWord.classList.add("is-glitching");

    await wait(330);


    /* -----------------------------------------------------
       Step 3: 文字を段階的に崩す
       ----------------------------------------------------- */

    worldWord.textContent = "世▓";
    worldWord.classList.add("is-blurred");

    await wait(170);

    worldWord.textContent = "▉界";

    await wait(160);

    worldWord.textContent = "▓▓";
    worldWord.classList.add("is-mosaic");

    await wait(210);

    worldWord.textContent = "██";

    await wait(190);


    /* -----------------------------------------------------
       Step 4: ごく短い文字化け
       -----------------------------------------------------

       読み取れるかどうか程度の短さで表示します。
       後から別の言葉へ変更することもできます。
    */

    worldWord.textContent = "？？";

    await wait(72);


    /* -----------------------------------------------------
       Step 5: 一瞬だけ元の「世界」に戻す
       ----------------------------------------------------- */

    worldWord.classList.remove(
        "is-glitching",
        "is-blurred",
        "is-mosaic"
    );

    worldWord.textContent = "世界";
    worldWord.classList.add("is-restored");

    await wait(300);


    /* -----------------------------------------------------
       Step 6: INTROへ移動
       ----------------------------------------------------- */

    await SceneManager.changeScene(
        "intro",
        {
            fadeOutTime: 780,
            blackTime: 420,
            fadeInTime: 900
        }
    );

    /*
        次回TOPへ戻った際に再生できるよう、
        TOP用の状態を初期状態へ戻します。
    */
    resetTopScene();

    isStarting = false;
}


/* =========================================================
   3. TOP画面を初期状態に戻す
   ========================================================= */

function resetTopScene() {

    const startButton =
        document.getElementById("startButton");

    const worldWord =
        document.getElementById("worldWord");

    if (startButton) {
        startButton.disabled = false;
        startButton.classList.remove(
            "is-disappearing"
        );
    }

    if (worldWord) {
        worldWord.textContent = "世界";

        worldWord.classList.remove(
            "is-glitching",
            "is-blurred",
            "is-mosaic",
            "is-restored"
        );
    }
}


/* =========================================================
   4. シーン初期化
   ========================================================= */

/**
 * 各ボタンへイベントを登録します。
 * game.jsのDOMContentLoadedから呼び出されます。
 */
function initializeScenes() {

    const startButton =
        document.getElementById("startButton");

    const backToTopButton =
        document.getElementById("backToTopButton");


    /* はじめるボタン */
    if (startButton) {
        startButton.addEventListener(
            "click",
            runTopOpening
        );
    }


    /* INTROからTOPへ戻る開発確認用ボタン */
    if (backToTopButton) {
        backToTopButton.addEventListener(
            "click",
            async function () {

                await SceneManager.changeScene(
                    "top",
                    {
                        fadeOutTime: 520,
                        blackTime: 160,
                        fadeInTime: 620
                    }
                );

                resetTopScene();
            }
        );
    }

}


/* =========================================================
   5. game.jsから使えるように公開
   ========================================================= */

window.initializeScenes = initializeScenes;

