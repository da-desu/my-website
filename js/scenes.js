/*
============================================================
scenes.js
Version 0.2

役割
・TOP画面の「世界」崩壊演出
・INTRO手紙演出
・章タイトル表示
・STAGE1仮画面への遷移
============================================================
*/


"use strict";


/* =========================================================
   1. 状態管理
   ========================================================= */

let isStarting = false;
let isIntroRunning = false;


/* =========================================================
   2. TOP画面演出
   ========================================================= */

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

    startButton.disabled = true;
    startButton.classList.add(
        "is-disappearing"
    );

    await wait(520);

    worldWord.classList.add(
        "is-glitching"
    );

    await wait(330);

    worldWord.textContent = "世▓";
    worldWord.classList.add(
        "is-blurred"
    );

    await wait(170);

    worldWord.textContent = "▉界";

    await wait(160);

    worldWord.textContent = "▓▓";
    worldWord.classList.add(
        "is-mosaic"
    );

    await wait(210);

    worldWord.textContent = "██";

    await wait(190);

    worldWord.textContent = "？？";

    await wait(72);

    worldWord.classList.remove(
        "is-glitching",
        "is-blurred",
        "is-mosaic"
    );

    worldWord.textContent = "世界";
    worldWord.classList.add(
        "is-restored"
    );

    await wait(300);

    await SceneManager.changeScene(
        "intro",
        {
            fadeOutTime: 780,
            blackTime: 420,
            fadeInTime: 900
        }
    );

    resetTopScene();

    isStarting = false;

    /*
        INTROシーンが見えた後に、
        その場面専用の演出を開始します。
    */
    await runIntroScene();
}


/* =========================================================
   3. TOP画面初期化
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
   4. INTRO演出
   ========================================================= */

async function runIntroScene() {

    if (isIntroRunning) {
        return;
    }

    isIntroRunning = true;

    resetIntroScene();

    const introSilence =
        document.getElementById(
            "introSilence"
        );

    const letterCard =
        document.getElementById(
            "letterCard"
        );

    const typewriterText =
        document.getElementById(
            "typewriterText"
        );

    const typewriterCursor =
        document.getElementById(
            "typewriterCursor"
        );

    const introNextButton =
        document.getElementById(
            "introNextButton"
        );

    if (
        !introSilence ||
        !letterCard ||
        !typewriterText ||
        !typewriterCursor ||
        !introNextButton
    ) {
        console.error(
            "INTRO演出に必要な要素が見つかりません。"
        );

        isIntroRunning = false;
        return;
    }


    /* 最初に無音の間を作る */
    introSilence.hidden = false;

    /*
        hidden解除直後にクラスを付けると、
        Safariでアニメーションが始まらない場合があるため、
        描画を1回確定させます。
    */
    await new Promise(function (resolve) {
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(resolve);
        });
    });

    introSilence.classList.add(
        "is-visible"
    );

    await wait(980);

    /*
        「……」を確実に消します。
        classを外すだけでなく hidden も指定することで、
        iPhone Safariでも表示が残りません。
    */
    introSilence.classList.remove(
        "is-visible"
    );

    introSilence.hidden = true;

    await wait(420);


    /* 手紙を表示 */
    letterCard.hidden = false;

    window.requestAnimationFrame(function () {
        letterCard.classList.add(
            "is-visible"
        );
    });

    await wait(980);


    /* 手紙の文章を文字送り */
    const introText =
        "見えているものだけを、信じるな。\n\n" +
        "知った瞬間、\n" +
        "世界の色は変わる。";

    await typeText(
        typewriterText,
        introText,
        52
    );


    /* 文字送り完了後、カーソルを消す */
    typewriterCursor.classList.add(
        "is-hidden"
    );

    await wait(420);


    /* タップして進むボタンを表示 */
    introNextButton.hidden = false;

    window.requestAnimationFrame(function () {
        introNextButton.classList.add(
            "is-visible"
        );
    });

    isIntroRunning = false;
}


/* =========================================================
   5. INTROから章タイトルへ
   ========================================================= */

async function showChapterCard() {

    const letterCard =
        document.getElementById(
            "letterCard"
        );

    const chapterCard =
        document.getElementById(
            "chapterCard"
        );

    const introNextButton =
        document.getElementById(
            "introNextButton"
        );

    if (
        !letterCard ||
        !chapterCard ||
        !introNextButton
    ) {
        return;
    }

    /*
        連打による二重実行を防ぎます。
    */
    introNextButton.disabled = true;
    introNextButton.classList.remove(
        "is-visible"
    );

    /*
        INTRO → INTRO のシーン切替は行いません。
        同じINTROシーン内で手紙だけを静かに消します。
    */
    letterCard.classList.remove(
        "is-visible"
    );

    letterCard.classList.add(
        "is-leaving"
    );

    await wait(540);

    /*
        退場演出が終わってから手紙を完全に非表示にします。
    */
    letterCard.hidden = true;

    /*
        重要:
        ここでは is-leaving を外しません。

        iPhone Safariでは、hiddenを付けた直後に退場クラスを外すと、
        再描画のタイミングによって手紙が1フレームだけ
        元の表示状態へ戻ることがあります。

        退場クラスは次回の resetIntroScene() まで保持します。
    */

    await wait(220);

    /*
        章タイトルを表示します。
    */
    chapterCard.hidden = false;

    await new Promise(function (resolve) {
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(resolve);
        });
    });

    chapterCard.classList.add(
        "is-visible"
    );
}


/* =========================================================
   6. INTRO初期化
   ========================================================= */

function resetIntroScene() {

    const introSilence =
        document.getElementById(
            "introSilence"
        );

    const letterCard =
        document.getElementById(
            "letterCard"
        );

    const typewriterText =
        document.getElementById(
            "typewriterText"
        );

    const typewriterCursor =
        document.getElementById(
            "typewriterCursor"
        );

    const introNextButton =
        document.getElementById(
            "introNextButton"
        );

    const chapterCard =
        document.getElementById(
            "chapterCard"
        );

    if (introSilence) {
        introSilence.classList.remove(
            "is-visible"
        );

        introSilence.hidden = true;
    }

    if (letterCard) {
        letterCard.hidden = true;

        letterCard.classList.remove(
            "is-visible",
            "is-leaving"
        );
    }

    if (typewriterText) {
        typewriterText.textContent = "";
    }

    if (typewriterCursor) {
        typewriterCursor.classList.remove(
            "is-hidden"
        );
    }

    if (introNextButton) {
        introNextButton.hidden = true;
        introNextButton.disabled = false;

        introNextButton.classList.remove(
            "is-visible"
        );
    }

    if (chapterCard) {
        chapterCard.hidden = true;

        chapterCard.classList.remove(
            "is-visible"
        );
    }
}


/* =========================================================
   7. シーン初期化
   ========================================================= */

function initializeScenes() {

    const startButton =
        document.getElementById(
            "startButton"
        );

    const introNextButton =
        document.getElementById(
            "introNextButton"
        );

    const chapterStartButton =
        document.getElementById(
            "chapterStartButton"
        );

    const backToTopButton =
        document.getElementById(
            "backToTopButton"
        );


    if (startButton) {
        startButton.addEventListener(
            "click",
            runTopOpening
        );
    }


    if (introNextButton) {
        introNextButton.addEventListener(
            "click",
            showChapterCard
        );
    }


    if (chapterStartButton) {
        chapterStartButton.addEventListener(
            "click",
            async function () {

                await SceneManager.changeScene(
                    "stage1",
                    {
                        fadeOutTime: 720,
                        blackTime: 320,
                        fadeInTime: 820
                    }
                );

            }
        );
    }


    if (backToTopButton) {
        backToTopButton.addEventListener(
            "click",
            async function () {

                await SceneManager.changeScene(
                    "top",
                    {
                        fadeOutTime: 520,
                        blackTime: 180,
                        fadeInTime: 620
                    }
                );

                resetTopScene();
                resetIntroScene();
            }
        );
    }

}


/* =========================================================
   8. game.jsから使えるように公開
   ========================================================= */

window.initializeScenes = initializeScenes;
