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
