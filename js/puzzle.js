/*
============================================================
puzzle.js
Version 0.3.1 修正版

修正内容
・puzzle.js単独でDOMContentLoaded時に初期化
・イベント委譲でタップを確実に取得
・iPhone Safariのタッチ操作に対応
============================================================
*/

"use strict";

let isStage1Clearing = false;
let stage1PuzzleInitialized = false;


/* =========================================================
   メッセージ
   ========================================================= */

function setStage1Message(text, type) {
    const message = document.getElementById("stage1Message");

    if (!message) {
        return;
    }

    message.textContent = text;
    message.classList.remove("is-error", "is-success");

    if (type === "error") {
        message.classList.add("is-error");
    }

    if (type === "success") {
        message.classList.add("is-success");
    }
}


/* =========================================================
   選択処理
   ========================================================= */

function toggleSakuraTile(tile) {
    if (!tile || isStage1Clearing) {
        return;
    }

    const selected = tile.classList.toggle("is-selected");

    tile.setAttribute(
        "aria-pressed",
        selected ? "true" : "false"
    );

    setStage1Message("", "");
}


/* =========================================================
   正解判定
   ========================================================= */

async function verifyStage1Answer() {
    if (isStage1Clearing) {
        return;
    }

    const tiles = Array.from(
        document.querySelectorAll("#sakuraGrid .sakura-tile")
    );

    const verifyButton =
        document.getElementById("stage1VerifyButton");

    if (!tiles.length || !verifyButton) {
        setStage1Message(
            "読み込みに失敗しました。ページを再読み込みしてください。",
            "error"
        );
        return;
    }

    const selectedCount = tiles.filter(function (tile) {
        return tile.classList.contains("is-selected");
    }).length;

    if (selectedCount === 0) {
        setStage1Message(
            "画像を選択してください。",
            "error"
        );
        return;
    }

    if (selectedCount !== tiles.length) {
        setStage1Message(
            "まだ選ばれていない桜があるようだ。",
            "error"
        );
        return;
    }

    isStage1Clearing = true;
    verifyButton.disabled = true;

    setStage1Message(
        "確認できました。",
        "success"
    );

    if (typeof window.clearStage === "function") {
        window.clearStage(1);
    }

    await window.wait(700);

    await window.SceneManager.changeScene(
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
   初期化
   ========================================================= */

function initializePuzzles() {
    if (stage1PuzzleInitialized) {
        return;
    }

    const grid = document.getElementById("sakuraGrid");
    const verifyButton =
        document.getElementById("stage1VerifyButton");

    if (!grid || !verifyButton) {
        console.error(
            "Stage1 puzzle elements were not found."
        );
        return;
    }

    /*
        個々のボタンではなく、グリッド全体でクリックを受けます。
        Safariでも安定して反応します。
    */
    grid.addEventListener("click", function (event) {
        const tile = event.target.closest(".sakura-tile");

        if (!tile || !grid.contains(tile)) {
            return;
        }

        event.preventDefault();
        toggleSakuraTile(tile);
    });

    /*
        touchendでも反応を補助します。
        clickと二重発火しないよう、touch時はpreventDefaultします。
    */
    grid.addEventListener(
        "touchend",
        function (event) {
            const tile = event.target.closest(".sakura-tile");

            if (!tile || !grid.contains(tile)) {
                return;
            }

            event.preventDefault();
            toggleSakuraTile(tile);
        },
        { passive: false }
    );

    verifyButton.addEventListener(
        "click",
        verifyStage1Answer
    );

    stage1PuzzleInitialized = true;
}


/* =========================================================
   リセット
   ========================================================= */

function resetStage1Puzzle() {
    document
        .querySelectorAll("#sakuraGrid .sakura-tile")
        .forEach(function (tile) {
            tile.classList.remove("is-selected");
            tile.setAttribute("aria-pressed", "false");
        });

    const verifyButton =
        document.getElementById("stage1VerifyButton");

    if (verifyButton) {
        verifyButton.disabled = false;
    }

    setStage1Message("", "");
    isStage1Clearing = false;
}


/* =========================================================
   自動初期化
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializePuzzles
);

window.initializePuzzles = initializePuzzles;
window.resetStage1Puzzle = resetStage1Puzzle;


/* =========================================================
   8. 第二問「海」
   ========================================================= */

let stage2WrongCount = 0;
let isStage2Clearing = false;


/**
 * 表記揺れを吸収するため、回答を整形します。
 *
 * @param {string} value
 * @returns {string}
 */
function normalizeStage2Answer(value) {
    return String(value || "")
        .trim()
        .replace(/\s+/g, "")
        .toLowerCase();
}


function setStage2Message(text, type) {
    const message =
        document.getElementById("stage2Message");

    if (!message) {
        return;
    }

    message.textContent = text;
    message.classList.remove(
        "is-error",
        "is-success"
    );

    if (type === "error") {
        message.classList.add("is-error");
    }

    if (type === "success") {
        message.classList.add("is-success");
    }
}


async function verifyStage2Answer(event) {
    if (event) {
        event.preventDefault();
    }

    if (isStage2Clearing) {
        return;
    }

    const input =
        document.getElementById("stage2Answer");

    const submitButton =
        document.getElementById(
            "stage2SubmitButton"
        );

    if (!input || !submitButton) {
        return;
    }

    const answer =
        normalizeStage2Answer(input.value);

    if (!answer) {
        setStage2Message(
            "答えを入力してください。",
            "error"
        );

        input.focus();
        return;
    }

    const correctAnswers = [
        "海",
        "うみ",
        "ウミ"
    ];

    if (!correctAnswers.includes(answer)) {
        stage2WrongCount += 1;

        setStage2Message(
            "違うようだ。もう一度、波の前後を見てみよう。",
            "error"
        );

        input.select();

        if (stage2WrongCount >= 2) {
            const hintButton =
                document.getElementById(
                    "stage2HintButton"
                );

            if (hintButton) {
                hintButton.textContent =
                    "ヒントを見る";
            }
        }

        return;
    }

    isStage2Clearing = true;
    submitButton.disabled = true;
    input.disabled = true;

    setStage2Message(
        "正解。",
        "success"
    );

    if (
        typeof window.clearStage ===
        "function"
    ) {
        window.clearStage(2);
    }

    await window.wait(650);

    await window.SceneManager.changeScene(
        "stage2-clear",
        {
            fadeOutTime: 700,
            blackTime: 260,
            fadeInTime: 900
        }
    );

    isStage2Clearing = false;
}


function toggleStage2Hint() {
    const hint =
        document.getElementById("stage2Hint");

    const button =
        document.getElementById(
            "stage2HintButton"
        );

    if (!hint || !button) {
        return;
    }

    hint.hidden = !hint.hidden;

    button.textContent =
        hint.hidden
            ? "ヒントを見る"
            : "ヒントを閉じる";
}


function resetStage2Puzzle() {
    const input =
        document.getElementById("stage2Answer");

    const submitButton =
        document.getElementById(
            "stage2SubmitButton"
        );

    const hint =
        document.getElementById("stage2Hint");

    const hintButton =
        document.getElementById(
            "stage2HintButton"
        );

    if (input) {
        input.value = "";
        input.disabled = false;
    }

    if (submitButton) {
        submitButton.disabled = false;
    }

    if (hint) {
        hint.hidden = true;
    }

    if (hintButton) {
        hintButton.textContent =
            "ヒントを見る";
    }

    setStage2Message("", "");

    stage2WrongCount = 0;
    isStage2Clearing = false;
}


/* 既存の初期化関数を拡張します */
const originalInitializePuzzles =
    window.initializePuzzles;

function initializeAllPuzzles() {
    if (
        typeof originalInitializePuzzles ===
        "function"
    ) {
        originalInitializePuzzles();
    }

    const stage2Form =
        document.getElementById("stage2Form");

    const hintButton =
        document.getElementById(
            "stage2HintButton"
        );

    if (
        stage2Form &&
        !stage2Form.dataset.initialized
    ) {
        stage2Form.addEventListener(
            "submit",
            verifyStage2Answer
        );

        stage2Form.dataset.initialized =
            "true";
    }

    if (
        hintButton &&
        !hintButton.dataset.initialized
    ) {
        hintButton.addEventListener(
            "click",
            toggleStage2Hint
        );

        hintButton.dataset.initialized =
            "true";
    }
}

window.initializePuzzles =
    initializeAllPuzzles;

window.resetStage2Puzzle =
    resetStage2Puzzle;


/* Version 0.7: Stage3 */
let isStage3Clearing=false;
function setStage3AnswerMessage(text,type){const m=document.getElementById("stage3Message");if(!m)return;m.textContent=text;m.classList.remove("is-error","is-success");if(type)m.classList.add("is-"+type)}
async function verifyStage3Answer(e){e?.preventDefault();if(isStage3Clearing)return;const input=document.getElementById("stage3Answer"),button=document.getElementById("stage3SubmitButton");if(!input||!button)return;const answer=String(input.value||"").trim().replace(/\s+/g,"");if(!answer){setStage3AnswerMessage("方向を入力してください。","error");input.focus();return}if(answer!=="北"){setStage3AnswerMessage("違うようだ。看板の組み合わせを見直そう。","error");input.select();return}isStage3Clearing=true;input.disabled=true;button.disabled=true;setStage3AnswerMessage("正解。北へ向かおう。","success");window.clearStage?.(3);if(window.obtainItem)window.obtainItem("寿司屋への地図");else window.addItem?.("寿司屋への地図");await window.wait(720);await window.SceneManager.changeScene("stage3-clear",{fadeOutTime:720,blackTime:320,fadeInTime:900});isStage3Clearing=false}
function toggleStage3Hint(){const h=document.getElementById("stage3Hint"),b=document.getElementById("stage3HintButton");if(!h||!b)return;h.hidden=!h.hidden;b.textContent=h.hidden?"ヒントを見る":"ヒントを閉じる"}
function resetStage3Puzzle(){const i=document.getElementById("stage3Answer"),b=document.getElementById("stage3SubmitButton"),h=document.getElementById("stage3Hint"),hb=document.getElementById("stage3HintButton");if(i){i.value="";i.disabled=false}if(b)b.disabled=false;if(h)h.hidden=true;if(hb)hb.textContent="ヒントを見る";setStage3AnswerMessage("","");isStage3Clearing=false}
const prevInit=window.initializePuzzles;window.initializePuzzles=function(){prevInit?.();const f=document.getElementById("stage3Form"),h=document.getElementById("stage3HintButton");if(f&&!f.dataset.initialized){f.addEventListener("submit",verifyStage3Answer);f.dataset.initialized="true"}if(h&&!h.dataset.initialized){h.addEventListener("click",toggleStage3Hint);h.dataset.initialized="true"}};window.resetStage3Puzzle=resetStage3Puzzle;

/* =========================================================
   Version 0.8 Rebuild：第4問コントローラー
   ========================================================= */
const Stage4Controller={
    initialized:false,
    folded:false,
    completed:false,
    timer:null,
    waitMs:10000,

    el(id){return document.getElementById(id)},

    setStatus(id,text,type=""){
        const el=this.el(id);
        if(!el)return;
        el.textContent=text;
        el.classList.remove("is-error","is-success");
        if(type)el.classList.add("is-"+type);
    },

    stopTimer(){
        if(this.timer!==null){
            clearTimeout(this.timer);
            this.timer=null;
        }
        const bar=this.el("stage4WaitBar");
        if(bar){
            bar.classList.remove("is-running");
            void bar.offsetWidth;
        }
        this.el("stage4Silence")?.classList.remove("is-visible");
    },

    startTimer(){
        if(!this.folded||this.completed)return;
        this.stopTimer();
        this.el("stage4WaitBar")?.classList.add("is-running");
        setTimeout(()=>this.el("stage4Silence")?.classList.add("is-visible"),4200);
        this.timer=setTimeout(()=>this.complete(),this.waitMs);
    },

    async fold(){
        if(this.folded||this.completed)return;
        this.folded=true;
        this.el("stage4FoldButton").disabled=true;
        this.el("stage4FoldMap")?.classList.add("is-folded");
        this.el("stage4DoorWord")?.classList.add("is-read-as-one");
        this.setStatus("stage4MapMessage","NOW  HERE が、NOWHERE に見える。","success");
        window.saveStage4State?.({folded:true});
        await window.wait(1050);
        const panel=this.el("stage4ChoicePanel");
        if(panel)panel.hidden=false;
        this.setStatus("stage4ChoiceMessage","よく考えて選ぼう。");
        this.startTimer();
    },

    choose(){
        if(!this.folded||this.completed)return;
        this.stopTimer();
        this.setStatus("stage4ChoiceMessage","扉は動かない。選ばないことも、選択かもしれない。","error");
        this.startTimer();
    },

    async complete(){
        if(this.completed)return;
        this.completed=true;
        this.stopTimer();
        document.querySelectorAll(".stage4-choice-button").forEach(b=>b.disabled=true);
        this.setStatus("stage4ChoiceMessage","何もしなかった。すると――","success");
        this.el("stage4Door")?.classList.add("is-open");
        window.clearStage?.(4);
        window.saveStage4State?.({folded:true,doorOpened:true});
        await window.wait(1550);
        await window.SceneManager.changeScene("stage4-clear",{fadeOutTime:680,blackTime:280,fadeInTime:850});
    },

    reset({preserveSave=false}={}){
        this.stopTimer();
        this.folded=false;
        this.completed=false;
        this.el("stage4FoldMap")?.classList.remove("is-folded");
        this.el("stage4DoorWord")?.classList.remove("is-read-as-one");
        this.el("stage4Door")?.classList.remove("is-open");
        const foldButton=this.el("stage4FoldButton");
        if(foldButton)foldButton.disabled=false;
        const choice=this.el("stage4ChoicePanel");
        if(choice)choice.hidden=true;
        document.querySelectorAll(".stage4-choice-button").forEach(b=>b.disabled=false);
        this.setStatus("stage4MapMessage","地図には、うっすらと折り目がついている。");
        this.setStatus("stage4ChoiceMessage","よく考えて選ぼう。");
        if(!preserveSave)window.resetStage4State?.();
    },

    restore(){
        this.reset({preserveSave:true});
        const state=window.getStage4State?.()||{};
        if(state.folded){
            this.folded=true;
            this.el("stage4FoldButton").disabled=true;
            this.el("stage4FoldMap")?.classList.add("is-folded");
            this.el("stage4DoorWord")?.classList.add("is-read-as-one");
            this.setStatus("stage4MapMessage","NOW  HERE が、NOWHERE に見える。","success");
            const panel=this.el("stage4ChoicePanel");
            if(panel)panel.hidden=false;
        }
        if(state.doorOpened){
            this.completed=true;
            this.el("stage4Door")?.classList.add("is-open");
            document.querySelectorAll(".stage4-choice-button").forEach(b=>b.disabled=true);
        }else if(state.folded){
            this.startTimer();
        }
    },

    init(){
        if(this.initialized)return;
        this.el("stage4FoldButton")?.addEventListener("click",()=>this.fold());
        document.querySelectorAll(".stage4-choice-button").forEach(b=>b.addEventListener("click",()=>this.choose()));
        this.initialized=true;
    }
};
const initBeforeRebuild=window.initializePuzzles;
window.initializePuzzles=function(){
    initBeforeRebuild?.();
    Stage4Controller.init();
};
window.Stage4Controller=Stage4Controller;
window.resetStage4Puzzle=()=>Stage4Controller.reset();
window.restoreStage4Puzzle=()=>Stage4Controller.restore();

/* =========================================================
   Version 0.9.1：第五問 メニュー謎
   ========================================================= */

let stage5Initialized = false;
let stage5Clearing = false;

function normalizeStage5Answer(value) {
    const cleaned = String(value || "")
        .trim()
        .replace(/\s+/g, "")
        .replace(/[!！?？。、,.・]+/g, "")
        .toLowerCase();

    return cleaned.replace(/[\u30a1-\u30f6]/g, function (character) {
        return String.fromCharCode(character.charCodeAt(0) - 0x60);
    });
}

function setStage5Message(text, type) {
    const message = document.getElementById("stage5Message");

    if (!message) {
        return;
    }

    message.textContent = text;
    message.classList.remove("is-error", "is-success");

    if (type) {
        message.classList.add("is-" + type);
    }
}

function setChefSpeech(html) {
    const speech = document.getElementById("chefSpeech");

    if (speech) {
        speech.innerHTML = html;
    }
}

function showIbushiginReward() {
    const reward = document.getElementById("ibushiginReward");

    if (reward) {
        reward.hidden = false;
    }
}

function handleIbushiginAnswer(input) {
    const alreadyOwned =
        typeof window.hasItem === "function" &&
        window.hasItem("いぶしぎん");

    if (!alreadyOwned) {
        if (typeof window.obtainItem === "function") {
            window.obtainItem("いぶしぎん");
        } else if (typeof window.addItem === "function") {
            window.addItem("いぶしぎん");
        }

        setChefSpeech("渋いねえ。<br>こいつを持っていきな。");
        setStage5Message("隠しアイテム「いぶしぎん」を手に入れた。", "success");
    } else {
        setChefSpeech("そいつは、もう渡したよ。<br>ほかには何がほしい？");
        setStage5Message("「いぶしぎん」は入手済みだ。", "success");
    }

    showIbushiginReward();
    input.value = "";
    input.focus();
}

async function verifyStage5Answer(event) {
    if (event) {
        event.preventDefault();
    }

    if (stage5Clearing) {
        return;
    }

    const input = document.getElementById("stage5Answer");
    const submitButton = document.getElementById("stage5SubmitButton");

    if (!input || !submitButton) {
        return;
    }

    const answer = normalizeStage5Answer(input.value);

    if (!answer) {
        setStage5Message("何がほしいか、大将へ伝えてください。", "error");
        input.focus();
        return;
    }

    const ibushiginAnswers = [
        "いぶしぎん",
        "いぶし銀",
        "燻し銀"
    ];

    if (ibushiginAnswers.includes(answer)) {
        handleIbushiginAnswer(input);
        return;
    }

    const purpleAnswers = [
        "むらさき",
        "紫",
        "むらさきください",
        "むらさきをください",
        "紫ください",
        "紫をください"
    ];

    if (!purpleAnswers.includes(answer)) {
        setChefSpeech("うーん、何のことだい？");
        setStage5Message("メニュー表を、もう一度よく見てみよう。", "error");
        input.select();
        return;
    }

    stage5Clearing = true;
    input.disabled = true;
    submitButton.disabled = true;

    setStage5Message("大将に伝わった。", "success");
    setChefSpeech("お醤油ですね。<br>少々お待ちください。");

    window.clearStage?.(5);

    if (typeof window.obtainItem === "function") {
        window.obtainItem("醤油");
    } else if (typeof window.addItem === "function") {
        window.addItem("醤油");
    }

    await window.wait(1200);

    await window.SceneManager.changeScene(
        "stage5-clear",
        {
            fadeOutTime: 720,
            blackTime: 300,
            fadeInTime: 900
        }
    );

    stage5Clearing = false;
}

function toggleStage5Hint() {
    const hint = document.getElementById("stage5Hint");
    const button = document.getElementById("stage5HintButton");

    if (!hint || !button) {
        return;
    }

    hint.hidden = !hint.hidden;
    button.textContent = hint.hidden ? "ヒントを見る" : "ヒントを閉じる";
}

function resetStage5Puzzle() {
    const input = document.getElementById("stage5Answer");
    const submitButton = document.getElementById("stage5SubmitButton");
    const hint = document.getElementById("stage5Hint");
    const hintButton = document.getElementById("stage5HintButton");
    const reward = document.getElementById("ibushiginReward");

    if (input) {
        input.value = "";
        input.disabled = false;
    }

    if (submitButton) {
        submitButton.disabled = false;
    }

    if (hint) {
        hint.hidden = true;
    }

    if (hintButton) {
        hintButton.textContent = "ヒントを見る";
    }

    const ownsIbushigin =
        typeof window.hasItem === "function" &&
        window.hasItem("いぶしぎん");

    if (reward) {
        reward.hidden = !ownsIbushigin;
    }

    setChefSpeech("へい、いらっしゃい。<br>何がほしい？");
    setStage5Message("", "");
    stage5Clearing = false;
}

function initializeStage5Puzzle() {
    if (stage5Initialized) {
        return;
    }

    document.getElementById("stage5Form")?.addEventListener("submit", verifyStage5Answer);
    document.getElementById("stage5HintButton")?.addEventListener("click", toggleStage5Hint);
    stage5Initialized = true;
}

const initializeBeforeV091 = window.initializePuzzles;

window.initializePuzzles = function initializePuzzlesV091() {
    initializeBeforeV091?.();
    initializeStage5Puzzle();
};

window.resetStage5Puzzle = resetStage5Puzzle;
