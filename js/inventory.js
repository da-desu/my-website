/*
========================================

inventory.js

アイテム管理システム

役割
・アイテム取得
・アイテム削除
・所持確認
・一覧取得

========================================
*/


// ======================================
// アイテム取得
// ======================================

function obtainItem(itemName){

    addItem(itemName);

    console.log("取得アイテム：" + itemName);

}



// ======================================
// アイテム削除
// ======================================

function removeItem(itemName){

    const data = getSaveData();

    data.items = data.items.filter(
        item => item !== itemName
    );

    saveData(data);

}



// ======================================
// アイテム所持確認
// ======================================

function checkItem(itemName){

    return hasItem(itemName);

}



// ======================================
// 全アイテム取得
// ======================================

function getItemList(){

    return getSaveData().items;

}



// ======================================
// アイテム一覧表示（デバッグ用）
// ======================================

function showInventory(){

    console.log("===== 所持アイテム =====");

    const items = getItemList();

    if(items.length === 0){

        console.log("アイテムなし");

        return;

    }

    items.forEach(item=>{

        console.log("・" + item);

    });

}
