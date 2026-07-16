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
        =====================================================
        手紙を確実に消す
        =====================================================

        Safariでは、hidden属性やアニメーションクラスの変更が
        同じ描画タイミングに重なると、ごく短時間だけ元の状態が
        再描画される場合があります。

        そのため今回は、CSSクラスではなくインラインスタイルで
        手紙を強制的に非表示にします。
    */

    letterCard.style.setProperty(
        "opacity",
        "0",
        "important"
    );

    letterCard.style.setProperty(
        "visibility",
        "hidden",
        "important"
    );

    letterCard.style.setProperty(
        "pointer-events",
        "none",
        "important"
    );

    letterCard.style.setProperty(
        "transform",
        "translateY(-8px)",
        "important"
    );

    /*
        少しだけ消える間を置きます。
    */
    await wait(260);

    /*
        display:none !important を付けることで、
        以降の再描画でも手紙が復活しないようにします。
    */
    letterCard.style.setProperty(
        "display",
        "none",
        "important"
    );

    letterCard.hidden = true;


    /*
        =====================================================
        章タイトルを表示
        =====================================================
    */

    chapterCard.hidden = false;

    chapterCard.style.removeProperty(
        "display"
    );

    chapterCard.style.removeProperty(
        "visibility"
    );

    chapterCard.style.removeProperty(
        "opacity"
    );

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

        /*
            次回INTROを再生できるように、
            前回付けた強制非表示スタイルを初期化します。
        */
        letterCard.style.removeProperty(
            "display"
        );

        letterCard.style.removeProperty(
            "visibility"
        );

        letterCard.style.removeProperty(
            "opacity"
        );

        letterCard.style.removeProperty(
            "pointer-events"
        );

        letterCard.style.removeProperty(
            "transform"
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

    const continueButton =
        document.getElementById(
            "continueButton"
        );

    const restartButton =
        document.getElementById(
            "restartButton"
        );


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


    if (continueButton) {
        continueButton.addEventListener(
            "click",
            continueSavedGame
        );
    }


    if (restartButton) {
        restartButton.addEventListener(
            "click",
            restartGameFromBeginning
        );
    }


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

                if (
                    typeof window.resetStage1Puzzle ===
                    "function"
                ) {
                    window.resetStage1Puzzle();
                }
            }
        );
    }


    /*
        第一問の選択イベントを登録します。
    */
    if (
        typeof window.initializePuzzles ===
        "function"
    ) {
        window.initializePuzzles();
    }


    /*
        第一問正解後、「桜の前へ進む」で次の場面へ移動します。
    */
    const stage1ContinueButton =
        document.getElementById(
            "stage1ContinueButton"
        );

    const stage2ContinueButton =
        document.getElementById(
            "stage2ContinueButton"
        );

    const stage3ContinueButton =
        document.getElementById(
            "stage3ContinueButton"
        );

    if (stage1ContinueButton) {
        stage1ContinueButton.addEventListener(
            "click",
            async function () {

                if (
                    typeof window.resetStage2Puzzle ===
                    "function"
                ) {
                    window.resetStage2Puzzle();
                }

                await SceneManager.changeScene(
                    "stage2",
                    {
                        fadeOutTime: 720,
                        blackTime: 320,
                        fadeInTime: 860
                    }
                );

            }
        );
    }


    if (stage2ContinueButton) {
        stage2ContinueButton.addEventListener(
            "click",
            async function () {

                await SceneManager.changeScene(
                    "stage3",
                    {
                        fadeOutTime: 720,
                        blackTime: 320,
                        fadeInTime: 860
                    }
                );

            }
        );
    }

}




/* =========================================================
   8. 再開確認画面
   ========================================================= */

/**
 * 保存シーン名を、プレイヤー向けの表示へ変換します。
 *
 * @param {string} sceneName
 * @returns {string}
 */
function getResumeSceneLabel(sceneName) {

    const labels = {
        intro: "手紙を見つけた場面",
        stage1: "第一問",
        "stage1-clear": "満開の桜の前",
        stage2: "第二問",
        "stage2-clear": "海を見つけた場面",
        stage3: "第三問",
        "stage3-clear": "寿司屋への地図を入手した場面",
        stage4: "第四問"
    };

    return labels[sceneName] || "前回の続き";
}


/**
 * 再開確認画面へ現在の保存位置を表示します。
 */
function updateResumeScene() {

    const label =
        document.getElementById(
            "resumeSceneLabel"
        );

    if (!label) {
        return;
    }

    const sceneName =
        typeof window.getResumeScene ===
            "function"
            ? window.getResumeScene()
            : "top";

    label.textContent =
        "保存位置：" +
        getResumeSceneLabel(sceneName);
}


/**
 * 保存位置から再開します。
 */
async function continueSavedGame() {

    const sceneName =
        typeof window.getResumeScene ===
            "function"
            ? window.getResumeScene()
            : "top";

    if (sceneName === "top") {
        await SceneManager.changeScene(
            "top"
        );

        return;
    }

    await SceneManager.changeScene(
        sceneName,
        {
            fadeOutTime: 620,
            blackTime: 260,
            fadeInTime: 760
        }
    );


    /*
        INTROは内部演出を再生する必要があります。
        リロード前の文字送り途中状態までは保存せず、
        手紙の冒頭から再開します。
    */
    if (
        sceneName === "intro" &&
        typeof runIntroScene === "function"
    ) {
        await runIntroScene();
    }


    /*
        第一問の途中選択状態は保存しないため、
        未選択状態から再開します。
    */
    if (
        sceneName === "stage1" &&
        typeof window.resetStage1Puzzle ===
            "function"
    ) {
        window.resetStage1Puzzle();
    }

    if (
        sceneName === "stage2" &&
        typeof window.resetStage2Puzzle ===
            "function"
    ) {
        window.resetStage2Puzzle();
    }

    if (sceneName === "stage3" && typeof window.resetStage3Puzzle === "function") {
        window.resetStage3Puzzle();
    }
}


/**
 * 保存を削除して最初から開始します。
 */
async function restartGameFromBeginning() {

    if (
        typeof window.resetSave ===
        "function"
    ) {
        window.resetSave();
    }

    resetTopScene();
    resetIntroScene();

    if (
        typeof window.resetStage1Puzzle ===
        "function"
    ) {
        window.resetStage1Puzzle();
    }

    if (
        typeof window.resetStage2Puzzle ===
        "function"
    ) {
        window.resetStage2Puzzle();
    }

    if (typeof window.resetStage3Puzzle === "function") {
        window.resetStage3Puzzle();
    }

    await SceneManager.changeScene(
        "top",
        {
            fadeOutTime: 520,
            blackTime: 220,
            fadeInTime: 680
        }
    );
}


/* =========================================================
   9. game.jsから使えるように公開
   ========================================================= */

window.initializeScenes =
    initializeScenes;

window.updateResumeScene =
    updateResumeScene;

window.runIntroScene =
    runIntroScene;


/* Version 0.5.1：第二問の次へボタンを確実に登録 */
function initializeStage2ContinueButton() {
    const button = document.getElementById("stage2ContinueButton");

    if (!button || button.dataset.stage2ContinueReady === "true") {
        return;
    }

    button.addEventListener("click", async function (event) {
        event.preventDefault();
        event.stopPropagation();

        button.disabled = true;

        if (typeof window.resetStage3Puzzle === "function") {
            window.resetStage3Puzzle();
        }

        await SceneManager.changeScene(
            "stage3",
            {
                fadeOutTime: 720,
                blackTime: 320,
                fadeInTime: 860
            }
        );

        button.disabled = false;
    });

    button.dataset.stage2ContinueReady = "true";
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeStage2ContinueButton
    );
} else {
    initializeStage2ContinueButton();
}

/* Version 0.7 map modal */
function initializeMapControls(){const modal=document.getElementById("mapModal");document.getElementById("openMapButton")?.addEventListener("click",()=>{modal.hidden=false});document.getElementById("closeMapButton")?.addEventListener("click",()=>{modal.hidden=true});document.getElementById("mapModalBackdrop")?.addEventListener("click",()=>{modal.hidden=true})}
document.addEventListener("DOMContentLoaded",initializeMapControls);
