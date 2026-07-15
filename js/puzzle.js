/*
========================================

puzzle.js

共通謎システム

役割
・回答判定
・正解処理
・不正解処理
・ヒント表示
・クリア演出

========================================
*/


// =====================================
// 回答取得
// =====================================

function getAnswer(){

    const input = document.getElementById("answer");

    if(!input){

        return "";

    }

    return input.value.trim();

}



// =====================================
// 回答判定
// =====================================

function checkAnswer(correctAnswers, stageNumber, nextPage){

    const answer = getAnswer();

    if(correctAnswers.includes(answer)){

        onCorrect(stageNumber, nextPage);

    }else{

        onWrong();

    }

}



// =====================================
// 正解
// =====================================

function onCorrect(stageNumber, nextPage){

    clearStage(stageNumber);

    const clearArea = document.getElementById("message");

    if(clearArea){

        clearArea.innerHTML = "正解！";

        clearArea.classList.add("clear-effect");

    }

    setTimeout(function(){

        location.href = nextPage;

    },1500);

}



// =====================================
// 不正解
// =====================================

function onWrong(){

    const area = document.getElementById("message");

    if(area){

        area.innerHTML =
        "違うようだ。もう一度考えてみよう。";

    }

}



// =====================================
// ヒント表示
// =====================================

function showHint(text){

    const area = document.getElementById("hint");

    if(area){

        area.innerHTML = text;

    }

}
