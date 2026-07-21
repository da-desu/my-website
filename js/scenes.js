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
        stage4: "寿司屋の扉",
        "stage4-clear": "寿司屋へ入る場面",
        stage5: "第五問",
        "stage5-clear": "醤油を手に入れた場面",
        "stage5-receipt": "0円のレシートを受け取った場面",
        "sushi-return": "寿司屋の前へ戻った場面",
        "pre-final-story": "女神へ向かう場面",
        stage6: "最終ステージ",
        "stage6-clear": "銃の女神への変化",
        "ending-plane": "ゲームの結末",
        end: "エンディング"
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
function initializeMapControls(){
    const modal=document.getElementById("mapModal");
    const openButton=document.getElementById("openMapButton");
    const closeButton=document.getElementById("closeMapButton");
    const backdrop=document.getElementById("mapModalBackdrop");
    const sourcePaper=document.getElementById("mapItemPaper");
    const modalPaper=document.getElementById("mapModalPaper");

    function syncMapPaper(){
        if(!sourcePaper||!modalPaper)return;
        modalPaper.innerHTML=sourcePaper.innerHTML;
    }

    openButton?.addEventListener("click",()=>{
        syncMapPaper();
        if(modal){modal.hidden=false;}
    });

    closeButton?.addEventListener("click",()=>{if(modal){modal.hidden=true;}});
    backdrop?.addEventListener("click",()=>{if(modal){modal.hidden=true;}});
    syncMapPaper();
}
document.addEventListener("DOMContentLoaded",initializeMapControls);

/* =========================================================
   Version 0.8 Rebuild：安定したナビゲーション
   ========================================================= */
function bindOnce(element,eventName,key,handler){
    if(!element||element.dataset[key]==="true")return;
    element.addEventListener(eventName,handler);
    element.dataset[key]="true";
}

function initializeRebuildNavigation(){
    bindOnce(document.getElementById("stage3ContinueButton"),"click","v08ToStage4",async function(){
        this.disabled=true;
        window.Stage4Controller?.reset();
        await SceneManager.changeScene("stage4",{fadeOutTime:720,blackTime:320,fadeInTime:860});
        this.disabled=false;
    });

    bindOnce(document.getElementById("stage4ContinueButton"),"click","v08ToStage5",async function(){
        this.disabled=true;
        await SceneManager.changeScene("stage5",{fadeOutTime:720,blackTime:320,fadeInTime:860});
        this.disabled=false;
    });
}
document.addEventListener("DOMContentLoaded",initializeRebuildNavigation);

const continueSavedGameBeforeV08=continueSavedGame;
continueSavedGame=async function(){
    const sceneName=typeof window.getResumeScene==="function"?window.getResumeScene():"top";
    await continueSavedGameBeforeV08();
    if(sceneName==="stage4"){
        window.restoreStage4Puzzle?.();
    }
};


/* =========================================================
   Version 0.8.1：第3問→第4問 遷移の最終修正
   ========================================================= */

/*
    DOMContentLoadedや個別イベント登録の成否に依存せず、
    document全体で「寿司屋へ向かう」ボタンのクリックを拾います。

    capture:true により、他の要素や処理より先に反応します。
*/
document.addEventListener(
    "click",
    async function stage3ToStage4Fallback(event) {

        const button =
            event.target.closest(
                "#stage3ContinueButton"
            );

        if (!button) {
            return;
        }

        /*
            既存イベントとの二重実行を防止します。
        */
        event.preventDefault();
        event.stopImmediatePropagation();

        if (
            button.dataset.transitioning ===
            "true"
        ) {
            return;
        }

        button.dataset.transitioning =
            "true";

        button.disabled = true;

        try {

            /*
                地図モーダルが開いたままでも、
                必ず閉じてから次へ進みます。
            */
            const mapModal =
                document.getElementById(
                    "mapModal"
                );

            if (mapModal) {
                mapModal.hidden = true;
            }

            /*
                第4問を初期状態へ戻します。
            */
            if (
                window.Stage4Controller &&
                typeof window.Stage4Controller.reset ===
                    "function"
            ) {
                window.Stage4Controller.reset();

            } else if (
                typeof window.resetStage4Puzzle ===
                    "function"
            ) {
                window.resetStage4Puzzle();
            }

            /*
                SceneManagerをwindow経由で直接呼びます。
                これによりスコープ差による失敗を避けます。
            */
            if (
                !window.SceneManager ||
                typeof window.SceneManager.changeScene !==
                    "function"
            ) {
                throw new Error(
                    "SceneManager is unavailable."
                );
            }

            await window.SceneManager.changeScene(
                "stage4",
                {
                    fadeOutTime: 720,
                    blackTime: 320,
                    fadeInTime: 860
                }
            );

        } catch (error) {

            console.error(
                "第4問への遷移に失敗しました。",
                error
            );

            /*
                万一アニメーション遷移が失敗した場合も、
                最終手段として第4問を即時表示します。
            */
            if (
                window.SceneManager &&
                typeof window.SceneManager.showImmediately ===
                    "function"
            ) {
                window.SceneManager.showImmediately(
                    "stage4"
                );
            }

        } finally {

            button.disabled = false;

            button.dataset.transitioning =
                "false";
        }
    },
    true
);

/* Version 0.9 navigation */
document.addEventListener("click", async function stage45NavigationV0119(event) {
    const stage4Button = event.target.closest("#stage4ContinueButton");
    if (stage4Button) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (stage4Button.dataset.transitioning === "true") return;
        stage4Button.dataset.transitioning = "true";
        stage4Button.disabled = true;
        try {
            window.resetStage5Puzzle?.();
            await window.SceneManager.changeScene("stage5", {
                fadeOutTime: 720,
                blackTime: 320,
                fadeInTime: 860
            });
        } finally {
            stage4Button.disabled = false;
            stage4Button.dataset.transitioning = "false";
        }
        return;
    }

    const soyButton = event.target.closest("#stage5ContinueButton");
    if (soyButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (soyButton.dataset.transitioning === "true") return;
        soyButton.dataset.transitioning = "true";
        soyButton.disabled = true;
        try {
            window.obtainItem?.("レシート");
            await window.SceneManager.changeScene("stage5-receipt", {
                fadeOutTime: 720,
                blackTime: 320,
                fadeInTime: 880
            });
        } finally {
            soyButton.disabled = false;
            soyButton.dataset.transitioning = "false";
        }
        return;
    }

    const receiptButton = event.target.closest("#stage5ReceiptContinueButton");
    if (receiptButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (receiptButton.dataset.transitioning === "true") return;
        receiptButton.dataset.transitioning = "true";
        receiptButton.disabled = true;
        try {
            await window.SceneManager.changeScene("sushi-return", {
                fadeOutTime: 720,
                blackTime: 320,
                fadeInTime: 880
            });
        } finally {
            receiptButton.disabled = false;
            receiptButton.dataset.transitioning = "false";
        }
        return;
    }

    /*
       Version 0.11.10
       以前は中央の「女神のもとへ向かう」ボタンを押した時だけ進行していました。
       現在はFINAL前ストーリー画面内のどこをタップしても進行します。
    */
    const finalStoryButton = event.target.closest("#preFinalContinueButton");
    const finalStoryScene = event.target.closest("#scene-pre-final-story");
    if (!finalStoryButton && !finalStoryScene) return;

    const activeStoryScene = document.getElementById("scene-pre-final-story");
    if (!activeStoryScene || !activeStoryScene.classList.contains("is-active")) return;

    /*
       ストーリーシートが表示される前のタップでは進行しません。
       必ず本文を一度表示してから、次のタップでFINALへ進みます。
    */
    if (activeStoryScene.dataset.readyToAdvance !== "true") return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (activeStoryScene.dataset.transitioning === "true") return;
    activeStoryScene.dataset.transitioning = "true";
    activeStoryScene.classList.add("is-transitioning");

    if (finalStoryButton) finalStoryButton.disabled = true;

    try {
        window.Stage6Controller?.reset();

        if (
            window.SceneManager &&
            typeof window.SceneManager.changeScene === "function"
        ) {
            /* 旧版の2.22秒から、約0.62秒へ短縮します。 */
            await window.SceneManager.changeScene("stage6", {
                fadeOutTime: 220,
                blackTime: 70,
                fadeInTime: 330
            });
        } else {
            throw new Error("SceneManager is unavailable.");
        }
    } catch (error) {
        console.error("FINAL STAGEへの遷移に失敗したため直接表示します。", error);

        const stage6Scene = document.querySelector('[data-scene="stage6"]');
        if (stage6Scene) {
            document.querySelectorAll(".scene").forEach(function (scene) {
                scene.classList.remove("is-active");
                scene.hidden = true;
                scene.setAttribute("aria-hidden", "true");
            });

            stage6Scene.hidden = false;
            stage6Scene.setAttribute("aria-hidden", "false");
            stage6Scene.classList.add("is-active");
            stage6Scene.scrollTop = 0;
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });

            if (window.SceneManager) {
                window.SceneManager.currentScene = "stage6";
            }
            if (typeof window.saveCurrentScene === "function") {
                window.saveCurrentScene("stage6");
            }
        }
    } finally {
        activeStoryScene.dataset.transitioning = "false";
        activeStoryScene.classList.remove("is-transitioning");
        if (finalStoryButton) finalStoryButton.disabled = false;
    }
}, true);


/* =========================================================
   Version 0.10：最終ステージ再開・終了操作
   ========================================================= */
const continueSavedGameBeforeV010=continueSavedGame;
continueSavedGame=async function(){
    const sceneName=typeof window.getResumeScene==="function"?window.getResumeScene():"top";
    await continueSavedGameBeforeV010();
    if(sceneName==="stage6")window.Stage6Controller?.restore();
    if(sceneName==="stage6-clear")window.FinalLetterController?.restore();
    if(sceneName==="ending-plane"||sceneName==="ending-reflection")window.EndingPlaneController?.reset();
    if(sceneName==="end")window.updateEndSecretBadge?.();
};

document.addEventListener("click",async function finalNavigation(event){
    const restart=event.target.closest("#restartFromEndButton");
    if(!restart)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(restart.dataset.transitioning==="true")return;
    restart.dataset.transitioning="true";restart.disabled=true;
    try{
        window.resetSave?.();window.Stage6Controller?.reset({preserveSave:true});window.FinalLetterController?.reset();window.EndingPlaneController?.reset();
        await window.SceneManager.changeScene("top",{fadeOutTime:700,blackTime:350,fadeInTime:900});
    }finally{restart.disabled=false;restart.dataset.transitioning="false"}
},true);


/* =========================================================
   Version 0.11：導入ストーリー／手紙の裏面ギミック
   ========================================================= */

let introBrushupRunIdV011 = 0;
let introLetterGestureReadyV011 = false;
let introLetterFlippedV011 = false;
let introLetterPointerV011 = null;


function waitForPaintV011() {
    return new Promise(function (resolve) {
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(resolve);
        });
    });
}


function showIntroElementV011(element) {
    if (!element) {
        return;
    }

    element.hidden = false;
    element.classList.remove("is-leaving");

    window.requestAnimationFrame(function () {
        element.classList.add("is-visible");
    });
}


async function hideIntroElementV011(
    element,
    duration
) {
    if (!element || element.hidden) {
        return;
    }

    element.classList.remove("is-visible");
    element.classList.add("is-leaving");

    await window.wait(duration || 360);

    element.hidden = true;
    element.classList.remove("is-leaving");
}


const introLetterBeforeSecretV01112 =
    "拝啓、この手紙を受け取ってくれた人へ。\n\n" +
    "もしかして、あっという間に過ぎていく、変化のない日常に退屈してたりするかな？\n\n" +
    "もしそうだったら、私が作ったゲーム、遊んでみてよ。いい暇つぶしになると思うよ。\n\n";

const introLetterSecretV01112 = "銃の女神";

const introLetterAfterSecretV01112 =
    "を目指してね。\n\n" +
    "世界を照らす像って呼ばれてるんだって。物事の背景って面白いよね。";

/*
    本当は「銃の女神」と書かれていますが、
    プレイヤーには読めない強さでぼかして表示します。
    通常の文字列置換では一瞬見えてしまうため、
    ぼかしたspanを最初からDOMへ挿入します。
*/
function waitIntroLetterV01112(ms) {
    return new Promise(function (resolve) {
        window.setTimeout(resolve, ms);
    });
}

async function typeTextNodeV01112(node, value, speed) {
    const text = String(value || "");
    for (const character of text) {
        node.data += character;
        let delay = speed;
        if (character === "。" || character === "、") delay = speed * 4;
        if (character === "\n") delay = speed * 5;
        await waitIntroLetterV01112(delay);
    }
}

function appendBlurredSecretV01112(target) {
    const secret = document.createElement("span");
    secret.className = "letter-secret-blur";
    secret.textContent = introLetterSecretV01112;
    secret.setAttribute("aria-hidden", "true");
    secret.setAttribute("draggable", "false");

    const accessible = document.createElement("span");
    accessible.className = "visually-hidden";
    accessible.textContent = "ぼやけて読めない文字";

    target.append(secret, accessible);
}

async function typeIntroLetterV01112(target, speed) {
    if (!target) return;
    target.replaceChildren();

    const beforeNode = document.createTextNode("");
    target.appendChild(beforeNode);
    await typeTextNodeV01112(beforeNode, introLetterBeforeSecretV01112, speed);

    appendBlurredSecretV01112(target);

    const afterNode = document.createTextNode("");
    target.appendChild(afterNode);
    await typeTextNodeV01112(afterNode, introLetterAfterSecretV01112, speed);
}

function renderIntroLetterInstantV01112(target) {
    if (!target) return;
    target.replaceChildren(document.createTextNode(introLetterBeforeSecretV01112));
    appendBlurredSecretV01112(target);
    target.appendChild(document.createTextNode(introLetterAfterSecretV01112));
}

const introLetterTextV011 =
    introLetterBeforeSecretV01112 +
    introLetterSecretV01112 +
    introLetterAfterSecretV01112;


/**
 * INTROを最初のストーリーシートから再生します。
 */
runIntroScene = async function runIntroSceneV011() {

    if (isIntroRunning) {
        return;
    }

    /*
        先に前回状態を初期化してから、
        今回の演出IDを発行します。
    */
    resetIntroScene();

    isIntroRunning = true;

    const runId = ++introBrushupRunIdV011;

    const introSilence =
        document.getElementById("introSilence");

    const storySheet =
        document.getElementById(
            "storySheetBeforeLetter"
        );

    if (!introSilence || !storySheet) {
        console.error(
            "Version 0.11のINTRO要素が見つかりません。"
        );

        isIntroRunning = false;
        return;
    }

    introSilence.hidden = false;

    await waitForPaintV011();

    if (runId !== introBrushupRunIdV011) {
        return;
    }

    introSilence.classList.add("is-visible");

    await window.wait(900);

    if (runId !== introBrushupRunIdV011) {
        return;
    }

    introSilence.classList.remove("is-visible");
    introSilence.hidden = true;

    await window.wait(320);

    if (runId !== introBrushupRunIdV011) {
        return;
    }

    showIntroElementV011(storySheet);

    isIntroRunning = false;
};


/**
 * 一つ目のストーリーシートから手紙へ進みます。
 */
async function showIntroLetterV011() {

    const storySheet =
        document.getElementById(
            "storySheetBeforeLetter"
        );

    const button =
        document.getElementById(
            "storyToLetterButton"
        );

    const letterCard =
        document.getElementById("letterCard");

    const letterHeading =
        document.getElementById("letterHeading");

    const text =
        document.getElementById("typewriterText");

    const cursor =
        document.getElementById("typewriterCursor");

    const observation =
        document.getElementById(
            "letterCreaseObservation"
        );

    const gestureZone =
        document.getElementById(
            "letterGestureZone"
        );

    if (
        !storySheet ||
        !button ||
        !letterCard ||
        !letterHeading ||
        !text ||
        !cursor ||
        !gestureZone
    ) {
        return;
    }

    if (button.dataset.transitioning === "true") {
        return;
    }

    button.dataset.transitioning = "true";
    button.disabled = true;

    const runId = ++introBrushupRunIdV011;

    await hideIntroElementV011(storySheet, 360);

    if (runId !== introBrushupRunIdV011) {
        return;
    }

    letterHeading.hidden = false;
    letterHeading.classList.remove("is-leaving", "is-visible");

    letterCard.hidden = false;
    letterCard.classList.remove(
        "is-flipped",
        "is-gesture-ready",
        "is-swiping",
        "is-leaving"
    );

    letterCard.style.setProperty(
        "--intro-peel-progress",
        "0"
    );

    introLetterGestureReadyV011 = false;
    introLetterFlippedV011 = false;

    text.textContent = "";
    cursor.classList.remove("is-hidden");

    if (observation) {
        observation.hidden = true;
        observation.classList.remove("is-visible");
    }

    gestureZone.setAttribute(
        "aria-disabled",
        "true"
    );

    await waitForPaintV011();

    letterHeading.classList.add("is-visible");
    letterCard.classList.add("is-visible");

    await window.wait(620);

    if (runId !== introBrushupRunIdV011) {
        return;
    }

    await typeIntroLetterV01112(
        text,
        19
    );

    if (runId !== introBrushupRunIdV011) {
        return;
    }

    cursor.classList.add("is-hidden");

    introLetterGestureReadyV011 = true;

    letterCard.classList.add(
        "is-gesture-ready"
    );

    gestureZone.setAttribute(
        "aria-disabled",
        "false"
    );

    if (observation) {
        observation.hidden = false;

        window.requestAnimationFrame(function () {
            observation.classList.add(
                "is-visible"
            );
        });
    }

    button.dataset.transitioning = "false";
    button.disabled = false;
}


/**
 * 手紙を裏返します。
 */
function revealIntroLetterBackV011() {

    if (
        !introLetterGestureReadyV011 ||
        introLetterFlippedV011
    ) {
        return;
    }

    const letterCard =
        document.getElementById("letterCard");

    const gestureZone =
        document.getElementById(
            "letterGestureZone"
        );

    if (!letterCard || !gestureZone) {
        return;
    }

    introLetterFlippedV011 = true;
    introLetterGestureReadyV011 = false;

    letterCard.classList.remove(
        "is-gesture-ready",
        "is-swiping"
    );

    letterCard.style.setProperty(
        "--intro-peel-progress",
        "0"
    );

    letterCard.classList.add("is-flipped");

    gestureZone.setAttribute(
        "aria-disabled",
        "true"
    );

    window.setTimeout(function () {
        document
            .getElementById("letterBackNextButton")
            ?.focus({ preventScroll: true });
    }, 940);
}


function beginLetterGestureV011(event) {

    if (
        !introLetterGestureReadyV011 ||
        introLetterFlippedV011
    ) {
        return;
    }

    const zone = event.currentTarget;

    event.preventDefault();

    introLetterPointerV011 = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        currentX: event.clientX,
        currentY: event.clientY
    };

    zone.setPointerCapture?.(event.pointerId);

    document
        .getElementById("letterCard")
        ?.classList.add("is-swiping");
}


function moveLetterGestureV011(event) {

    const state = introLetterPointerV011;

    if (
        !state ||
        state.pointerId !== event.pointerId
    ) {
        return;
    }

    event.preventDefault();

    state.currentX = event.clientX;
    state.currentY = event.clientY;

    const dx = state.currentX - state.startX;
    const dy = state.currentY - state.startY;

    const progress = Math.max(
        0,
        Math.min(
            1,
            (dx + (-dy)) / 220
        )
    );

    document
        .getElementById("letterCard")
        ?.style.setProperty(
            "--intro-peel-progress",
            String(progress)
        );
}


function finishLetterGestureV011(event) {

    const state = introLetterPointerV011;

    if (!state) {
        return;
    }

    if (
        event &&
        event.pointerId !== undefined &&
        state.pointerId !== event.pointerId
    ) {
        return;
    }

    const dx = state.currentX - state.startX;
    const dy = state.currentY - state.startY;

    introLetterPointerV011 = null;

    const letterCard =
        document.getElementById("letterCard");

    letterCard?.classList.remove("is-swiping");

    const movedRightEnough = dx >= 82;
    const movedUpEnough = dy <= -68;
    const diagonalEnough = dx + (-dy) >= 176;

    if (
        movedRightEnough &&
        movedUpEnough &&
        diagonalEnough
    ) {
        revealIntroLetterBackV011();
        return;
    }

    letterCard?.style.setProperty(
        "--intro-peel-progress",
        "0"
    );
}


/**
 * 手紙の裏から、第一問直前のストーリーシートへ進みます。
 */
async function showStoryBeforeStage1V011() {

    const button =
        document.getElementById(
            "letterBackNextButton"
        );

    const letterCard =
        document.getElementById("letterCard");

    const letterHeading =
        document.getElementById("letterHeading");

    const storySheet =
        document.getElementById(
            "storySheetBeforeStage1"
        );

    if (!button || !letterCard || !storySheet) {
        return;
    }

    if (button.dataset.transitioning === "true") {
        return;
    }

    button.dataset.transitioning = "true";
    button.disabled = true;

    letterHeading?.classList.remove("is-visible");
    letterHeading?.classList.add("is-leaving");
    letterCard.classList.remove("is-visible");
    letterCard.classList.add("is-leaving");

    await window.wait(440);

    if (letterHeading) {
        letterHeading.hidden = true;
        letterHeading.classList.remove("is-leaving");
    }
    letterCard.hidden = true;
    letterCard.classList.remove("is-leaving");

    showIntroElementV011(storySheet);

    button.dataset.transitioning = "false";
    button.disabled = false;
}


/**
 * 第一問へ進みます。
 */
async function startStage1FromStoryV011() {

    const button =
        document.getElementById(
            "storyToStage1Button"
        );

    if (!button) {
        return;
    }

    if (button.dataset.transitioning === "true") {
        return;
    }

    button.dataset.transitioning = "true";
    button.disabled = true;

    try {
        if (
            typeof window.resetStage1Puzzle ===
            "function"
        ) {
            window.resetStage1Puzzle();
        }

        await window.SceneManager.changeScene(
            "stage1",
            {
                fadeOutTime: 760,
                blackTime: 360,
                fadeInTime: 860
            }
        );

    } finally {
        button.dataset.transitioning = "false";
        button.disabled = false;
    }
}


/**
 * INTRO内の全要素を初期状態へ戻します。
 */
resetIntroScene = function resetIntroSceneV011() {

    introBrushupRunIdV011 += 1;
    introLetterGestureReadyV011 = false;
    introLetterFlippedV011 = false;
    introLetterPointerV011 = null;
    isIntroRunning = false;

    const ids = [
        "introSilence",
        "storySheetBeforeLetter",
        "letterHeading",
        "letterCard",
        "storySheetBeforeStage1"
    ];

    ids.forEach(function (id) {
        const element = document.getElementById(id);

        if (!element) {
            return;
        }

        element.hidden = true;
        element.classList.remove(
            "is-visible",
            "is-leaving",
            "is-flipped",
            "is-gesture-ready",
            "is-swiping"
        );

        element.style.removeProperty(
            "--intro-peel-progress"
        );
    });

    const text =
        document.getElementById("typewriterText");

    const cursor =
        document.getElementById("typewriterCursor");

    const observation =
        document.getElementById(
            "letterCreaseObservation"
        );

    const gestureZone =
        document.getElementById(
            "letterGestureZone"
        );

    if (text) {
        text.textContent = "";
    }

    if (cursor) {
        cursor.classList.remove("is-hidden");
    }

    if (observation) {
        observation.hidden = true;
        observation.classList.remove("is-visible");
    }

    if (gestureZone) {
        gestureZone.setAttribute(
            "aria-disabled",
            "true"
        );
    }

    [
        "storyToLetterButton",
        "letterBackNextButton",
        "storyToStage1Button"
    ].forEach(function (id) {
        const button = document.getElementById(id);

        if (!button) {
            return;
        }

        button.disabled = false;
        button.dataset.transitioning = "false";
    });
};


function initializeIntroBrushupV011() {

    const storyToLetterButton =
        document.getElementById(
            "storyToLetterButton"
        );

    const letterBackNextButton =
        document.getElementById(
            "letterBackNextButton"
        );

    const storyToStage1Button =
        document.getElementById(
            "storyToStage1Button"
        );

    const gestureZone =
        document.getElementById(
            "letterGestureZone"
        );

    if (
        storyToLetterButton &&
        storyToLetterButton.dataset.v011Ready !==
            "true"
    ) {
        storyToLetterButton.addEventListener(
            "click",
            showIntroLetterV011
        );

        storyToLetterButton.dataset.v011Ready =
            "true";
    }

    if (
        letterBackNextButton &&
        letterBackNextButton.dataset.v011Ready !==
            "true"
    ) {
        letterBackNextButton.addEventListener(
            "click",
            showStoryBeforeStage1V011
        );

        letterBackNextButton.dataset.v011Ready =
            "true";
    }

    if (
        storyToStage1Button &&
        storyToStage1Button.dataset.v011Ready !==
            "true"
    ) {
        storyToStage1Button.addEventListener(
            "click",
            startStage1FromStoryV011
        );

        storyToStage1Button.dataset.v011Ready =
            "true";
    }

    if (
        gestureZone &&
        gestureZone.dataset.v011Ready !== "true"
    ) {
        gestureZone.addEventListener(
            "pointerdown",
            beginLetterGestureV011
        );

        gestureZone.addEventListener(
            "pointermove",
            moveLetterGestureV011
        );

        gestureZone.addEventListener(
            "pointerup",
            finishLetterGestureV011
        );

        gestureZone.addEventListener(
            "pointercancel",
            finishLetterGestureV011
        );

        gestureZone.addEventListener(
            "keydown",
            function (event) {
                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {
                    event.preventDefault();
                    revealIntroLetterBackV011();
                }
            }
        );

        gestureZone.dataset.v011Ready = "true";
    }
}


/* 再開画面の表記も新しい導入に合わせます。 */
const getResumeSceneLabelBeforeV011 =
    getResumeSceneLabel;

getResumeSceneLabel = function getResumeSceneLabelV011(
    sceneName
) {
    if (sceneName === "intro") {
        return "紙飛行機を拾った場面";
    }

    return getResumeSceneLabelBeforeV011(
        sceneName
    );
};


/* game.jsより後に読み込まれるため、DOMContentLoadedでも登録します。 */
document.addEventListener(
    "DOMContentLoaded",
    initializeIntroBrushupV011
);


/* 既存処理から参照される公開関数を最新化します。 */
window.runIntroScene = runIntroScene;


/* =========================================================
   Version 0.11.7：第一問正解後の女の子・一枚謎イベント
   ========================================================= */
function stage1HasPensAlready(){
    const saveData=typeof window.getSaveData==="function"?window.getSaveData():null;
    const items=Array.isArray(saveData?.items)?saveData.items:[];
    return items.includes("赤ペン")&&items.includes("青ペン");
}

function normalizeStage1GirlPuzzleAnswer(value){
    return String(value||"")
        .trim()
        .replace(/\s+/g,"")
        .replace(/[!！?？。、,.・]/g,"")
        .replace(/[\u30a1-\u30f6]/g,function(character){
            return String.fromCharCode(character.charCodeAt(0)-0x60);
        });
}

function setStage1GirlPuzzleMessage(text,type=""){
    const message=document.getElementById("stage1GirlPuzzleMessage");
    if(!message)return;
    message.textContent=text;
    message.classList.remove("is-error","is-success");
    if(type)message.classList.add(type==="error"?"is-error":"is-success");
}

function updateStage1ChildSpotState(){
    const childButton=document.getElementById("stage1ChildButton");
    if(!childButton)return;
    if(stage1HasPensAlready()){
        childButton.dataset.collected="true";
        childButton.setAttribute("aria-label","桜の木の下で絵を描いている女の子。赤ペンと青ペンはもう受け取った");
    }else{
        childButton.dataset.collected="false";
        childButton.setAttribute("aria-label","桜の木の下で絵を描いている女の子に話しかける");
    }
}

function setStage1GirlPuzzleView(solved){
    const puzzlePanel=document.getElementById("stage1GirlPuzzlePanel");
    const rewardPanel=document.getElementById("stage1GirlPuzzleReward");
    const caption=document.getElementById("stage1PensRewardCaption");
    if(puzzlePanel)puzzlePanel.hidden=Boolean(solved);
    if(rewardPanel)rewardPanel.hidden=!solved;
    if(caption){
        caption.textContent=stage1HasPensAlready()
            ? "「赤ペン」と「青ペン」は入手済み。"
            : "「赤ペン」と「青ペン」を手に入れた。";
    }
}

function hideStage1PensReward(){
    const panel=document.getElementById("stage1PensReward");
    if(panel){panel.hidden=true;panel.classList.remove("is-visible");}
    updateStage1ChildSpotState();
}

function showStage1PensReward(){
    const panel=document.getElementById("stage1PensReward");
    const input=document.getElementById("stage1GirlPuzzleAnswer");
    if(!panel)return;
    setStage1GirlPuzzleMessage("");
    setStage1GirlPuzzleView(stage1HasPensAlready());
    panel.hidden=false;
    window.requestAnimationFrame(()=>panel.classList.add("is-visible"));
    if(!stage1HasPensAlready())setTimeout(()=>input?.focus(),260);
    updateStage1ChildSpotState();
}

function solveStage1GirlPuzzle(event){
    event?.preventDefault();
    if(stage1HasPensAlready()){
        setStage1GirlPuzzleView(true);
        return;
    }
    const input=document.getElementById("stage1GirlPuzzleAnswer");
    if(!input)return;
    const answer=normalizeStage1GirlPuzzleAnswer(input.value);
    const correctAnswers=["ひまよろしく"];
    if(!answer){
        setStage1GirlPuzzleMessage("答えを入力してね。","error");
        input.focus();
        return;
    }
    if(!correctAnswers.includes(answer)){
        setStage1GirlPuzzleMessage("違うみたい。隠れていない文字を、順番に読んでみて。","error");
        input.select();
        return;
    }
    window.obtainItem?.("赤ペン");
    window.obtainItem?.("青ペン");
    setStage1GirlPuzzleMessage("さっすが！お礼にこのペンあげる！","success");
    setStage1GirlPuzzleView(true);
    const caption=document.getElementById("stage1PensRewardCaption");
    if(caption)caption.textContent="「赤ペン」と「青ペン」を手に入れた。";
    updateStage1ChildSpotState();
}

function initializeStage1ClearReward(){
    const childButton=document.getElementById("stage1ChildButton");
    const closeButton=document.getElementById("stage1PensRewardClose");
    const dismissButton=document.getElementById("stage1GirlPuzzleDismiss");
    const form=document.getElementById("stage1GirlPuzzleForm");
    if(childButton&&childButton.dataset.rewardBound!=="true"){
        childButton.addEventListener("click",showStage1PensReward);
        childButton.dataset.rewardBound="true";
    }
    if(closeButton&&closeButton.dataset.rewardBound!=="true"){
        closeButton.addEventListener("click",hideStage1PensReward);
        closeButton.dataset.rewardBound="true";
    }
    if(dismissButton&&dismissButton.dataset.rewardBound!=="true"){
        dismissButton.addEventListener("click",hideStage1PensReward);
        dismissButton.dataset.rewardBound="true";
    }
    if(form&&form.dataset.rewardBound!=="true"){
        form.addEventListener("submit",solveStage1GirlPuzzle);
        form.dataset.rewardBound="true";
    }
    updateStage1ChildSpotState();
}

document.addEventListener("DOMContentLoaded",initializeStage1ClearReward);


/* =========================================================
   Version 0.11.10：電柱看板／寿司屋前の行き先回答／高速遷移

   修正内容
   ・正解後の遷移を SceneManager.changeScene だけに依存しない
   ・対象シーンの hidden / aria-hidden / is-active を直接更新
   ・フォーム submit、決定ボタン、Enterキーの各経路を確実に拾う
   ========================================================= */
(function initializeStage4FlipSignsAndDestinationV01196(){
    "use strict";

    function findMessage(sign){
        const scene=sign.closest(".scene");
        return scene?.querySelector(".stage4-sign-message") || null;
    }

    document.addEventListener("click",function(event){
        const sign=event.target.closest?.(".stage4-flip-sign");
        if(!sign)return;

        event.preventDefault();
        const flipped=!sign.classList.contains("is-flipped");
        sign.classList.toggle("is-flipped",flipped);
        sign.setAttribute("aria-pressed",flipped?"true":"false");

        if(flipped&&sign.dataset.signKey==="handcream"){
            const alreadyOwned=(
                typeof window.hasUsableItem==="function"&&
                window.hasUsableItem("ハンドクリーム")
            )||(
                typeof window.hasItem==="function"&&
                window.hasItem("ハンドクリーム")
            );

            if(!alreadyOwned)window.obtainItem?.("ハンドクリーム");

            const message=findMessage(sign);
            if(message){
                message.textContent=alreadyOwned
                    ? "「ハンドクリーム」は入手済みだ。"
                    : "「ハンドクリーム」を手に入れた。";
                message.classList.remove("is-error");
                message.classList.add("is-success");
            }
        }
    });

    function normalizeDestinationAnswer(value){
        return String(value||"")
            .normalize("NFKC")
            .trim()
            .replace(/[\s\u3000、。・,，.．!！?？「」『』（）()]/g,"")
            .replace(/[ァ-ヶ]/g,function(char){
                return String.fromCharCode(char.charCodeAt(0)-0x60);
            });
    }

    function isCorrectDestinationAnswer(value){
        const answer=normalizeDestinationAnswer(value);
        return [
            "自由の女神",
            "自由女神",
            "じゆうのめがみ",
            "じゆうめがみ"
        ].includes(answer);
    }

    function hasGoddessReceipt(){
        return (
            typeof window.hasUsableItem==="function"&&
            window.hasUsableItem("女神へのレシート")
        )||(
            typeof window.hasItem==="function"&&
            window.hasItem("女神へのレシート")
        );
    }

    function setDestinationMessage(text,type){
        const message=document.getElementById("sushiReturnAnswerMessage");
        if(!message)return;
        message.textContent=text;
        message.classList.remove("is-success","is-error");
        if(type)message.classList.add("is-"+type);
    }

    /*
       SceneManagerが利用できない、またはアニメーション処理が停止しても
       必ず指定シーンを表示するための直接切り替え処理です。
    */
    function showSceneDirectly(sceneName){
        const nextScene=document.querySelector('[data-scene="'+sceneName+'"]');
        if(!nextScene){
            console.error("直接遷移先のシーンが見つかりません。",sceneName);
            return false;
        }

        document.querySelectorAll(".scene").forEach(function(scene){
            scene.classList.remove("is-active");
            scene.hidden=true;
            scene.setAttribute("aria-hidden","true");
        });

        nextScene.hidden=false;
        nextScene.setAttribute("aria-hidden","false");

        /*
           FINAL前ストーリーの本文は、共通CSS上では初期状態が opacity: 0 です。
           そのため、シーンだけを表示してもシート本体が透明なままになる場合がありました。
           pre-final-storyへ移動する時は、シートの表示クラスを必ず付け直します。
        */
        if(sceneName==="pre-final-story"){
            const storySheet=nextScene.querySelector(".pre-final-story-sheet");
            nextScene.dataset.readyToAdvance="false";

            if(storySheet){
                storySheet.classList.remove("is-leaving","is-visible");
                void storySheet.offsetWidth;
                storySheet.classList.add("is-visible");
            }

            /*
               正解ボタンを押した指が、そのまま次画面へのタップとして
               誤認されないよう、表示後しばらくはFINALへ進ませません。
            */
            window.setTimeout(function(){
                if(!nextScene.hidden&&nextScene.classList.contains("is-active")){
                    nextScene.dataset.readyToAdvance="true";
                }
            },900);
        }

        window.requestAnimationFrame(function(){
            window.requestAnimationFrame(function(){
                nextScene.classList.add("is-active");
            });
        });

        if(window.SceneManager){
            window.SceneManager.currentScene=sceneName;
        }

        if(typeof window.saveCurrentScene==="function"){
            try{
                window.saveCurrentScene(sceneName);
            }catch(error){
                console.warn("シーン保存に失敗しました。",error);
            }
        }

        const inventoryModal=document.getElementById("inventoryModal");
        if(inventoryModal){
            inventoryModal.hidden=true;
            inventoryModal.setAttribute("aria-hidden","true");
        }
        document.body.classList.remove("is-inventory-open","inventory-open","is-modal-open");

        nextScene.scrollTop=0;
        window.scrollTo({top:0,left:0,behavior:"auto"});
        return true;
    }

    function waitMs(ms){
        return new Promise(function(resolve){
            window.setTimeout(resolve,ms);
        });
    }

    async function goToPreFinalStoryDirectly(){
        const transitionLayer=document.getElementById("transitionLayer");

        if(transitionLayer){
            transitionLayer.style.transitionDuration="150ms";
            transitionLayer.classList.add("is-visible");
            await waitMs(170);
        }else{
            await waitMs(100);
        }

        const shown=showSceneDirectly("pre-final-story");
        if(!shown){
            throw new Error("pre-final-story scene was not found.");
        }

        await waitMs(70);

        if(transitionLayer){
            transitionLayer.style.transitionDuration="230ms";
            transitionLayer.classList.remove("is-visible");
        }
    }

    let destinationTransitioning=false;

    async function submitDestinationAnswer(event){
        event?.preventDefault?.();
        event?.stopPropagation?.();

        if(destinationTransitioning)return;

        const input=document.getElementById("sushiReturnAnswer");
        const button=document.getElementById("sushiReturnSubmitButton");
        const answer=input?.value||"";

        if(!answer.trim()){
            setDestinationMessage("行き先を入力しよう。","error");
            input?.focus();
            return;
        }

        if(!isCorrectDestinationAnswer(answer)){
            setDestinationMessage(
                hasGoddessReceipt()
                    ? "印字が消えたレシートを、もう一度確認しよう。"
                    : "持ち物の中に、行き先を示すものがないだろうか。",
                "error"
            );
            input?.select();
            return;
        }

        destinationTransitioning=true;
        if(button)button.disabled=true;
        if(input)input.disabled=true;
        setDestinationMessage("自由の女神へ向かおう。","success");

        try{
            await waitMs(120);
            await goToPreFinalStoryDirectly();
        }catch(error){
            console.error("行き先正解後の直接遷移に失敗しました。",error);

            /* 最終手段：演出を使わず即時表示します。 */
            if(!showSceneDirectly("pre-final-story")){
                setDestinationMessage(
                    "画面を進められませんでした。ページを再読み込みしてください。",
                    "error"
                );
                destinationTransitioning=false;
                if(button)button.disabled=false;
                if(input)input.disabled=false;
            }
        }
    }

    function initializeDestinationQuestion(){
        const form=document.getElementById("sushiReturnAnswerForm");
        const button=document.getElementById("sushiReturnSubmitButton");
        const input=document.getElementById("sushiReturnAnswer");

        if(form&&form.dataset.boundV01196!=="true"){
            form.addEventListener("submit",submitDestinationAnswer);
            form.dataset.boundV01196="true";
        }

        /* submitイベントが発生しない環境のための決定ボタン保険 */
        if(button&&button.dataset.boundV01196!=="true"){
            button.addEventListener("click",function(event){
                event.preventDefault();
                submitDestinationAnswer(event);
            });
            button.dataset.boundV01196="true";
        }

        /* iOSのソフトウェアキーボードでEnterを押した場合の保険 */
        if(input&&input.dataset.boundV01196!=="true"){
            input.addEventListener("keydown",function(event){
                if(event.key!=="Enter")return;
                event.preventDefault();
                submitDestinationAnswer(event);
            });
            input.dataset.boundV01196="true";
        }
    }

    /*
       scenes.jsがDOMContentLoaded後に読み込まれた場合にも初期化します。
    */
    if(document.readyState==="loading"){
        document.addEventListener("DOMContentLoaded",initializeDestinationQuestion,{once:true});
    }else{
        initializeDestinationQuestion();
    }

    /* DOMの差し替え等があってもsubmitを取り逃がさない委譲処理 */
    document.addEventListener("submit",function(event){
        if(event.target?.id!=="sushiReturnAnswerForm")return;
        submitDestinationAnswer(event);
    },true);
})();

/* =========================================================
   Version 0.11.10：進行ログ／過去場面への再訪

   ・進行に応じてLOG1〜LOG7を順番に解放
   ・解放済みの場面へ戻り、取り逃したアイテムを取得可能
   ・再訪中も本来の進行地点は保持
   ・「現在地点へ戻る」で元のシーンへ復帰
   ========================================================= */
(function initializeProgressLogV01110(){
    "use strict";

    const LOG_PROGRESS_KEY = "nazotokiLogProgressV01110";
    const LOG_REPLAY_KEY = "nazotokiLogReplayV01110";

    const LOG_ENTRIES = [
        { key:"letter", rank:1, number:1, title:"見知らぬ手紙", scene:"intro" },
        { key:"sakura-clear", rank:2, number:2, title:"満開の桜", scene:"stage1-clear" },
        { key:"stage2", rank:3, number:3, title:"桜の向こうにあるもの", scene:"stage2" },
        { key:"stage3", rank:4, number:4, title:"海辺の看板", scene:"stage3" },
        { key:"stage4", rank:5, number:5, title:"寿司屋の扉", scene:"stage4" },
        { key:"stage5", rank:6, number:6, title:"大将に注文しよう", scene:"stage5" },
        { key:"sushi-return", rank:7, number:7, title:"寿司屋の扉（勘定後）", scene:"sushi-return" }
    ];

    const SCENE_LOG_RANK = {
        intro:0,
        stage1:1,
        "stage1-clear":2,
        stage2:3,
        "stage2-clear":3,
        stage3:4,
        "stage3-clear":4,
        stage4:5,
        "stage4-clear":5,
        stage5:6,
        "stage5-clear":6,
        "stage5-receipt":6,
        "sushi-return":7,
        "pre-final-story":7,
        stage6:7,
        "stage6-clear":7,
        "ending-plane":7,
        end:7
    };

    function readLogRank(){
        const value = Number.parseInt(localStorage.getItem(LOG_PROGRESS_KEY) || "0", 10);
        return Number.isFinite(value) ? Math.max(0, Math.min(LOG_ENTRIES.length, value)) : 0;
    }

    function writeLogRank(rank){
        const next = Math.max(readLogRank(), Math.max(0, Math.min(LOG_ENTRIES.length, rank || 0)));
        localStorage.setItem(LOG_PROGRESS_KEY, String(next));
        renderLogList();
        syncLogButton();
        return next;
    }

    function readReplayState(){
        try{
            const parsed = JSON.parse(sessionStorage.getItem(LOG_REPLAY_KEY) || "null");
            return parsed && typeof parsed === "object" ? parsed : null;
        }catch(error){
            console.warn("ログ再訪情報を読み込めませんでした。", error);
            return null;
        }
    }

    function writeReplayState(state){
        sessionStorage.setItem(LOG_REPLAY_KEY, JSON.stringify(state));
    }

    function clearReplayState(){
        sessionStorage.removeItem(LOG_REPLAY_KEY);
    }

    function getActiveSceneName(){
        const active = Array.from(document.querySelectorAll(".scene")).find(function(scene){
            return !scene.hidden && scene.classList.contains("is-active");
        });
        return active?.dataset.scene || window.SceneManager?.currentScene || "top";
    }

    function closeOtherPanels(){
        const inventoryPanel = document.getElementById("inventoryPanel");
        if(inventoryPanel){
            inventoryPanel.hidden = true;
            inventoryPanel.setAttribute("aria-hidden", "true");
        }
        document.body.classList.remove("is-inventory-open", "inventory-open", "is-modal-open");
    }

    function syncLogButton(){
        const button = document.getElementById("logButton");
        const count = document.getElementById("logCount");
        const rank = readLogRank();
        if(button) button.hidden = rank < 1;
        if(count) count.textContent = rank + "/" + LOG_ENTRIES.length;
    }

    function openLogPanel(){
        const panel = document.getElementById("logPanel");
        if(!panel) return;
        closeOtherPanels();
        renderLogList();
        panel.hidden = false;
        panel.setAttribute("aria-hidden", "false");
        document.body.classList.add("is-log-panel-open");
        window.requestAnimationFrame(function(){
            panel.classList.add("is-open");
            panel.querySelector(".log-entry:not(:disabled)")?.focus({preventScroll:true});
        });
    }

    function closeLogPanel(){
        const panel = document.getElementById("logPanel");
        if(!panel) return;
        panel.classList.remove("is-open");
        panel.hidden = true;
        panel.setAttribute("aria-hidden", "true");
        document.body.classList.remove("is-log-panel-open");
    }

    function renderLogList(){
        const list = document.getElementById("logList");
        if(!list) return;
        const rank = readLogRank();
        list.replaceChildren();

        LOG_ENTRIES.forEach(function(entry){
            const unlocked = rank >= entry.rank;
            const button = document.createElement("button");
            button.type = "button";
            button.className = "log-entry" + (unlocked ? " is-unlocked" : " is-locked");
            button.dataset.logKey = entry.key;
            button.disabled = !unlocked;
            button.setAttribute("role", "listitem");

            const number = document.createElement("span");
            number.className = "log-entry__number";
            number.textContent = "LOG " + entry.number;

            const title = document.createElement("span");
            title.className = "log-entry__title";
            title.textContent = unlocked ? entry.title : "未解放";

            const status = document.createElement("span");
            status.className = "log-entry__status";
            status.textContent = unlocked ? "この場面へ戻る" : "物語を進めると解放";

            button.append(number, title, status);
            list.appendChild(button);
        });
    }

    function showSceneWithoutSaving(sceneName){
        const target = document.querySelector('[data-scene="' + sceneName + '"]');
        if(!target){
            console.error("ログの移動先が見つかりません。", sceneName);
            return false;
        }

        document.querySelectorAll(".scene").forEach(function(scene){
            scene.classList.remove("is-active");
            scene.hidden = true;
            scene.setAttribute("aria-hidden", "true");
        });

        target.hidden = false;
        target.setAttribute("aria-hidden", "false");
        target.classList.add("is-active");
        target.scrollTop = 0;
        window.scrollTo({top:0, left:0, behavior:"auto"});

        if(window.SceneManager){
            window.SceneManager.currentScene = sceneName;
        }

        if(sceneName === "pre-final-story"){
            const sheet = target.querySelector(".pre-final-story-sheet");
            sheet?.classList.add("is-visible");
            target.dataset.readyToAdvance = "true";
        }

        return true;
    }

    function prepareLetterLog(){
        if(typeof resetIntroScene === "function") resetIntroScene();

        const silence = document.getElementById("introSilence");
        const before = document.getElementById("storySheetBeforeLetter");
        const after = document.getElementById("storySheetBeforeStage1");
        const heading = document.getElementById("letterHeading");
        const card = document.getElementById("letterCard");
        const text = document.getElementById("typewriterText");
        const cursor = document.getElementById("typewriterCursor");
        const gesture = document.getElementById("letterGestureZone");

        [silence, before, after].forEach(function(element){
            if(element) element.hidden = true;
        });

        if(heading){
            heading.hidden = false;
            heading.classList.remove("is-leaving");
            heading.classList.add("is-visible");
        }

        if(card){
            card.hidden = false;
            card.classList.remove("is-flipped", "is-leaving", "is-swiping");
            card.classList.add("is-visible", "is-gesture-ready");
            card.style.setProperty("--intro-peel-progress", "0");
        }

        if(text) renderIntroLetterInstantV01112(text);
        cursor?.classList.add("is-hidden");
        gesture?.setAttribute("aria-disabled", "false");
        introLetterGestureReadyV011 = true;
        introLetterFlippedV011 = false;
        introLetterPointerV011 = null;
        isIntroRunning = false;
    }

    function prepareLogScene(entry){
        switch(entry.key){
            case "letter":
                prepareLetterLog();
                break;
            case "sakura-clear":
                document.getElementById("stage1PensReward")?.setAttribute("hidden", "");
                if(typeof updateStage1ChildSpotState === "function") updateStage1ChildSpotState();
                if(typeof initializeStage1ClearReward === "function") initializeStage1ClearReward();
                break;
            case "stage2":
                window.resetStage2Puzzle?.();
                break;
            case "stage3":
                window.resetStage3Puzzle?.();
                break;
            case "stage4":
                window.Stage4Controller?.reset?.();
                window.resetStage4Puzzle?.();
                break;
            case "stage5":
                window.resetStage5Puzzle?.();
                break;
            case "sushi-return": {
                const input = document.getElementById("sushiReturnAnswer");
                const message = document.getElementById("sushiReturnAnswerMessage");
                if(input){ input.disabled = false; input.value = ""; }
                if(message){ message.textContent = ""; message.classList.remove("is-error", "is-success"); }
                break;
            }
        }
    }

    function enterLog(entry){
        const currentScene = getActiveSceneName();
        const resumeScene = typeof window.getResumeScene === "function"
            ? window.getResumeScene()
            : currentScene;

        writeReplayState({
            returnScene: currentScene,
            resumeScene: resumeScene,
            logKey: entry.key,
            startedAt: Date.now()
        });

        closeLogPanel();
        closeOtherPanels();
        document.body.classList.add("is-log-replay");
        const returnButton = document.getElementById("logReturnButton");
        if(returnButton) returnButton.hidden = false;

        if(showSceneWithoutSaving(entry.scene)){
            prepareLogScene(entry);
        }
    }

    function restoreSceneSpecificState(sceneName){
        if(sceneName === "intro"){
            if(typeof runIntroScene === "function") runIntroScene();
        }else if(sceneName === "stage1-clear"){
            if(typeof updateStage1ChildSpotState === "function") updateStage1ChildSpotState();
        }else if(sceneName === "stage4"){
            window.restoreStage4Puzzle?.();
        }else if(sceneName === "stage6"){
            window.Stage6Controller?.restore?.();
        }else if(sceneName === "stage6-clear"){
            window.FinalLetterController?.restore?.();
        }else if(sceneName === "ending-plane" || sceneName === "ending-reflection"){
            window.EndingPlaneController?.reset?.();
        }else if(sceneName === "end"){
            window.updateEndSecretBadge?.();
        }
    }

    function returnFromLog(){
        const state = readReplayState();
        const returnScene = state?.returnScene || state?.resumeScene || "top";
        const resumeScene = state?.resumeScene || returnScene;

        clearReplayState();
        document.body.classList.remove("is-log-replay");
        const returnButton = document.getElementById("logReturnButton");
        if(returnButton) returnButton.hidden = true;

        showSceneWithoutSaving(returnScene);
        restoreSceneSpecificState(returnScene);

        if(typeof window.saveCurrentScene === "function"){
            try{
                window.saveCurrentScene(resumeScene);
            }catch(error){
                console.warn("ログ再訪前の進行地点を復元できませんでした。", error);
            }
        }
    }

    function updateProgressFromScene(sceneName){
        if(readReplayState()) return;
        const rank = SCENE_LOG_RANK[sceneName] || 0;
        if(rank > 0) writeLogRank(rank);
    }

    function observeSceneProgress(){
        let lastScene = "";
        const update = function(){
            const current = getActiveSceneName();
            if(current && current !== lastScene){
                lastScene = current;
                updateProgressFromScene(current);
            }
        };

        const observer = new MutationObserver(update);
        document.querySelectorAll(".scene").forEach(function(scene){
            observer.observe(scene, {attributes:true, attributeFilter:["class", "hidden"]});
        });
        update();
    }

    function initializeLogSystem(){
        /*
           ログ再訪中に各ステージの通常遷移が発生しても、
           本来の再開地点を上書きしないよう保存処理を保護します。
        */
        if(
            typeof window.saveCurrentScene === "function" &&
            window.saveCurrentScene.datasetLogGuardV01110 !== "true"
        ){
            const saveCurrentSceneBeforeLogV01110 = window.saveCurrentScene;
            const guardedSaveCurrentSceneV01110 = function(sceneName){
                if(readReplayState()) return;
                return saveCurrentSceneBeforeLogV01110.apply(this, arguments);
            };
            guardedSaveCurrentSceneV01110.datasetLogGuardV01110 = "true";
            window.saveCurrentScene = guardedSaveCurrentSceneV01110;
        }

        if(
            typeof window.resetSave === "function" &&
            window.resetSave.datasetLogResetV01110 !== "true"
        ){
            const resetSaveBeforeLogV01110 = window.resetSave;
            const resetSaveWithLogV01110 = function(){
                localStorage.removeItem(LOG_PROGRESS_KEY);
                clearReplayState();
                document.body.classList.remove("is-log-replay", "is-log-panel-open");
                return resetSaveBeforeLogV01110.apply(this, arguments);
            };
            resetSaveWithLogV01110.datasetLogResetV01110 = "true";
            window.resetSave = resetSaveWithLogV01110;
        }

        const savedScene = typeof window.getResumeScene === "function" ? window.getResumeScene() : "top";
        if(SCENE_LOG_RANK[savedScene]) writeLogRank(SCENE_LOG_RANK[savedScene]);

        syncLogButton();
        renderLogList();
        observeSceneProgress();

        const replay = readReplayState();
        if(replay){
            document.body.classList.add("is-log-replay");
            const returnButton = document.getElementById("logReturnButton");
            if(returnButton) returnButton.hidden = false;
        }
    }

    document.addEventListener("click", function(event){
        if(event.target.closest("#logButton")){
            event.preventDefault();
            openLogPanel();
            return;
        }

        if(event.target.closest("#logCloseButton") || event.target.closest("#logBackdrop")){
            event.preventDefault();
            closeLogPanel();
            return;
        }

        const entryButton = event.target.closest(".log-entry[data-log-key]");
        if(entryButton && !entryButton.disabled){
            event.preventDefault();
            const entry = LOG_ENTRIES.find(function(item){ return item.key === entryButton.dataset.logKey; });
            if(entry) enterLog(entry);
            return;
        }

        if(event.target.closest("#logReturnButton")){
            event.preventDefault();
            returnFromLog();
            return;
        }

        if(event.target.closest("#restartButton") || event.target.closest("#restartFromEndButton")){
            localStorage.removeItem(LOG_PROGRESS_KEY);
            clearReplayState();
            document.body.classList.remove("is-log-replay");
        }
    }, true);

    document.addEventListener("keydown", function(event){
        if(event.key === "Escape" && !document.getElementById("logPanel")?.hidden){
            closeLogPanel();
        }
    });

    if(document.readyState === "loading"){
        document.addEventListener("DOMContentLoaded", initializeLogSystem, {once:true});
    }else{
        initializeLogSystem();
    }
})();

