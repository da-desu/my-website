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
        stage6: "最終ステージ",
        "stage6-clear": "最後の手紙",
        "ending-plane": "紙飛行機を飛ばす場面",
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
document.addEventListener("click",async function(e){const b4=e.target.closest("#stage4ContinueButton");if(b4){e.preventDefault();e.stopImmediatePropagation();if(b4.dataset.transitioning==="true")return;b4.dataset.transitioning="true";b4.disabled=true;try{window.resetStage5Puzzle?.();await window.SceneManager.changeScene("stage5",{fadeOutTime:720,blackTime:320,fadeInTime:860})}finally{b4.disabled=false;b4.dataset.transitioning="false"}return}const b5=e.target.closest("#stage5ContinueButton");if(!b5)return;e.preventDefault();e.stopImmediatePropagation();if(b5.dataset.transitioning==="true")return;b5.dataset.transitioning="true";b5.disabled=true;try{window.Stage6Controller?.reset();await window.SceneManager.changeScene("stage6",{fadeOutTime:720,blackTime:320,fadeInTime:860})}finally{b5.disabled=false;b5.dataset.transitioning="false"}},true);


/* =========================================================
   Version 0.10：最終ステージ再開・終了操作
   ========================================================= */
const continueSavedGameBeforeV010=continueSavedGame;
continueSavedGame=async function(){
    const sceneName=typeof window.getResumeScene==="function"?window.getResumeScene():"top";
    await continueSavedGameBeforeV010();
    if(sceneName==="stage6")window.Stage6Controller?.restore();
    if(sceneName==="stage6-clear")window.FinalLetterController?.restore();
    if(sceneName==="ending-plane")window.EndingPlaneController?.reset();
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


const introLetterTextV011 =
    "拝啓、この手紙を受け取ってくれた人へ。\n\n" +
    "明日僕は空の世界に旅立つようです。病室から見ていた空は青く、白く、大きな海のようでした。\n\n" +
    "このベッドから出て、外へ出てみたかったなぁ。あぁ1度でいいから***をこの目で見たい。\n\n" +
    "世界を照らす自由の像って呼ばれてるんだって。物語の背景って面白いよね。";


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

    letterCard.classList.add("is-visible");

    await window.wait(620);

    if (runId !== introBrushupRunIdV011) {
        return;
    }

    await window.typeText(
        text,
        introLetterTextV011,
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

    letterCard.classList.remove("is-visible");
    letterCard.classList.add("is-leaving");

    await window.wait(440);

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
   Version 0.11.2：第一問正解後の子どもイベント
   ========================================================= */
function stage1HasPensAlready(){
    const saveData=typeof window.getSaveData==="function"?window.getSaveData():null;
    const items=Array.isArray(saveData?.items)?saveData.items:[];
    return items.includes("赤ペン")&&items.includes("青ペン");
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

function hideStage1PensReward(){
    const panel=document.getElementById("stage1PensReward");
    if(panel){panel.hidden=true;panel.classList.remove("is-visible");}
    updateStage1ChildSpotState();
}

function showStage1PensReward(){
    const panel=document.getElementById("stage1PensReward");
    if(!panel)return;
    if(!stage1HasPensAlready()){
        window.obtainItem?.("赤ペン");
        window.obtainItem?.("青ペン");
    }
    panel.hidden=false;
    window.requestAnimationFrame(()=>panel.classList.add("is-visible"));
    updateStage1ChildSpotState();
}

function initializeStage1ClearReward(){
    const childButton=document.getElementById("stage1ChildButton");
    const closeButton=document.getElementById("stage1PensRewardClose");
    if(childButton&&childButton.dataset.rewardBound!=="true"){
        childButton.addEventListener("click",showStage1PensReward);
        childButton.dataset.rewardBound="true";
    }
    if(closeButton&&closeButton.dataset.rewardBound!=="true"){
        closeButton.addEventListener("click",hideStage1PensReward);
        closeButton.dataset.rewardBound="true";
    }
    updateStage1ChildSpotState();
}

document.addEventListener("DOMContentLoaded",initializeStage1ClearReward);
