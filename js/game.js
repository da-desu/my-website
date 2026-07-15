// ===============================
// BACKGROUND 共通スクリプト
// ===============================

// フェードイン
document.addEventListener("DOMContentLoaded", () => {

    document.body.classList.add("fade");

});

// Enterキーで回答
function submitByEnter(event, callback){

    if(event.key==="Enter"){

        callback();

    }

}

// 正解判定
function checkAnswer(correct,nextPage){

    const input=document.getElementById("answer");

    if(!input)return;

    const value=input.value.trim();

    if(value===correct){

        location.href=nextPage;

    }else{

        alert("違います。");

    }

}

// テキストを一文字ずつ表示
function typeWriter(id,text,speed=35){

    const target=document.getElementById(id);

    if(!target)return;

    target.innerHTML="";

    let i=0;

    const timer=setInterval(()=>{

        target.innerHTML+=text.charAt(i);

        i++;

        if(i>=text.length){

            clearInterval(timer);

        }

    },speed);

}

// ページ切り替え演出
function next(url){

    document.body.style.opacity=0;

    setTimeout(()=>{

        location.href=url;

    },600);

}

// ランダム演出
function randomFlash(){

    document.body.style.filter="brightness(1.5)";

    setTimeout(()=>{

        document.body.style.filter="brightness(1)";

    },120);

}
