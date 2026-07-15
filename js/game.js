/*
========================================

game.js

ゲーム全体制御

役割
・初期化
・画面演出
・BGM管理（今後）
・効果音管理（今後）
・ページ共通イベント

========================================
*/


// =====================================
// ページ読み込み
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    initializeGame();

});




// =====================================
// 初期化
// =====================================

function initializeGame(){

    console.log("ゲーム開始");

    fadeInScreen();

}




// =====================================
// フェードイン
// =====================================

function fadeInScreen(){

    document.body.classList.add("fade");

}




// =====================================
// フェードアウト
// =====================================

function fadeOutScreen(callback){

    document.body.style.opacity = "0";

    setTimeout(function(){

        if(callback){

            callback();

        }

    },500);

}




// =====================================
// BGM再生
// （後から実装）
// =====================================

function playBGM(){

    // audio/bgm.mp3

}




// =====================================
// 効果音
// （後から実装）
// =====================================

function playSE(name){

    console.log("SE：" + name);

}




// =====================================
// メッセージ表示
// =====================================

function showMessage(text){

    const area = document.getElementById("message");

    if(area){

        area.innerHTML = text;

    }

}




// =====================================
// タイトル変更
// =====================================

function changeTitle(text){

    const title = document.querySelector("h1");

    if(title){

        title.innerHTML = text;

    }

}
