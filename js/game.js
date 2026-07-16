/*
============================================================
game.js
Version 0.2

役割
・SceneManager
・シーン表示切替
・画面暗転
・待機処理
・文字送り処理
・将来の音声追加用の土台
============================================================
*/


"use strict";


/* =========================================================
   1. 共通ユーティリティ
   ========================================================= */

/**
 * 指定した時間だけ待機します。
 *
 * @param {number} milliseconds
 * @returns {Promise<void>}
 */
function wait(milliseconds) {
    return new Promise(function (resolve) {
        window.setTimeout(resolve, milliseconds);
    });
}


/**
 * 文字列を1文字ずつ表示します。
 *
 * @param {HTMLElement} targetElement 表示先
 * @param {string} text 表示する文章
 * @param {number} speed 1文字ごとの待機時間
 * @returns {Promise<void>}
 */
async function typeText(
    targetElement,
    text,
    speed
) {
    if (!targetElement) {
        return;
    }

    targetElement.textContent = "";

    /*
        Array.fromを使うことで、
        日本語や絵文字も1文字単位で安全に扱えます。
    */
    const characters = Array.from(text);

    for (const character of characters) {
        targetElement.textContent += character;

        /*
            句読点や改行の後は少し長く止め、
            機械的すぎない文字送りにします。
        */
        let delay = speed;

        if (
            character === "。" ||
            character === "、"
        ) {
            delay = speed * 4;
        }

        if (character === "\n") {
            delay = speed * 6;
        }

        await wait(delay);
    }
}


/* =========================================================
   2. SceneManager
   ========================================================= */

const SceneManager = {

    currentScene: null,


    getSceneElement: function (sceneName) {
        return document.querySelector(
            '[data-scene="' + sceneName + '"]'
        );
    },


    showImmediately: function (sceneName) {
        const nextScene = this.getSceneElement(sceneName);

        if (!nextScene) {
            console.error(
                "SceneManager: シーンが見つかりません:",
                sceneName
            );
            return;
        }

        const allScenes =
            document.querySelectorAll(".scene");

        allScenes.forEach(function (scene) {
            scene.classList.remove("is-active");
            scene.hidden = true;
            scene.setAttribute(
                "aria-hidden",
                "true"
            );
        });

        nextScene.hidden = false;
        nextScene.setAttribute(
            "aria-hidden",
            "false"
        );

        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                nextScene.classList.add("is-active");
            });
        });

        this.currentScene = sceneName;

        /*
            TOPと再開確認画面以外は、
            シーンが表示された時点で保存します。
        */
        if (
            typeof window.saveCurrentScene ===
            "function"
        ) {
            window.saveCurrentScene(
                sceneName
            );
        }

        console.log(
            "SceneManager: 現在のシーン =",
            sceneName
        );
    },


    changeScene: async function (
        sceneName,
        options
    ) {
        const settings = Object.assign(
            {
                fadeOutTime: 760,
                blackTime: 260,
                fadeInTime: 760
            },
            options || {}
        );

        const transitionLayer =
            document.getElementById(
                "transitionLayer"
            );

        if (!transitionLayer) {
            this.showImmediately(sceneName);
            return;
        }

        transitionLayer.style.transitionDuration =
            settings.fadeOutTime + "ms";

        transitionLayer.classList.add(
            "is-visible"
        );

        await wait(settings.fadeOutTime);

        this.showImmediately(sceneName);

        await wait(settings.blackTime);

        transitionLayer.style.transitionDuration =
            settings.fadeInTime + "ms";

        transitionLayer.classList.remove(
            "is-visible"
        );

        await wait(settings.fadeInTime);
    }
};


/* =========================================================
   3. 将来の音声機能
   ========================================================= */

function playBGM(filePath) {
    console.log(
        "BGM準備:",
        filePath
    );
}


function playSE(filePath) {
    console.log(
        "SE準備:",
        filePath
    );
}


/* =========================================================
   4. 初期化
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
            先に各シーンと謎のイベントを登録します。
        */
        if (
            typeof window.initializeScenes ===
            "function"
        ) {
            window.initializeScenes();
        }

        if (
            typeof window.initializePuzzles ===
            "function"
        ) {
            window.initializePuzzles();
        }


        /*
            保存データがあれば再開確認画面、
            なければTOP画面を表示します。
        */
        if (
            typeof window.hasResumeData ===
                "function" &&
            window.hasResumeData()
        ) {
            SceneManager.showImmediately(
                "resume"
            );

            if (
                typeof window.updateResumeScene ===
                "function"
            ) {
                window.updateResumeScene();
            }

        } else {
            SceneManager.showImmediately(
                "top"
            );
        }

    }
);


/* =========================================================
   5. 他ファイルから使えるように公開
   ========================================================= */

window.wait = wait;
window.typeText = typeText;
window.SceneManager = SceneManager;
window.playBGM = playBGM;
window.playSE = playSE;
