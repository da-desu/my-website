/*
============================================================
game.js
Version 0.1

役割
・SceneManager
・シーン表示切替
・画面暗転
・待機処理
・将来のBGM / 効果音追加用の土台
============================================================
*/


"use strict";


/* =========================================================
   1. 共通ユーティリティ
   ========================================================= */

/**
 * 指定した時間だけ待機します。
 *
 * @param {number} milliseconds 待機時間（ミリ秒）
 * @returns {Promise<void>}
 */
function wait(milliseconds) {
    return new Promise(function (resolve) {
        window.setTimeout(resolve, milliseconds);
    });
}


/* =========================================================
   2. SceneManager
   ========================================================= */

const SceneManager = {

    /**
     * 現在表示しているシーン名
     */
    currentScene: null,


    /**
     * シーン名からHTML要素を取得します。
     *
     * @param {string} sceneName 例: "top", "intro"
     * @returns {HTMLElement|null}
     */
    getSceneElement: function (sceneName) {
        return document.querySelector(
            '[data-scene="' + sceneName + '"]'
        );
    },


    /**
     * 指定したシーンを即座に表示します。
     * 暗転演出なしで表示したい場合に使用します。
     *
     * @param {string} sceneName
     */
    showImmediately: function (sceneName) {
        const nextScene = this.getSceneElement(sceneName);

        if (!nextScene) {
            console.error(
                "SceneManager: シーンが見つかりません:",
                sceneName
            );
            return;
        }

        const allScenes = document.querySelectorAll(".scene");

        allScenes.forEach(function (scene) {
            scene.classList.remove("is-active");
            scene.hidden = true;
            scene.setAttribute("aria-hidden", "true");
        });

        nextScene.hidden = false;
        nextScene.setAttribute("aria-hidden", "false");

        /*
            hidden解除直後にクラスを付けると、
            一部ブラウザでアニメーションが省略されることがあります。
            requestAnimationFrameを2回挟み、描画を確定させます。
        */
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                nextScene.classList.add("is-active");
            });
        });

        this.currentScene = sceneName;

        console.log(
            "SceneManager: 現在のシーン =",
            sceneName
        );
    },


    /**
     * 画面を暗転させてからシーンを切り替えます。
     *
     * @param {string} sceneName
     * @param {object} options
     * @param {number} options.fadeOutTime 暗転に使う時間
     * @param {number} options.blackTime 真っ黒な状態を保つ時間
     * @param {number} options.fadeInTime 暗転を解除する時間
     */
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
            document.getElementById("transitionLayer");

        if (!transitionLayer) {
            /*
                暗転レイヤーが存在しない場合でも、
                シーン切替自体は行います。
            */
            this.showImmediately(sceneName);
            return;
        }

        transitionLayer.style.transitionDuration =
            settings.fadeOutTime + "ms";

        transitionLayer.classList.add("is-visible");

        await wait(settings.fadeOutTime);

        this.showImmediately(sceneName);

        await wait(settings.blackTime);

        transitionLayer.style.transitionDuration =
            settings.fadeInTime + "ms";

        transitionLayer.classList.remove("is-visible");

        await wait(settings.fadeInTime);
    }
};


/* =========================================================
   3. 将来の音声機能
   ========================================================= */

/**
 * BGM再生用の仮関数です。
 * 後から audio/bgm/ 内の音源を指定して実装できます。
 *
 * @param {string} filePath
 */
function playBGM(filePath) {
    console.log(
        "BGM準備:",
        filePath
    );
}


/**
 * 効果音再生用の仮関数です。
 * 後から audio/se/ 内の音源を指定して実装できます。
 *
 * @param {string} filePath
 */
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
            JavaScriptが有効な状態で、
            TOPシーンを初期表示します。
        */
        SceneManager.showImmediately("top");

        /*
            scenes.js側の初期化関数を呼び出します。
            読み込みに失敗しても画面が壊れないよう、
            関数の存在を確認してから実行します。
        */
        if (
            typeof window.initializeScenes === "function"
        ) {
            window.initializeScenes();
        }

    }
);


/* =========================================================
   5. 他ファイルから使えるように公開
   ========================================================= */

window.wait = wait;
window.SceneManager = SceneManager;
window.playBGM = playBGM;
window.playSE = playSE;
