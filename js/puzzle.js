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
            "何かが違うようだ。",
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


/* =========================================================
   Version 0.10：最終ステージコントローラー
   ========================================================= */
const Stage6Controller={
    initialized:false,
    state:null,
    el(id){return document.getElementById(id)},
    normalize(value){return String(value||"").trim().replace(/\s+/g,"").replace(/[!！?？。、,.・]+/g,"").toLowerCase()},
    setMessage(id,text,type=""){
        const el=this.el(id); if(!el)return;
        el.textContent=text; el.classList.remove("is-error","is-success");
        if(type)el.classList.add("is-"+type);
    },
    save(partial){this.state=Object.assign({},this.state||window.getStage6State?.()||{},partial||{});window.saveStage6State?.(partial||{})},
    flashPurple(){
        const flash=this.el("finalStatuePurpleFlash");
        const statue=this.el("finalStatue");
        if(flash){flash.classList.remove("is-active");void flash.offsetWidth;flash.classList.add("is-active")}
        if(statue){statue.classList.add("is-purple-flash");setTimeout(()=>statue.classList.remove("is-purple-flash"),900)}
    },
    async solvePatina(event){
        event?.preventDefault();
        const input=this.el("stage6PatinaAnswer");
        const button=this.el("stage6PatinaSubmit");
        if(!input||!button)return;
        const answer=this.normalize(input.value);
        if(!answer){this.setMessage("stage6PatinaMessage","緑色の正体を入力してください。","error");input.focus();return}
        if(!["緑青","ろくしょう"].includes(answer)){
            this.setMessage("stage6PatinaMessage","素材と、長い年月で生まれた色を調べよう。","error");input.select();return
        }
        input.disabled=true;button.disabled=true;
        this.el("finalStatue")?.classList.add("is-copper");
        this.setMessage("stage6PatinaMessage","正解。像は銅で作られ、緑青によって今の色になった。","success");
        this.save({patinaSolved:true});
        await window.wait(1000);
        const panel=this.el("stage6PurplePanel");if(panel)panel.hidden=false;
        panel?.scrollIntoView({behavior:"smooth",block:"center"});
    },
    selectPen(color){
        if(this.state?.transformed)return;
        const key=color==="red"?"redSelected":"blueSelected";
        this.state[key]=true;
        this.el(color==="red"?"stage6RedPen":"stage6BluePen")?.classList.add("is-selected");
        this.save({[key]:true});
        if(this.state.redSelected&&this.state.blueSelected&&!this.state.inkMixed){
            this.state.inkMixed=true;
            const result=this.el("stage6MixerResult");
            if(result){result.textContent="紫のインクができた。";result.classList.add("is-purple")}
            const apply=this.el("stage6ApplyInk");if(apply)apply.disabled=false;
            if(typeof window.obtainItem==="function")window.obtainItem("紫のインク");else window.addItem?.("紫のインク");
            this.save({inkMixed:true});
            this.setMessage("stage6PurpleMessage","第一の紫を手に入れた。","success");
        }
    },
    applyInk(){
        if(!this.state?.inkMixed||this.state.inkApplied)return;
        this.state.inkApplied=true;this.el("stage6ApplyInk")?.closest(".final-purple-item")?.classList.add("is-used");
        const b=this.el("stage6ApplyInk");if(b)b.disabled=true;
        this.el("stage6PurpleDot1")?.classList.add("is-filled");this.flashPurple();this.save({inkApplied:true});
        this.setMessage("stage6PurpleMessage","一つ目の紫をかけた。","success");this.checkTransformation();
    },
    applySoy(){
        if(this.state?.soyApplied)return;
        if(!(typeof window.hasItem==="function"&&window.hasItem("醤油"))){
            this.setMessage("stage6PurpleMessage","寿司屋で受け取ったものが必要だ。","error");return
        }
        this.state.soyApplied=true;this.el("stage6ApplySoy")?.closest(".final-purple-item")?.classList.add("is-used");
        const b=this.el("stage6ApplySoy");if(b)b.disabled=true;
        this.el("stage6PurpleDot2")?.classList.add("is-filled");this.flashPurple();this.save({soyApplied:true});
        this.setMessage("stage6PurpleMessage","寿司屋で『むらさき』と呼ばれる醤油をかけた。","success");this.checkTransformation();
    },
    async checkTransformation(){
        if(!this.state.inkApplied||!this.state.soyApplied||this.state.transformed)return;
        this.state.transformed=true;this.save({transformed:true});
        await window.wait(900);
        this.el("finalStatue")?.classList.add("is-gun");
        const kanji=this.el("stage6NameKanji");if(kanji){kanji.style.opacity="0";kanji.style.transform="scale(.75)";setTimeout(()=>{kanji.textContent="銃";kanji.style.opacity="1";kanji.style.transform="scale(1)"},360)}
        this.el("stage6NameReading")?.classList.add("is-gun");
        this.setMessage("stage6PurpleMessage","『ゆ』が小さくなった。じゆうは、じゅうになった。","success");
        await window.wait(1150);
        const panel=this.el("stage6ShadowPanel");if(panel)panel.hidden=false;
        panel?.scrollIntoView({behavior:"smooth",block:"center"});
    },
    async shootShadow(){
        if(this.state?.shadowShot)return;
        this.state.shadowShot=true;this.save({shadowShot:true});
        const target=this.el("stage6ShadowTarget");target?.classList.add("is-shot");if(target)target.disabled=true;
        this.setMessage("stage6ShadowMessage","光が、俯いていた影を貫いた。","success");
        document.querySelectorAll("audio").forEach(audio=>{try{audio.pause()}catch(_){}});
        window.clearStage?.(6);
        await window.wait(1300);
        await window.SceneManager.changeScene("stage6-clear",{fadeOutTime:900,blackTime:700,fadeInTime:1100});
        FinalLetterController.restore();
    },
    restore(){
        this.reset({preserveSave:true});
        this.state=window.getStage6State?.()||{};
        const s=this.state;
        if(s.patinaSolved){this.el("finalStatue")?.classList.add("is-copper");const i=this.el("stage6PatinaAnswer"),b=this.el("stage6PatinaSubmit");if(i)i.disabled=true;if(b)b.disabled=true;this.setMessage("stage6PatinaMessage","正解。像は銅で作られ、緑青によって今の色になった。","success");const p=this.el("stage6PurplePanel");if(p)p.hidden=false}
        if(s.redSelected)this.el("stage6RedPen")?.classList.add("is-selected");
        if(s.blueSelected)this.el("stage6BluePen")?.classList.add("is-selected");
        if(s.inkMixed){const r=this.el("stage6MixerResult");if(r){r.textContent="紫のインクができた。";r.classList.add("is-purple")}const b=this.el("stage6ApplyInk");if(b)b.disabled=false}
        if(s.inkApplied){this.el("stage6PurpleDot1")?.classList.add("is-filled");this.el("stage6ApplyInk")?.closest(".final-purple-item")?.classList.add("is-used");const b=this.el("stage6ApplyInk");if(b)b.disabled=true}
        if(s.soyApplied){this.el("stage6PurpleDot2")?.classList.add("is-filled");this.el("stage6ApplySoy")?.closest(".final-purple-item")?.classList.add("is-used");const b=this.el("stage6ApplySoy");if(b)b.disabled=true}
        if(s.transformed){this.el("finalStatue")?.classList.add("is-gun");const k=this.el("stage6NameKanji");if(k)k.textContent="銃";this.el("stage6NameReading")?.classList.add("is-gun");const p=this.el("stage6ShadowPanel");if(p)p.hidden=false;this.setMessage("stage6PurpleMessage","『ゆ』が小さくなった。じゆうは、じゅうになった。","success")}
        if(s.shadowShot){const target=this.el("stage6ShadowTarget");target?.classList.add("is-shot");if(target)target.disabled=true;this.setMessage("stage6ShadowMessage","光が、俯いていた影を貫いた。","success")}
    },
    reset({preserveSave=false}={}){
        this.state={patinaSolved:false,redSelected:false,blueSelected:false,inkMixed:false,inkApplied:false,soyApplied:false,transformed:false,shadowShot:false,letterFolded:false,ended:false};
        this.el("finalStatue")?.classList.remove("is-copper","is-gun","is-purple-flash");
        const k=this.el("stage6NameKanji");if(k){k.textContent="自由";k.style.opacity="";k.style.transform=""}this.el("stage6NameReading")?.classList.remove("is-gun");
        const i=this.el("stage6PatinaAnswer"),s=this.el("stage6PatinaSubmit");if(i){i.value="";i.disabled=false}if(s)s.disabled=false;
        const pp=this.el("stage6PurplePanel");if(pp)pp.hidden=true;const sp=this.el("stage6ShadowPanel");if(sp)sp.hidden=true;
        ["stage6RedPen","stage6BluePen"].forEach(id=>this.el(id)?.classList.remove("is-selected"));
        const result=this.el("stage6MixerResult");if(result){result.textContent="まだ混ざっていない";result.classList.remove("is-purple")}
        const ink=this.el("stage6ApplyInk"),soy=this.el("stage6ApplySoy");if(ink)ink.disabled=true;if(soy)soy.disabled=false;
        document.querySelectorAll(".final-purple-item").forEach(el=>el.classList.remove("is-used"));["stage6PurpleDot1","stage6PurpleDot2"].forEach(id=>this.el(id)?.classList.remove("is-filled"));
        const target=this.el("stage6ShadowTarget");target?.classList.remove("is-shot");if(target)target.disabled=false;
        ["stage6PatinaMessage","stage6PurpleMessage"].forEach(id=>this.setMessage(id,""));this.setMessage("stage6ShadowMessage","影に狙いを定めよう。");
        if(!preserveSave)window.resetStage6State?.();
    },
    init(){
        if(this.initialized)return;
        this.el("stage6PatinaForm")?.addEventListener("submit",event=>this.solvePatina(event));
        this.el("stage6RedPen")?.addEventListener("click",()=>this.selectPen("red"));this.el("stage6BluePen")?.addEventListener("click",()=>this.selectPen("blue"));
        this.el("stage6ApplyInk")?.addEventListener("click",()=>this.applyInk());this.el("stage6ApplySoy")?.addEventListener("click",()=>this.applySoy());
        this.el("stage6ShadowTarget")?.addEventListener("click",()=>this.shootShadow());this.initialized=true;
    }
};

/* 最後の手紙 */
const FinalLetterController={
    initialized:false,
    folded:false,
    fold(){
        if(this.folded)return;this.folded=true;
        document.getElementById("finalLetter")?.classList.add("is-folded");
        const fold=document.getElementById("foldFinalLetterButton");if(fold)fold.disabled=true;
        const go=document.getElementById("goToWindowButton");if(go)go.hidden=false;
        window.saveStage6State?.({letterFolded:true});
    },
    restore(){
        const state=window.getStage6State?.()||{};this.folded=Boolean(state.letterFolded);
        document.getElementById("finalLetter")?.classList.toggle("is-folded",this.folded);
        const fold=document.getElementById("foldFinalLetterButton");if(fold)fold.disabled=this.folded;
        const go=document.getElementById("goToWindowButton");if(go)go.hidden=!this.folded;
    },
    reset(){this.folded=false;document.getElementById("finalLetter")?.classList.remove("is-folded");const f=document.getElementById("foldFinalLetterButton");if(f)f.disabled=false;const g=document.getElementById("goToWindowButton");if(g)g.hidden=true},
    init(){if(this.initialized)return;document.getElementById("foldFinalLetterButton")?.addEventListener("click",()=>this.fold());document.getElementById("goToWindowButton")?.addEventListener("click",async()=>{EndingPlaneController.reset();await window.SceneManager.changeScene("ending-plane",{fadeOutTime:800,blackTime:450,fadeInTime:900})});this.initialized=true}
};

/* 最後の紙飛行機 */
const EndingPlaneController={
    initialized:false,pointerId:null,startX:0,startY:0,currentX:0,currentY:0,completed:false,
    reset(){this.pointerId=null;this.completed=false;const p=document.getElementById("endingPlane"),t=document.getElementById("endingPlaneTrail");if(p){p.classList.remove("is-dragging","is-flying");p.style.transform="rotate(-18deg)";p.style.opacity="";p.disabled=false}t?.classList.remove("is-visible");const m=document.getElementById("endingPlaneMessage");if(m){m.textContent="紙飛行機に触れて、そのまま右上へ。";m.classList.remove("is-error","is-success")}},
    finish(){
        if(this.pointerId===null||this.completed)return;const dx=this.currentX-this.startX,dy=this.currentY-this.startY;this.pointerId=null;const p=document.getElementById("endingPlane");p?.classList.remove("is-dragging");
        if(dx>=120&&dy<=-100){this.complete();return}
        if(p)p.style.transform="rotate(-18deg)";const m=document.getElementById("endingPlaneMessage");if(m){m.textContent="もう少し大きく、右上へ飛ばそう。";m.classList.add("is-error")}
    },
    async complete(){
        if(this.completed)return;this.completed=true;const p=document.getElementById("endingPlane"),a=document.getElementById("endingPlaneArea"),t=document.getElementById("endingPlaneTrail");if(!p||!a)return;
        p.disabled=true;p.classList.add("is-flying");t?.classList.add("is-visible");const r=a.getBoundingClientRect();p.style.transform=`translate3d(${r.width*.82}px,-${r.height*.82}px,0) rotate(-29deg)`;
        const m=document.getElementById("endingPlaneMessage");if(m){m.textContent="紙飛行機は、背景の向こうへ飛んでいった。";m.classList.add("is-success")}
        window.saveStage6State?.({ended:true});await window.wait(1100);await window.SceneManager.changeScene("end",{fadeOutTime:1000,blackTime:900,fadeInTime:1500});updateEndSecretBadge();
    },
    init(){
        if(this.initialized)return;const p=document.getElementById("endingPlane");if(!p)return;
        p.addEventListener("pointerdown",e=>{if(this.completed)return;e.preventDefault();this.pointerId=e.pointerId;this.startX=this.currentX=e.clientX;this.startY=this.currentY=e.clientY;p.setPointerCapture(e.pointerId);p.classList.add("is-dragging")});
        p.addEventListener("pointermove",e=>{if(this.pointerId!==e.pointerId||this.completed)return;e.preventDefault();this.currentX=e.clientX;this.currentY=e.clientY;p.style.transform=`translate3d(${this.currentX-this.startX}px,${this.currentY-this.startY}px,0) rotate(-24deg)`});
        p.addEventListener("pointerup",e=>{if(this.pointerId!==e.pointerId)return;e.preventDefault();this.finish()});p.addEventListener("pointercancel",()=>this.finish());this.initialized=true;
    }
};
function updateEndSecretBadge(){const badge=document.getElementById("ibushiginEndBadge");if(badge)badge.hidden=!(typeof window.hasItem==="function"&&window.hasItem("いぶしぎん"))}

const initializeBeforeV010=window.initializePuzzles;
window.initializePuzzles=function initializePuzzlesV010(){initializeBeforeV010?.();Stage6Controller.init();FinalLetterController.init();EndingPlaneController.init()};
window.Stage6Controller=Stage6Controller;window.FinalLetterController=FinalLetterController;window.EndingPlaneController=EndingPlaneController;window.updateEndSecretBadge=updateEndSecretBadge;


/* =========================================================
   Version 0.10.1：最終手紙ナビゲーション修正
   ========================================================= */

(function installFinalLetterButtonFix() {

    "use strict";

    if (window.__finalLetterButtonFixV0101) {
        return;
    }

    window.__finalLetterButtonFixV0101 = true;


    /**
     * 「窓辺へ」ボタンを確実に表示して操作可能にします。
     */
    function revealWindowButton() {

        const button =
            document.getElementById(
                "goToWindowButton"
            );

        if (!button) {
            return;
        }

        button.hidden = false;
        button.removeAttribute("hidden");
        button.disabled = false;
        button.setAttribute(
            "aria-hidden",
            "false"
        );

        button.style.display =
            "inline-flex";

        button.style.pointerEvents =
            "auto";

        /*
            スマートフォンで画面外に現れた場合、
            ボタンが見える位置まで自動で移動します。
        */
        window.setTimeout(
            function scrollToWindowButton() {

                button.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest"
                });
            },
            180
        );
    }


    /**
     * 手紙を紙飛行機へ折った状態にします。
     */
    function foldFinalLetter() {

        const letter =
            document.getElementById(
                "finalLetter"
            );

        const foldButton =
            document.getElementById(
                "foldFinalLetterButton"
            );

        if (letter) {
            letter.classList.add(
                "is-folded"
            );
        }

        if (foldButton) {
            foldButton.disabled = true;
        }

        revealWindowButton();

        if (
            typeof window.saveStage6State ===
            "function"
        ) {
            window.saveStage6State({
                letterFolded: true
            });
        }
    }


    /**
     * 紙飛行機を飛ばす画面へ移動します。
     */
    async function goToEndingPlane(
        button
    ) {

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

            if (
                window.EndingPlaneController &&
                typeof window.EndingPlaneController.reset ===
                    "function"
            ) {
                window.EndingPlaneController.reset();
            }

            if (
                window.SceneManager &&
                typeof window.SceneManager.changeScene ===
                    "function"
            ) {

                await window.SceneManager.changeScene(
                    "ending-plane",
                    {
                        fadeOutTime: 800,
                        blackTime: 450,
                        fadeInTime: 900
                    }
                );

                return;
            }

            throw new Error(
                "SceneManager.changeScene is unavailable."
            );

        } catch (error) {

            console.error(
                "窓辺への遷移に失敗しました。",
                error
            );

            /*
                アニメーション遷移が失敗した場合も、
                最終手段として画面を直接表示します。
            */
            if (
                window.SceneManager &&
                typeof window.SceneManager.showImmediately ===
                    "function"
            ) {
                window.SceneManager.showImmediately(
                    "ending-plane"
                );
            }

        } finally {

            button.disabled = false;

            button.dataset.transitioning =
                "false";
        }
    }


    /*
        個別イベントの初期化順に依存しないよう、
        document全体でクリックを捕捉します。
    */
    document.addEventListener(
        "click",
        async function finalLetterNavigationFix(
            event
        ) {

            const target = event.target;

            if (
                !target ||
                typeof target.closest !==
                    "function"
            ) {
                return;
            }


            const foldButton =
                target.closest(
                    "#foldFinalLetterButton"
                );

            if (foldButton) {

                event.preventDefault();
                event.stopImmediatePropagation();

                foldFinalLetter();

                return;
            }


            const windowButton =
                target.closest(
                    "#goToWindowButton"
                );

            if (!windowButton) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();

            await goToEndingPlane(
                windowButton
            );
        },
        true
    );


    /**
     * リロード復帰時にもボタン状態を同期します。
     */
    function restoreFinalLetterButton() {

        if (
            typeof window.getStage6State !==
            "function"
        ) {
            return;
        }

        const state =
            window.getStage6State() || {};

        if (state.letterFolded) {

            document
                .getElementById(
                    "finalLetter"
                )
                ?.classList.add(
                    "is-folded"
                );

            const foldButton =
                document.getElementById(
                    "foldFinalLetterButton"
                );

            if (foldButton) {
                foldButton.disabled = true;
            }

            revealWindowButton();
        }
    }


    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            restoreFinalLetterButton
        );

    } else {
        restoreFinalLetterButton();
    }

    window.addEventListener(
        "pageshow",
        restoreFinalLetterButton
    );

})();
