/*
========================================

謎解きサイト
セーブ管理システム

save.js

役割：
・ステージ進行保存
・クリア情報管理
・アイテム管理との連携

========================================
*/


// ================================
// セーブデータ初期状態
// ================================


const defaultSaveData = {


    // 現在ステージ

    currentStage:1,


    // クリア済みステージ

    clearedStages:[],


    // 入手アイテム

    items:[]


};





// ================================
// セーブデータ取得
// ================================


function getSaveData(){


    const data = localStorage.getItem(
        "nazotoki_save"
    );


    if(data){


        return JSON.parse(data);


    }


    return defaultSaveData;


}






// ================================
// セーブ実行
// ================================


function saveData(data){


    localStorage.setItem(

        "nazotoki_save",

        JSON.stringify(data)

    );


}







// ================================
// ステージクリア保存
// ================================


function clearStage(stageNumber){



    const data = getSaveData();



    if(
        !data.clearedStages.includes(stageNumber)
    ){


        data.clearedStages.push(stageNumber);


    }



    data.currentStage =
    stageNumber + 1;



    saveData(data);



}







// ================================
// ステージクリア確認
// ================================


function isStageCleared(stageNumber){


    const data = getSaveData();



    return data.clearedStages.includes(
        stageNumber
    );



}






// ================================
// アイテム追加
// ================================


function addItem(itemName){


    const data = getSaveData();



    if(
        !data.items.includes(itemName)
    ){


        data.items.push(itemName);


    }



    saveData(data);



}






// ================================
// アイテム所持確認
// ================================


function hasItem(itemName){


    const data = getSaveData();



    return data.items.includes(
        itemName
    );


}







// ================================
// セーブ削除
// テスト用
// ================================


function resetSave(){


    localStorage.removeItem(
        "nazotoki_save"
    );


}
