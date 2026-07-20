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
            "他にも“同じソメイヨシノがあるようだ”",
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

    setChefSpeech("今売り切れが多くてね。<br>さんかくの間のものなら渡せるよ。");
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
    selectedItems:[],

    el(id){return document.getElementById(id)},

    normalize(value){
        return String(value||"")
            .trim()
            .replace(/\s+/g,"")
            .replace(/[!！?？。、,.・]+/g,"")
            .toLowerCase();
    },

    setMessage(id,text,type=""){
        const el=this.el(id);
        if(!el)return;
        el.textContent=text;
        el.classList.remove("is-error","is-success");
        if(type)el.classList.add("is-"+type);
    },

    save(partial){
        this.state=Object.assign({},this.state||window.getStage6State?.()||{},partial||{});
        window.saveStage6State?.(partial||{});
    },

    getInventoryItems(){
        if(typeof window.getUsableInventoryItems==="function"){
            return window.getUsableInventoryItems();
        }
        const saveData=typeof window.getSaveData==="function"?window.getSaveData():null;
        return Array.isArray(saveData?.items)?saveData.items:[];
    },

    flashPurple(){
        const flash=this.el("finalStatuePurpleFlash");
        const statue=this.el("finalStatue");
        if(flash){
            flash.classList.remove("is-active");
            void flash.offsetWidth;
            flash.classList.add("is-active");
        }
        if(statue){
            statue.classList.add("is-purple-flash");
            setTimeout(()=>statue.classList.remove("is-purple-flash"),900);
        }
    },

    async solvePatina(event){
        event?.preventDefault();
        const input=this.el("stage6PatinaAnswer");
        const button=this.el("stage6PatinaSubmit");
        if(!input||!button)return;

        const answer=this.normalize(input.value);
        if(!answer){
            this.setMessage("stage6PatinaMessage","色または素材を入力してください。","error");
            input.focus();
            return;
        }

        const currentColorAnswers=["緑","緑色","みどり","みどりいろ","青銅","せいどう","青緑","あおみどり"];
        if(currentColorAnswers.includes(answer)){
            this.setMessage("stage6PatinaMessage","今はね","error");
            input.select();
            return;
        }

        const correctAnswers=["銅","どう","銅色","どういろ","赤茶","赤茶色","あかちゃ","あかちゃいろ","赤褐色","せきかっしょく"];
        if(!correctAnswers.includes(answer)){
            this.setMessage("stage6PatinaMessage","作られた素材と、本来の色を調べてみよう。","error");
            input.select();
            return;
        }

        input.disabled=true;
        button.disabled=true;
        this.el("finalStatue")?.classList.add("is-copper");
        this.setMessage("stage6PatinaMessage","正解。自由の女神は、もともと銅の赤茶色だった。","success");
        this.save({patinaSolved:true});

        await window.wait(1000);
        const panel=this.el("stage6PurplePanel");
        if(panel)panel.hidden=false;
        this.selectedItems=[];
        this.renderInventoryChoices();
        panel?.scrollIntoView({behavior:"smooth",block:"center"});
    },

    renderInventoryChoices(){
        const container=this.el("stage6InventoryChoices");
        const count=this.el("stage6SelectionCount");
        const submit=this.el("stage6UseSelectedItems");
        if(!container)return;

        const items=this.getInventoryItems();
        container.replaceChildren();

        if(items.length===0){
            const empty=document.createElement("p");
            empty.className="final-inventory-choices__empty";
            empty.textContent="選べる持ち物がない。";
            container.appendChild(empty);
        }else{
            items.forEach(itemName=>{
                const button=document.createElement("button");
                button.type="button";
                button.className="final-inventory-choice";
                button.dataset.itemName=itemName;
                button.textContent=itemName;
                const selected=this.selectedItems.includes(itemName);
                button.classList.toggle("is-selected",selected);
                button.setAttribute("aria-pressed",selected?"true":"false");
                button.addEventListener("click",()=>this.toggleInventoryItem(itemName));
                container.appendChild(button);
            });
        }

        if(count)count.textContent=`${this.selectedItems.length} / 2`;
        if(submit)submit.disabled=this.selectedItems.length!==2||Boolean(this.state?.transformed);
    },

    toggleInventoryItem(itemName){
        if(this.state?.transformed)return;
        const index=this.selectedItems.indexOf(itemName);
        if(index>=0){
            this.selectedItems.splice(index,1);
        }else if(this.selectedItems.length<2){
            this.selectedItems.push(itemName);
        }else{
            this.setMessage("stage6PurpleMessage","選べるのは二つまでだ。","error");
            return;
        }
        this.setMessage("stage6PurpleMessage","");
        this.renderInventoryChoices();
    },

    async useSelectedItems(){
        if(this.state?.transformed||this.selectedItems.length!==2)return;
        const selected=this.selectedItems.slice().sort((a,b)=>a.localeCompare(b,"ja"));
        const correct=["紫のインク","醤油"].sort((a,b)=>a.localeCompare(b,"ja"));
        const isCorrect=selected[0]===correct[0]&&selected[1]===correct[1];

        if(!isCorrect){
            this.setMessage("stage6PurpleMessage","その二つでは、むらさきが二つにならない。","error");
            this.selectedItems=[];
            this.renderInventoryChoices();
            return;
        }

        this.state.transformed=true;
        this.save({transformed:true});
        const submit=this.el("stage6UseSelectedItems");
        if(submit)submit.disabled=true;
        document.querySelectorAll(".final-inventory-choice").forEach(button=>button.disabled=true);
        this.flashPurple();
        await window.wait(900);

        this.el("finalStatue")?.classList.add("is-gun");
        const kanji=this.el("stage6NameKanji");
        if(kanji){
            kanji.style.opacity="0";
            kanji.style.transform="scale(.75)";
            setTimeout(()=>{
                kanji.textContent="銃";
                kanji.style.opacity="1";
                kanji.style.transform="scale(1)";
            },360);
        }
        this.el("stage6NameReading")?.classList.add("is-gun");
        this.setMessage("stage6PurpleMessage","銃の女神へと成った","success");

        await window.wait(1150);
        const panel=this.el("stage6ShadowPanel");
        if(panel)panel.hidden=false;
        panel?.scrollIntoView({behavior:"smooth",block:"center"});
    },

    async shootShadow(){
        if(this.state?.shadowShot)return;
        this.state.shadowShot=true;
        this.save({shadowShot:true});
        const target=this.el("stage6ShadowTarget");
        target?.classList.add("is-shot");
        if(target)target.disabled=true;
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
        const state=this.state;

        if(state.patinaSolved){
            this.el("finalStatue")?.classList.add("is-copper");
            const input=this.el("stage6PatinaAnswer");
            const button=this.el("stage6PatinaSubmit");
            if(input)input.disabled=true;
            if(button)button.disabled=true;
            this.setMessage("stage6PatinaMessage","正解。自由の女神は、もともと銅の赤茶色だった。","success");
            const panel=this.el("stage6PurplePanel");
            if(panel)panel.hidden=false;
            this.renderInventoryChoices();
        }

        if(state.transformed){
            this.el("finalStatue")?.classList.add("is-gun");
            const kanji=this.el("stage6NameKanji");
            if(kanji)kanji.textContent="銃";
            this.el("stage6NameReading")?.classList.add("is-gun");
            this.setMessage("stage6PurpleMessage","銃の女神へと成った","success");
            const panel=this.el("stage6ShadowPanel");
            if(panel)panel.hidden=false;
            document.querySelectorAll(".final-inventory-choice").forEach(button=>button.disabled=true);
            const submit=this.el("stage6UseSelectedItems");
            if(submit)submit.disabled=true;
        }

        if(state.shadowShot){
            const target=this.el("stage6ShadowTarget");
            target?.classList.add("is-shot");
            if(target)target.disabled=true;
            this.setMessage("stage6ShadowMessage","光が、俯いていた影を貫いた。","success");
        }
    },

    reset({preserveSave=false}={}){
        this.state={patinaSolved:false,transformed:false,shadowShot:false,letterFolded:false,ended:false};
        this.selectedItems=[];
        this.el("finalStatue")?.classList.remove("is-copper","is-gun","is-purple-flash");
        const kanji=this.el("stage6NameKanji");
        if(kanji){
            kanji.textContent="自由";
            kanji.style.opacity="";
            kanji.style.transform="";
        }
        this.el("stage6NameReading")?.classList.remove("is-gun");

        const input=this.el("stage6PatinaAnswer");
        const submitAnswer=this.el("stage6PatinaSubmit");
        if(input){input.value="";input.disabled=false;}
        if(submitAnswer)submitAnswer.disabled=false;

        const purplePanel=this.el("stage6PurplePanel");
        const shadowPanel=this.el("stage6ShadowPanel");
        if(purplePanel)purplePanel.hidden=true;
        if(shadowPanel)shadowPanel.hidden=true;

        const target=this.el("stage6ShadowTarget");
        target?.classList.remove("is-shot");
        if(target)target.disabled=false;

        const choices=this.el("stage6InventoryChoices");
        if(choices)choices.replaceChildren();
        const count=this.el("stage6SelectionCount");
        if(count)count.textContent="0 / 2";
        const useButton=this.el("stage6UseSelectedItems");
        if(useButton)useButton.disabled=true;

        ["stage6PatinaMessage","stage6PurpleMessage"].forEach(id=>this.setMessage(id,""));
        this.setMessage("stage6ShadowMessage","影に狙いを定めよう。");
        if(!preserveSave)window.resetStage6State?.();
    },

    init(){
        if(this.initialized)return;
        this.el("stage6PatinaForm")?.addEventListener("submit",event=>this.solvePatina(event));
        this.el("stage6UseSelectedItems")?.addEventListener("click",()=>this.useSelectedItems());
        this.el("stage6ShadowTarget")?.addEventListener("click",()=>this.shootShadow());
        document.addEventListener("inventory:changed",()=>{
            if(this.state?.patinaSolved&&!this.state?.transformed)this.renderInventoryChoices();
        });
        this.initialized=true;
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
