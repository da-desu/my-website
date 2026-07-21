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

    const selectedTiles = tiles.filter(function (tile) {
        return tile.classList.contains("is-selected");
    });

    const selectedCount = selectedTiles.length;

    if (selectedCount === 0) {
        setStage1Message(
            "画像を選択してください。",
            "error"
        );
        return;
    }

    const duplicateTiles = tiles.filter(function (tile) {
        return tile.dataset.duplicate === "true";
    });

    const selectedOnlyDuplicatePair =
        selectedCount === duplicateTiles.length &&
        duplicateTiles.every(function (tile) {
            return tile.classList.contains("is-selected");
        });

    if (selectedOnlyDuplicatePair) {
        setStage1Message(
            "他にも“同じソメイヨシノ”があるようだ",
            ""
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
        "あなたは”見た目”で判断しませんでした。",
        "success"
    );

    if (typeof window.clearStage === "function") {
        window.clearStage(1);
    }

    await window.wait(1500);

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



/* =========================================================
   Version 0.11.7：第二問「動かせる桜の花びら」
   ========================================================= */
const Stage2PetalController = {
    initialized: false,
    activePointer: null,

    /*
        x / y は、手紙画像に対する割合です。
        fixed:true の2枚だけは動きません。
        1枚目は「桜」、2枚目は「消えたようだ。」の「だ」を覆います。
    */
    petals: [
        {id:"fixed-sakura",x:18.7,y:13.9,size:12.0,rotation:-18,fixed:true},
        {id:"fixed-da",x:68.5,y:56.4,size:10.5,rotation:24,fixed:true},

        {id:"p01",x:31,y:14,size:10,rotation:35},
        {id:"p02",x:45,y:13,size:12,rotation:-42},
        {id:"p03",x:59,y:15,size:9,rotation:12},
        {id:"p04",x:76,y:14,size:11,rotation:58},
        {id:"p05",x:84,y:19,size:9,rotation:-25},
        {id:"p06",x:20,y:24,size:11,rotation:72},
        {id:"p07",x:36,y:24,size:13,rotation:-8},
        {id:"p08",x:50,y:25,size:10,rotation:41},
        {id:"p09",x:65,y:24,size:12,rotation:-56},
        {id:"p10",x:80,y:27,size:11,rotation:18},
        {id:"p11",x:25,y:35,size:12,rotation:-33},
        {id:"p12",x:40,y:36,size:10,rotation:67},
        {id:"p13",x:55,y:35,size:13,rotation:5},
        {id:"p14",x:70,y:36,size:11,rotation:-72},
        {id:"p15",x:83,y:38,size:9,rotation:31},
        {id:"p16",x:17,y:46,size:10,rotation:48},
        {id:"p17",x:33,y:46,size:13,rotation:-16},
        {id:"p18",x:48,y:47,size:11,rotation:78},
        {id:"p19",x:62,y:46,size:12,rotation:-44},
        {id:"p20",x:79,y:48,size:10,rotation:14},
        {id:"p21",x:22,y:57,size:13,rotation:-60},
        {id:"p22",x:38,y:58,size:10,rotation:26},
        {id:"p23",x:53,y:57,size:12,rotation:-5},
        {id:"p24",x:82,y:58,size:11,rotation:63},
        {id:"p25",x:18,y:68,size:11,rotation:8},
        {id:"p26",x:34,y:69,size:12,rotation:-47},
        {id:"p27",x:49,y:68,size:10,rotation:74},
        {id:"p28",x:64,y:70,size:13,rotation:-22},
        {id:"p29",x:80,y:69,size:10,rotation:39},
        {id:"p30",x:25,y:81,size:12,rotation:-70},
        {id:"p31",x:43,y:80,size:10,rotation:16},
        {id:"p32",x:61,y:81,size:12,rotation:52},
        {id:"p33",x:78,y:82,size:11,rotation:-34},
        {id:"p34",x:53,y:90,size:9,rotation:7}
    ],

    layer(){
        return document.getElementById("stage2PetalLayer");
    },

    updateClearedState(){
        const layer=this.layer();
        if(!layer)return;
        const movable=layer.querySelectorAll('.stage2-drag-petal:not(.is-fixed)');
        layer.classList.toggle('is-cleared', movable.length===0);
    },

    createPetal(data){
        const petal=document.createElement("button");
        petal.type="button";
        petal.className="stage2-drag-petal"+(data.fixed?" is-fixed":"");
        petal.dataset.petalId=data.id;
        petal.dataset.fixed=data.fixed?"true":"false";
        petal.dataset.rotation=String(data.rotation);
        petal.setAttribute("aria-label",data.fixed?"動かない桜の花":"動かせる桜の花");
        petal.style.left=data.x+"%";
        petal.style.top=data.y+"%";
        petal.style.setProperty("--petal-size",data.size+"%");
        petal.style.setProperty("--petal-rotation",data.rotation+"deg");
        petal.style.setProperty("--petal-font-size",(data.size*4.2)+"px");
        petal.textContent="🌸";
        petal.addEventListener("pointerdown",event=>this.startDrag(event,petal));
        return petal;
    },

    render(){
        const layer=this.layer();
        if(!layer)return;
        layer.replaceChildren();
        this.petals.forEach(data=>layer.appendChild(this.createPetal(data)));
        this.updateClearedState();
    },

    startDrag(event,petal){
        if(isStage2Clearing)return;
        event.preventDefault();

        if(petal.dataset.fixed==="true"){
            petal.classList.remove("is-tested");
            void petal.offsetWidth;
            petal.classList.add("is-tested");
            return;
        }

        if(this.activePointer)return;

        const rect=petal.getBoundingClientRect();
        this.activePointer={
            id:event.pointerId,
            petal,
            startX:event.clientX,
            startY:event.clientY,
            dx:0,
            dy:0,
            rotation:Number(petal.dataset.rotation||0),
            width:rect.width
        };

        petal.classList.add("is-dragging");
        petal.setPointerCapture?.(event.pointerId);

        const move=e=>this.moveDrag(e);
        const end=e=>this.endDrag(e,move,end);
        petal.addEventListener("pointermove",move);
        petal.addEventListener("pointerup",end);
        petal.addEventListener("pointercancel",end);
    },

    moveDrag(event){
        const state=this.activePointer;
        if(!state||event.pointerId!==state.id)return;
        event.preventDefault();
        state.dx=event.clientX-state.startX;
        state.dy=event.clientY-state.startY;
        state.petal.style.transform=
            `translate(-50%,-50%) translate3d(${state.dx}px,${state.dy}px,0) rotate(${state.rotation+state.dx*.08}deg)`;
    },

    endDrag(event,move,end){
        const state=this.activePointer;
        if(!state||event.pointerId!==state.id)return;

        const petal=state.petal;
        petal.removeEventListener("pointermove",move);
        petal.removeEventListener("pointerup",end);
        petal.removeEventListener("pointercancel",end);
        petal.releasePointerCapture?.(event.pointerId);
        petal.classList.remove("is-dragging");

        const distance=Math.hypot(state.dx,state.dy);
        this.activePointer=null;

        if(distance<72){
            petal.style.transform="";
            return;
        }

        const length=Math.max(distance,1);
        const directionX=state.dx/length;
        const directionY=state.dy/length;
        const flyDistance=Math.max(window.innerWidth,window.innerHeight)*1.35;
        const flyX=state.dx+(directionX*flyDistance);
        const flyY=state.dy+(directionY*flyDistance);

        petal.classList.add("is-leaving");
        petal.style.transform=
            `translate(-50%,-50%) translate3d(${flyX}px,${flyY}px,0) rotate(${state.rotation+240}deg) scale(.65)`;

        window.setTimeout(()=>{
            petal.remove();
            this.updateClearedState();
        },620);
    },

    scatterAll(){
        const petals=Array.from(document.querySelectorAll("#stage2PetalLayer .stage2-drag-petal"));
        petals.forEach((petal,index)=>{
            const angle=((index*137.5)%360)*(Math.PI/180);
            const distance=Math.max(window.innerWidth,window.innerHeight)*(1.05+(index%4)*.12);
            petal.classList.add("is-leaving");
            petal.style.transitionDelay=(index%8)*18+"ms";
            petal.style.transform=
                `translate(-50%,-50%) translate3d(${Math.cos(angle)*distance}px,${Math.sin(angle)*distance}px,0) rotate(${300+index*17}deg) scale(.5)`;
        });
    },

    reset(){
        this.activePointer=null;
        this.render();
    },

    init(){
        if(this.initialized)return;
        this.render();
        this.initialized=true;
    }
};

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
        setStage2Message(
            "違うようだ。手紙の文字の並びを見直そう。",
            "error"
        );

        input.select();

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

    Stage2PetalController.scatterAll();

    const petalTransition =
        document.getElementById("stage2PetalTransition");

    if (petalTransition) {
        petalTransition.classList.remove("is-active");
        void petalTransition.offsetWidth;
        petalTransition.classList.add("is-active");
    }

    await window.wait(1850);

    await window.SceneManager.changeScene(
        "stage2-clear",
        {
            fadeOutTime: 180,
            blackTime: 80,
            fadeInTime: 900
        }
    );

    petalTransition?.classList.remove("is-active");
    isStage2Clearing = false;
}


function resetStage2Puzzle() {
    const input =
        document.getElementById("stage2Answer");

    const submitButton =
        document.getElementById(
            "stage2SubmitButton"
        );

    if (input) {
        input.value = "";
        input.disabled = false;
    }

    if (submitButton) {
        submitButton.disabled = false;
    }

    setStage2Message("", "");

    document
        .getElementById("stage2PetalTransition")
        ?.classList.remove("is-active");

    Stage2PetalController.reset();
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

    Stage2PetalController.init();

    const stage2Form =
        document.getElementById("stage2Form");

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
}

window.initializePuzzles =
    initializeAllPuzzles;

window.resetStage2Puzzle =
    resetStage2Puzzle;


/* Version 0.7: Stage3 */
let isStage3Clearing=false;
function setStage3AnswerMessage(text,type){const m=document.getElementById("stage3Message");if(!m)return;m.textContent=text;m.classList.remove("is-error","is-success");if(type)m.classList.add("is-"+type)}
async function verifyStage3Answer(e){e?.preventDefault();if(isStage3Clearing)return;const input=document.getElementById("stage3Answer"),button=document.getElementById("stage3SubmitButton");if(!input||!button)return;const answer=String(input.value||"").trim().replace(/\s+/g,"");if(!answer){setStage3AnswerMessage("方向を入力してください。","error");input.focus();return}if(answer!=="北"){setStage3AnswerMessage("違うようだ。看板の組み合わせを見直そう。","error");input.select();return}isStage3Clearing=true;input.disabled=true;button.disabled=true;setStage3AnswerMessage("正解。北へ向かおう。","success");window.clearStage?.(3);if(window.obtainItem)window.obtainItem("寿司屋への地図");else window.addItem?.("寿司屋への地図");await window.wait(720);await window.SceneManager.changeScene("stage3-clear",{fadeOutTime:720,blackTime:320,fadeInTime:900});isStage3Clearing=false}
function resetStage3Puzzle(){const i=document.getElementById("stage3Answer"),b=document.getElementById("stage3SubmitButton");if(i){i.value="";i.disabled=false}if(b)b.disabled=false;setStage3AnswerMessage("","");isStage3Clearing=false}
const prevInit=window.initializePuzzles;window.initializePuzzles=function(){prevInit?.();const f=document.getElementById("stage3Form");if(f&&!f.dataset.initialized){f.addEventListener("submit",verifyStage3Answer);f.dataset.initialized="true"}};window.resetStage3Puzzle=resetStage3Puzzle;

/* =========================================================
   Version 0.8 Rebuild：第4問コントローラー
   ========================================================= */
const Stage4Controller={
    initialized:false,
    folded:false,
    completed:false,
    timer:null,
    waitMs:30000,
    pinchStartDistance:null,
    pinchTriggered:false,
    pinchStartedAcrossSides:false,

    el(id){return document.getElementById(id);},

    setStatus(id,text,type=""){
        const target=this.el(id);
        if(!target)return;
        target.textContent=text;
        target.hidden=!text;
        target.classList.remove("is-error","is-success");
        if(type){target.classList.add(type==="error"?"is-error":"is-success");}
    },

    getTouchDistance(t1,t2){
        return Math.hypot(t1.clientX-t2.clientX,t1.clientY-t2.clientY);
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
        setTimeout(()=>this.el("stage4Silence")?.classList.add("is-visible"),15000);
        this.timer=setTimeout(()=>this.complete(),this.waitMs);
    },

    async fold(){
        if(this.folded||this.completed)return;
        this.folded=true;
        this.el("stage4FoldMap")?.classList.add("is-folded");
        this.setStatus("stage4MapMessage","");
        window.saveStage4State?.({folded:true});
        await window.wait(1050);
        const panel=this.el("stage4ChoicePanel");
        if(panel){
            panel.hidden=false;
            panel.scrollIntoView({behavior:"smooth",block:"center"});
        }
        this.setStatus("stage4ChoiceMessage","よく考えて選ぼう。");
        this.startTimer();
    },

    handleTouchStart(event){
        if(this.folded||this.completed)return;
        if(event.touches.length!==2)return;

        const map=this.el("stage4FoldMap");
        if(!map)return;

        const rect=map.getBoundingClientRect();
        const centerX=rect.left+(rect.width/2);
        const first=event.touches[0];
        const second=event.touches[1];
        const leftTouch=first.clientX<=second.clientX?first:second;
        const rightTouch=leftTouch===first?second:first;

        this.pinchStartedAcrossSides=
            leftTouch.clientX<centerX &&
            rightTouch.clientX>centerX;

        if(!this.pinchStartedAcrossSides){
            this.pinchStartDistance=null;
            return;
        }

        this.pinchStartDistance=this.getTouchDistance(leftTouch,rightTouch);
        this.pinchTriggered=false;
    },

    handleTouchMove(event){
        if(this.folded||this.completed)return;
        if(
            event.touches.length!==2 ||
            this.pinchStartDistance===null ||
            !this.pinchStartedAcrossSides
        )return;

        event.preventDefault();

        const current=this.getTouchDistance(event.touches[0],event.touches[1]);
        const delta=this.pinchStartDistance-current;

        if(delta>=42&&!this.pinchTriggered){
            this.pinchTriggered=true;
            this.fold();
        }
    },

    handleTouchEnd(){
        if(!this.folded){
            this.pinchStartDistance=null;
            this.pinchTriggered=false;
            this.pinchStartedAcrossSides=false;
        }
    },

    choose(){
        if(!this.folded||this.completed)return;
        this.stopTimer();
        this.setStatus("stage4ChoiceMessage","選択にも色々あるよね","error");
        this.startTimer();
    },

    async complete(){
        if(this.completed)return;
        this.completed=true;
        this.stopTimer();
        document.querySelectorAll(".stage4-choice-button").forEach(b=>b.disabled=true);
        this.setStatus("stage4ChoiceMessage","何もしなかった。すると――","success");
        const door=this.el("stage4Door");
        door?.scrollIntoView({behavior:"smooth",block:"center"});
        await window.wait(420);
        door?.classList.add("is-open");
        window.clearStage?.(4);
        window.saveStage4State?.({folded:true,doorOpened:true});
        await window.wait(1550);
        await window.SceneManager.changeScene("stage4-clear",{fadeOutTime:680,blackTime:280,fadeInTime:850});
    },

    reset({preserveSave=false}={}){
        this.stopTimer();
        this.folded=false;
        this.completed=false;
        this.pinchStartDistance=null;
        this.pinchTriggered=false;
        this.pinchStartedAcrossSides=false;
        this.el("stage4FoldMap")?.classList.remove("is-folded");
        this.el("stage4DoorWord")?.classList.remove("is-read-as-one");
        this.el("stage4Door")?.classList.remove("is-open");
        const choice=this.el("stage4ChoicePanel");
        if(choice)choice.hidden=true;
        document.querySelectorAll(".stage4-choice-button").forEach(b=>b.disabled=false);
        this.setStatus("stage4MapMessage","");
        this.setStatus("stage4ChoiceMessage","よく考えて選ぼう。");
        if(!preserveSave)window.resetStage4State?.();
    },

    restore(){
        this.reset({preserveSave:true});
        const state=window.getStage4State?.()||{};
        if(state.folded){
            this.folded=true;
            this.el("stage4FoldMap")?.classList.add("is-folded");
            this.setStatus("stage4MapMessage","");
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
        const map=this.el("stage4FoldMap");
        map?.addEventListener("touchstart",(e)=>this.handleTouchStart(e),{passive:true});
        map?.addEventListener("touchmove",(e)=>this.handleTouchMove(e),{passive:false});
        map?.addEventListener("touchend",()=>this.handleTouchEnd());
        map?.addEventListener("touchcancel",()=>this.handleTouchEnd());
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

function resetStage5Puzzle() {
    const input = document.getElementById("stage5Answer");
    const submitButton = document.getElementById("stage5SubmitButton");
    const reward = document.getElementById("ibushiginReward");

    if (input) {
        input.value = "";
        input.disabled = false;
    }

    if (submitButton) {
        submitButton.disabled = false;
    }


    const ownsIbushigin =
        typeof window.hasItem === "function" &&
        window.hasItem("いぶしぎん");

    if (reward) {
        reward.hidden = !ownsIbushigin;
    }

    setChefSpeech("今売り切れが多くてね。さんかくの間のものなら渡せるよ。");
    setStage5Message("", "");
    stage5Clearing = false;
}

function initializeStage5Puzzle() {
    if (stage5Initialized) {
        return;
    }

    document.getElementById("stage5Form")?.addEventListener("submit", verifyStage5Answer);
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
const Stage6Controller = {
    initialized: false,
    state: null,
    selectedItems: [],

    el(id) {
        return document.getElementById(id);
    },

    normalize(value) {
        return String(value || "")
            .trim()
            .replace(/\s+/g, "")
            .replace(/[!！?？。、,.・]+/g, "")
            .toLowerCase();
    },

    setMessage(id, text, type = "") {
        const element = this.el(id);
        if (!element) return;
        element.textContent = text;
        element.classList.remove("is-error", "is-success");
        if (type) element.classList.add(`is-${type}`);
    },

    save(partial) {
        this.state = Object.assign({}, this.state || window.getStage6State?.() || {}, partial || {});
        window.saveStage6State?.(partial || {});
    },

    getInventoryItems() {
        if (typeof window.getUsableInventoryItems === "function") {
            return window.getUsableInventoryItems();
        }
        const saveData = typeof window.getSaveData === "function" ? window.getSaveData() : null;
        return Array.isArray(saveData?.items) ? saveData.items : [];
    },

    async solvePatina(event) {
        event?.preventDefault?.();

        const input = this.el("stage6PatinaAnswer");
        const button = this.el("stage6PatinaSubmit");
        if (!input || !button) return;

        const answer = this.normalize(input.value);
        if (!answer) {
            this.setMessage("stage6PatinaMessage", "答えを入力してください。", "error");
            input.focus();
            return;
        }

        const currentColorAnswers = ["緑", "緑色", "みどり", "みどりいろ", "青銅", "せいどう", "青緑", "あおみどり"];
        if (currentColorAnswers.includes(answer)) {
            this.setMessage("stage6PatinaMessage", "今はね", "error");
            input.select();
            return;
        }

        const correctAnswers = ["銅", "どう", "銅色", "どういろ", "赤茶", "赤茶色", "あかちゃ", "あかちゃいろ", "赤褐色", "せきかっしょく"];
        if (!correctAnswers.includes(answer)) {
            this.setMessage("stage6PatinaMessage", "違うようだ。", "error");
            input.select();
            return;
        }

        input.disabled = true;
        button.disabled = true;
        this.el("finalStatue")?.classList.add("is-copper");
        this.setMessage("stage6PatinaMessage", "正解。自由の女神は、もともと銅の赤茶色だった。", "success");
        this.save({ patinaSolved: true });

        await window.wait(700);

        const panel = this.el("stage6PurplePanel");
        if (panel) panel.hidden = false;
        this.selectedItems = [];
        this.renderInventoryChoices();
        panel?.scrollIntoView({ behavior: "smooth", block: "center" });
    },

    renderInventoryChoices() {
        const container = this.el("stage6InventoryChoices");
        const count = this.el("stage6SelectionCount");
        const submit = this.el("stage6UseSelectedItems");
        if (!container) return;

        const items = this.getInventoryItems();
        container.replaceChildren();

        if (items.length === 0) {
            const empty = document.createElement("p");
            empty.className = "final-inventory-choices__empty";
            empty.textContent = "選べる持ち物がない。";
            container.appendChild(empty);
        } else {
            items.forEach(itemName => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "final-inventory-choice";
                button.dataset.itemName = itemName;
                button.textContent = itemName;

                const selected = this.selectedItems.includes(itemName);
                button.classList.toggle("is-selected", selected);
                button.setAttribute("aria-pressed", selected ? "true" : "false");
                button.addEventListener("click", () => this.toggleInventoryItem(itemName));
                container.appendChild(button);
            });
        }

        if (count) count.textContent = `${this.selectedItems.length} / 2`;
        if (submit) submit.disabled = this.selectedItems.length !== 2 || Boolean(this.state?.transformed);
    },

    toggleInventoryItem(itemName) {
        if (this.state?.transformed) return;

        const index = this.selectedItems.indexOf(itemName);
        if (index >= 0) {
            this.selectedItems.splice(index, 1);
        } else if (this.selectedItems.length < 2) {
            this.selectedItems.push(itemName);
        } else {
            this.setMessage("stage6PurpleMessage", "選べるのは二つまでだ。", "error");
            return;
        }

        this.setMessage("stage6PurpleMessage", "");
        this.renderInventoryChoices();
    },

    useSelectedItems() {
        if (this.state?.transformed || this.selectedItems.length !== 2) return;

        const selected = this.selectedItems.slice().sort((a, b) => a.localeCompare(b, "ja"));
        const correct = ["紫のインク", "醤油"].sort((a, b) => a.localeCompare(b, "ja"));
        const isCorrect = selected[0] === correct[0] && selected[1] === correct[1];

        if (!isCorrect) {
            this.setMessage("stage6PurpleMessage", "その二つでは、むらさきが二つにならない。", "error");
            this.selectedItems = [];
            this.renderInventoryChoices();
            return;
        }

        this.save({
            transformed: true,
            endingVideoWatched: false,
            endingStoryStep: 1,
            ended: false
        });

        const submit = this.el("stage6UseSelectedItems");
        if (submit) submit.disabled = true;
        document.querySelectorAll(".final-inventory-choice").forEach(button => {
            button.disabled = true;
        });

        window.clearStage?.(6);

        /*
            「選んだ2つをかける」のタップ操作が有効な間に、
            黒い動画シーンへ即時切り替えて再生を開始します。
            iPhone / iPadで音声付き動画の再生許可を失いにくくするため、
            非同期の暗転処理は挟みません。
        */
        if (window.SceneManager?.showImmediately) {
            window.SceneManager.showImmediately("stage6-clear");
        } else {
            const current = document.querySelector(".scene.is-active");
            const next = document.getElementById("scene-stage6-clear");
            current?.classList.remove("is-active");
            if (current) current.hidden = true;
            if (next) {
                next.hidden = false;
                next.classList.add("is-active");
            }
        }

        FinalLetterController.start();
    },

    restore() {
        this.reset({ preserveSave: true });
        this.state = window.getStage6State?.() || {};

        if (this.state.patinaSolved) {
            this.el("finalStatue")?.classList.add("is-copper");
            const input = this.el("stage6PatinaAnswer");
            const button = this.el("stage6PatinaSubmit");
            if (input) input.disabled = true;
            if (button) button.disabled = true;
            this.setMessage("stage6PatinaMessage", "正解。自由の女神は、もともと銅の赤茶色だった。", "success");

            const panel = this.el("stage6PurplePanel");
            if (panel) panel.hidden = false;
            this.renderInventoryChoices();
        }

        /* 旧版で変身済みのセーブデータも、新しい動画導線へ移します。 */
        if (this.state.transformed) {
            window.setTimeout(() => {
                window.SceneManager?.showImmediately?.("stage6-clear");
                FinalLetterController.restore();
            }, 120);
        }
    },

    reset({ preserveSave = false } = {}) {
        document.body.classList.remove("is-conclusion-story", "is-final-video-playing");
        this.state = {
            patinaSolved: false,
            transformed: false,
            endingVideoWatched: false,
            endingStoryStep: 1,
            ended: false
        };
        this.selectedItems = [];

        this.el("finalStatue")?.classList.remove("is-copper", "is-gun", "is-purple-flash");
        const kanji = this.el("stage6NameKanji");
        if (kanji) {
            kanji.textContent = "自由";
            kanji.style.opacity = "";
            kanji.style.transform = "";
        }
        this.el("stage6NameReading")?.classList.remove("is-gun");

        const input = this.el("stage6PatinaAnswer");
        const submitAnswer = this.el("stage6PatinaSubmit");
        if (input) {
            input.value = "";
            input.disabled = false;
        }
        if (submitAnswer) submitAnswer.disabled = false;

        const purplePanel = this.el("stage6PurplePanel");
        if (purplePanel) purplePanel.hidden = true;

        const choices = this.el("stage6InventoryChoices");
        if (choices) choices.replaceChildren();
        const count = this.el("stage6SelectionCount");
        if (count) count.textContent = "0 / 2";
        const useButton = this.el("stage6UseSelectedItems");
        if (useButton) useButton.disabled = true;

        this.setMessage("stage6PatinaMessage", "");
        this.setMessage("stage6PurpleMessage", "");

        if (!preserveSave) window.resetStage6State?.();
    },

    init() {
        if (this.initialized) return;
        this.el("stage6PatinaForm")?.addEventListener("submit", event => this.solvePatina(event));
        this.el("stage6UseSelectedItems")?.addEventListener("click", () => this.useSelectedItems());
        document.addEventListener("inventory:changed", () => {
            if (this.state?.patinaSolved && !this.state?.transformed) {
                this.renderInventoryChoices();
            }
        });
        this.initialized = true;
    }
};

/* 黒い画面で変身動画を再生するコントローラー。旧名を維持します。 */
const FinalLetterController = {
    initialized: false,
    finishing: false,

    elements() {
        return {
            video: document.getElementById("goddessTransformationVideo"),
            playButton: document.getElementById("finalVideoPlayButton"),
            message: document.getElementById("finalVideoMessage")
        };
    },

    setMessage(text) {
        const { message } = this.elements();
        if (message) message.textContent = text;
    },

    showPlayButton(label = "動画を再生") {
        const { playButton } = this.elements();
        if (!playButton) return;
        playButton.textContent = label;
        playButton.hidden = false;
        playButton.disabled = false;
    },

    start() {
        const { video, playButton } = this.elements();
        if (!video) {
            this.showPlayButton("物語の続きを見る");
            this.setMessage("動画を読み込めませんでした。");
            return;
        }

        this.finishing = false;
        document.body.classList.add("is-final-video-playing");
        if (playButton) playButton.hidden = true;
        this.setMessage("");

        try {
            video.pause();
            video.currentTime = 0;
            video.volume = 1;
            video.muted = false;
            const promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(() => {
                    this.showPlayButton("タップして動画を再生");
                    this.setMessage("再生ボタンをタップしてください。");
                });
            }
        } catch (error) {
            console.warn("変身動画を再生できませんでした。", error);
            this.showPlayButton("タップして動画を再生");
            this.setMessage("再生ボタンをタップしてください。");
        }
    },

    async finish() {
        if (this.finishing) return;
        this.finishing = true;

        const { video, playButton } = this.elements();
        let transitionLayer = document.getElementById("transitionLayer");
        let temporaryLayer = false;

        /*
           通常は共通の暗転レイヤーを使用します。
           万一HTML側のレイヤーが見つからない場合も、
           動画の最終フレームから黒へ移れるよう一時レイヤーを生成します。
        */
        if (!transitionLayer) {
            transitionLayer = document.createElement("div");
            transitionLayer.setAttribute("aria-hidden", "true");
            Object.assign(transitionLayer.style, {
                position: "fixed",
                inset: "0",
                zIndex: "10000",
                background: "#000",
                opacity: "0",
                visibility: "visible",
                pointerEvents: "none",
                transition: "opacity 650ms ease"
            });
            document.body.appendChild(transitionLayer);
            temporaryLayer = true;
        }

        const showEndingStoryScene = () => {
            if (
                window.SceneManager &&
                typeof window.SceneManager.showImmediately === "function"
            ) {
                window.SceneManager.showImmediately("ending-plane");
                return true;
            }

            const target = document.querySelector('[data-scene="ending-plane"]');
            if (!target) return false;

            document.querySelectorAll(".scene").forEach(scene => {
                scene.classList.remove("is-active");
                scene.hidden = true;
                scene.setAttribute("aria-hidden", "true");
            });

            target.hidden = false;
            target.setAttribute("aria-hidden", "false");
            target.classList.add("is-active");
            target.scrollTop = 0;
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });

            if (window.SceneManager) {
                window.SceneManager.currentScene = "ending-plane";
            }
            window.saveCurrentScene?.("ending-plane");
            return true;
        };

        try {
            video?.pause();
        } catch (_) {}
        if (playButton) playButton.disabled = true;

        window.saveStage6State?.({
            endingVideoWatched: true,
            endingStoryStep: 1
        });

        try {
            /* 動画の最終フレームから650msかけて黒へ。 */
            transitionLayer.style.transitionDuration = "650ms";
            transitionLayer.classList.add("is-visible");
            if (temporaryLayer) transitionLayer.style.opacity = "1";
            await window.wait(680);

            /*
               完全に黒くなった後で背面のシーンを切り替えます。
               ここで切り替えるため、ストーリーが一瞬先に見えることはありません。
            */
            if (!showEndingStoryScene()) {
                throw new Error("ending-plane scene was not found.");
            }
            EndingPlaneController.reset({ forceFirst: true });

            /* 完全な黒画面を1秒間維持します。 */
            await window.wait(1000);

            /* 黒から「ゲームの終わり」へ650msかけてフェードします。 */
            transitionLayer.style.transitionDuration = "650ms";
            transitionLayer.classList.remove("is-visible");
            if (temporaryLayer) transitionLayer.style.opacity = "0";
            await window.wait(680);

        } catch (error) {
            console.error("動画終了後の画面遷移に失敗しました。", error);

            /* 演出に失敗しても、ゲームが停止しないよう最終表示を保証します。 */
            showEndingStoryScene();
            EndingPlaneController.reset({ forceFirst: true });
            transitionLayer.classList.remove("is-visible");
            if (temporaryLayer) transitionLayer.style.opacity = "0";

        } finally {
            document.body.classList.remove("is-final-video-playing");
            if (playButton) playButton.disabled = false;
            if (temporaryLayer) transitionLayer.remove();
            this.finishing = false;
        }
    },

    restore() {
        const state = window.getStage6State?.() || {};
        document.body.classList.add("is-final-video-playing");
        const { video } = this.elements();
        if (video) {
            try {
                video.pause();
                video.currentTime = 0;
            } catch (_) {}
        }

        if (state.endingVideoWatched) {
            this.showPlayButton("物語の続きを見る");
            this.setMessage("動画は再生済みです。");
        } else {
            this.showPlayButton("動画を再生");
            this.setMessage("タップして動画を再生してください。");
        }
    },

    reset() {
        this.finishing = false;
        document.body.classList.remove("is-final-video-playing");
        const { video, playButton } = this.elements();
        if (video) {
            try {
                video.pause();
                video.currentTime = 0;
            } catch (_) {}
        }
        if (playButton) {
            playButton.hidden = true;
            playButton.disabled = false;
        }
        this.setMessage("");
    },

    init() {
        if (this.initialized) return;

        const { video, playButton } = this.elements();
        video?.addEventListener("ended", () => this.finish());
        video?.addEventListener("error", () => {
            this.showPlayButton("物語の続きを見る");
            this.setMessage("動画を再生できませんでした。");
        });

        playButton?.addEventListener("click", () => {
            const state = window.getStage6State?.() || {};
            if (state.endingVideoWatched || video?.error) {
                this.finish();
                return;
            }
            this.start();
        });

        this.initialized = true;
    }
};

/* 二つのストーリーシートを順番に表示するコントローラー。旧名を維持します。 */
const EndingPlaneController = {
    initialized: false,
    transitioning: false,
    step: 1,
    pointerId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    completed: false,
    scrollPinToken: 0,

    elements() {
        return {
            firstScene: document.getElementById("scene-ending-plane"),
            secondScene: document.getElementById("scene-ending-reflection"),
            firstStory: document.getElementById("girlEndingStory"),
            secondStory: document.getElementById("reflectionEndingStory"),
            nextButton: document.getElementById("girlEndingNextButton"),
            plane: document.getElementById("endingPlane")
        };
    },

    /**
     * Version 0.11.17
     * 「ゲームの終わり」と「帰り道」は、同じシーン内の表示切替ではなく
     * 完全に別の.sceneとして表示します。
     * これにより、前画面のスクロール位置を構造上引き継ぎません。
     */
    forceSceneTop(scene, { duration = 900, enablePlane = false } = {}) {
        const token = ++this.scrollPinToken;
        const { plane } = this.elements();
        if (!scene) return;

        scene.classList.add("is-pinning-story-top");

        if (plane) {
            plane.disabled = true;
            plane.setAttribute("tabindex", "-1");
        }

        const resetTop = () => {
            if (token !== this.scrollPinToken) return;
            scene.scrollTop = 0;
            scene.scrollLeft = 0;
            scene.scrollTo?.({ top: 0, left: 0, behavior: "auto" });

            const inner = scene.querySelector(".conclusion-story-scene__inner");
            if (inner) {
                inner.scrollTop = 0;
                inner.scrollLeft = 0;
            }

            const scrollingElement = document.scrollingElement;
            if (scrollingElement) {
                scrollingElement.scrollTop = 0;
                scrollingElement.scrollLeft = 0;
            }

            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        };

        resetTop();
        window.requestAnimationFrame(() => {
            resetTop();
            window.requestAnimationFrame(resetTop);
        });

        [40, 120, 260, 520, 780].forEach(delay => {
            window.setTimeout(resetTop, delay);
        });

        window.setTimeout(() => {
            if (token !== this.scrollPinToken) return;
            resetTop();
            scene.classList.remove("is-pinning-story-top");
            resetTop();

            if (enablePlane && this.step === 2 && !this.completed && plane) {
                plane.disabled = false;
                plane.removeAttribute("tabindex");
            }
        }, duration);
    },

    showSceneDirectly(sceneName) {
        const target = document.querySelector('[data-scene="' + sceneName + '"]');
        if (!target) return false;

        document.querySelectorAll(".scene").forEach(scene => {
            scene.classList.remove("is-active");
            scene.hidden = true;
            scene.setAttribute("aria-hidden", "true");
        });

        target.hidden = false;
        target.setAttribute("aria-hidden", "false");
        target.classList.add("is-active");

        if (window.SceneManager) {
            window.SceneManager.currentScene = sceneName;
        }

        return true;
    },

    prepareFirstStory() {
        const { firstStory, nextButton } = this.elements();
        this.step = 1;
        document.body.classList.add("is-conclusion-story");

        if (nextButton) nextButton.disabled = false;
        if (firstStory) {
            firstStory.hidden = false;
            firstStory.classList.remove("is-leaving");
            firstStory.classList.add("is-visible");
        }

        const scene = document.getElementById("scene-ending-plane");
        this.forceSceneTop(scene, { duration: 500 });
    },

    prepareReflectionStory() {
        const { secondStory } = this.elements();
        this.step = 2;
        document.body.classList.add("is-conclusion-story");
        this.resetPlane({ temporarilyDisabled: true });

        if (secondStory) {
            secondStory.hidden = false;
            secondStory.classList.remove("is-leaving");
            secondStory.classList.add("is-visible");
        }

        const scene = document.getElementById("scene-ending-reflection");
        this.forceSceneTop(scene, {
            duration: 1000,
            enablePlane: true
        });
    },

    resetPlane({ temporarilyDisabled = false } = {}) {
        this.pointerId = null;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.completed = false;

        const plane = document.getElementById("endingPlane");
        const trail = document.getElementById("endingPlaneTrail");
        const message = document.getElementById("endingPlaneMessage");

        if (plane) {
            plane.classList.remove("is-dragging", "is-flying");
            plane.style.transform = "rotate(-18deg)";
            plane.style.opacity = "";
            plane.disabled = temporarilyDisabled;

            if (temporarilyDisabled) {
                plane.setAttribute("tabindex", "-1");
            } else {
                plane.removeAttribute("tabindex");
            }
        }

        trail?.classList.remove("is-visible");

        if (message) {
            message.textContent = "紙飛行機に触れて、そのまま右上へ。";
            message.classList.remove("is-error", "is-success");
        }
    },

    reset({ forceFirst = false } = {}) {
        this.transitioning = false;
        document.body.classList.add("is-conclusion-story");

        const state = window.getStage6State?.() || {};
        const step = forceFirst ? 1 : Number(state.endingStoryStep) === 2 ? 2 : 1;

        if (step === 2) {
            if (
                window.SceneManager &&
                typeof window.SceneManager.showImmediately === "function"
            ) {
                window.SceneManager.showImmediately("ending-reflection");
            } else {
                this.showSceneDirectly("ending-reflection");
            }
            this.prepareReflectionStory();
        } else {
            const activeScene = document.querySelector(".scene.is-active:not([hidden])");
            if (!activeScene || activeScene.dataset.scene !== "ending-plane") {
                if (
                    window.SceneManager &&
                    typeof window.SceneManager.showImmediately === "function"
                ) {
                    window.SceneManager.showImmediately("ending-plane");
                } else {
                    this.showSceneDirectly("ending-plane");
                }
            }
            this.prepareFirstStory();
        }

        window.saveStage6State?.({ endingStoryStep: step });
    },

    async next(event) {
        event?.preventDefault?.();
        event?.stopPropagation?.();

        const button = event?.currentTarget;
        button?.blur?.();

        if (this.transitioning || this.step !== 1) return;
        this.transitioning = true;
        if (button) button.disabled = true;

        const { firstStory, secondStory } = this.elements();
        const reflectionScene = document.getElementById("scene-ending-reflection");

        firstStory?.classList.remove("is-visible");
        firstStory?.classList.add("is-leaving");

        this.step = 2;
        this.resetPlane({ temporarilyDisabled: true });

        if (secondStory) {
            secondStory.hidden = false;
            secondStory.classList.remove("is-leaving");
            secondStory.classList.add("is-visible");
        }

        if (reflectionScene) {
            reflectionScene.scrollTop = 0;
            reflectionScene.scrollLeft = 0;
        }

        window.saveStage6State?.({ endingStoryStep: 2 });

        try {
            await window.wait(260);

            if (
                window.SceneManager &&
                typeof window.SceneManager.changeScene === "function"
            ) {
                await window.SceneManager.changeScene("ending-reflection", {
                    fadeOutTime: 260,
                    blackTime: 120,
                    fadeInTime: 420
                });
            } else if (!this.showSceneDirectly("ending-reflection")) {
                throw new Error("ending-reflection scene was not found.");
            }

            this.prepareReflectionStory();

        } catch (error) {
            console.error("帰り道への遷移に失敗しました。", error);

            if (this.showSceneDirectly("ending-reflection")) {
                this.prepareReflectionStory();
            }
        } finally {
            this.transitioning = false;
        }
    },

    beginPlaneGesture(event) {
        if (this.step !== 2 || this.completed || this.pointerId !== null) return;
        const plane = document.getElementById("endingPlane");
        if (!plane || plane.disabled) return;

        event.preventDefault();
        this.pointerId = event.pointerId;
        this.startX = this.currentX = event.clientX;
        this.startY = this.currentY = event.clientY;

        try {
            plane.setPointerCapture(event.pointerId);
        } catch (_) {}

        plane.classList.add("is-dragging");
    },

    movePlaneGesture(event) {
        if (this.pointerId !== event.pointerId || this.completed) return;
        const plane = document.getElementById("endingPlane");
        if (!plane) return;

        event.preventDefault();
        this.currentX = event.clientX;
        this.currentY = event.clientY;

        const dx = this.currentX - this.startX;
        const dy = this.currentY - this.startY;
        plane.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(-24deg)`;
    },

    finishPlaneGesture(event) {
        if (event && this.pointerId !== event.pointerId) return;
        if (this.pointerId === null || this.completed) return;

        const plane = document.getElementById("endingPlane");
        const area = document.getElementById("endingPlaneArea");
        const message = document.getElementById("endingPlaneMessage");
        const dx = this.currentX - this.startX;
        const dy = this.currentY - this.startY;
        const rect = area?.getBoundingClientRect();
        const requiredX = Math.max(90, (rect?.width || 320) * 0.28);
        const requiredY = Math.max(72, (rect?.height || 240) * 0.25);

        this.pointerId = null;
        plane?.classList.remove("is-dragging");

        if (dx >= requiredX && dy <= -requiredY) {
            void this.completePlaneFlight();
            return;
        }

        if (plane) plane.style.transform = "rotate(-18deg)";
        if (message) {
            message.textContent = "もう少し大きく、左下から右上へ飛ばそう。";
            message.classList.remove("is-success");
            message.classList.add("is-error");
        }
    },

    async completePlaneFlight() {
        if (this.completed || this.transitioning) return;
        this.completed = true;
        this.transitioning = true;

        const plane = document.getElementById("endingPlane");
        const area = document.getElementById("endingPlaneArea");
        const trail = document.getElementById("endingPlaneTrail");
        const message = document.getElementById("endingPlaneMessage");

        if (!plane || !area) {
            this.completed = false;
            this.transitioning = false;
            return;
        }

        plane.disabled = true;
        plane.classList.remove("is-dragging");
        plane.classList.add("is-flying");
        trail?.classList.add("is-visible");

        const rect = area.getBoundingClientRect();
        plane.style.transform = `translate3d(${rect.width * 0.82}px, -${rect.height * 0.82}px, 0) rotate(-29deg)`;

        if (message) {
            message.textContent = "紙飛行機は、月へ向かって飛んでいった。";
            message.classList.remove("is-error");
            message.classList.add("is-success");
        }

        window.saveStage6State?.({ ended: true, endingStoryStep: 2 });
        document.body.classList.remove("is-conclusion-story");

        await window.wait(1050);

        if (window.SceneManager?.changeScene) {
            await window.SceneManager.changeScene("end", {
                fadeOutTime: 700,
                blackTime: 360,
                fadeInTime: 980
            });
        } else {
            window.SceneManager?.showImmediately?.("end");
        }

        updateEndSecretBadge();
        this.transitioning = false;
    },

    init() {
        if (this.initialized) return;

        document.getElementById("girlEndingNextButton")?.addEventListener(
            "click",
            event => this.next(event)
        );

        const plane = document.getElementById("endingPlane");
        plane?.addEventListener("pointerdown", event => this.beginPlaneGesture(event));
        plane?.addEventListener("pointermove", event => this.movePlaneGesture(event));
        plane?.addEventListener("pointerup", event => {
            event.preventDefault();
            this.finishPlaneGesture(event);
        });
        plane?.addEventListener("pointercancel", event => this.finishPlaneGesture(event));

        this.initialized = true;
    }
};

function updateEndSecretBadge(){const badge=document.getElementById("ibushiginEndBadge");if(badge)badge.hidden=!(typeof window.hasItem==="function"&&window.hasItem("いぶしぎん"))}

const initializeBeforeV010=window.initializePuzzles;
window.initializePuzzles=function initializePuzzlesV010(){initializeBeforeV010?.();Stage6Controller.init();FinalLetterController.init();EndingPlaneController.init()};
window.Stage6Controller=Stage6Controller;window.FinalLetterController=FinalLetterController;window.EndingPlaneController=EndingPlaneController;window.updateEndSecretBadge=updateEndSecretBadge;
