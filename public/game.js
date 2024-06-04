// WebSocketの接続を確立
const socket = io();
// キャンバス要素を取得
const canvas = document.getElementById('gameCanvas');
// 2Dコンテキストを取得
const ctx = canvas.getContext('2d');

// プレイヤーの初期設定
let currentPlayer = {
    x: 40, // 初期位置X
    y: 30, // 初期位置Y
    size: 10, // プレイヤーのサイズ
    speed: 2, // プレイヤーの移動速度
    color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})` // ランダムな色
};

let foods = []; // 食べ物の配列

// サーバーから初期状態を受け取る
socket.on('init', data => {
    foods = data.foods; // 初期食べ物を設定
    const players = { ...data.players }; // 他のプレイヤーの初期状態をコピー
    delete players[socket.id]; // 自分自身を除外
    render(players, foods); // 初期状態を描画
});

// サーバーからゲーム状態の更新を受け取る
socket.on('update', data => {
    foods = data.foods; // 更新された食べ物を設定
    const players = { ...data.players }; // 他のプレイヤーの状態をコピー
    delete players[socket.id]; // 自分自身を除外
    render(players, foods); // 更新された状態を描画
});

// 新しい餌の追加が通知されたとき
socket.on('newFood', food => {
    foods.push(food); // 新しい食べ物を追加
    render({ 'You': currentPlayer }, foods); // 描画を更新
    render();
});

// リスポーン処理
socket.on('respawn', () => {
    alert('あんた、食べられたよ'); // アラートを表示
    currentPlayer.size = 10; // サイズを初期化
    currentPlayer.x = Math.floor(Math.random() * 1600); // ランダムな位置に設定
    currentPlayer.y = Math.floor(Math.random() * 1200); // ランダムな位置に設定
});

// プレイヤーと食べ物を描画する関数
function render(players, foods) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア

    // キャンバスの中心を基準にオフセットを計算
    const offsetX = canvas.width / 2 - currentPlayer.x;
    const offsetY = canvas.height / 2 - currentPlayer.y;

    // 食べ物を描画
    foods.forEach(food => {
        renderFood(food, offsetX, offsetY);
    });
   

    // 他のプレイヤーを描画
    Object.keys(players).forEach(id => {
        if (id !== 'You') {
            const player = players[id];
            renderPlayer(player, offsetX, offsetY, id);
        }
    });

    // 自分のプレイヤーを描画
    renderPlayer(currentPlayer, canvas.width / 2, canvas.height / 2, 'You');
}

// プレイヤーを描画する関数
function renderPlayer(player, offsetX, offsetY, id) {
    ctx.beginPath(); // 新しいパスを開始
    ctx.arc(player.x + offsetX, player.y + offsetY, player.size, 0, 2 * Math.PI); // 円を描画
    ctx.fillStyle = player.color; // 塗りつぶし色を設定
    ctx.fill(); // 塗りつぶし

    // プレイヤーのIDを表示
    ctx.fillStyle = hColor(player.color); // 反転色を設定
    ctx.fillText(`${id.substring(0, 5)}`, player.x + offsetX - 20, player.y + offsetY + 3); // IDを描画
}

// 食べ物を描画する関数
function renderFood(food, offsetX = 0, offsetY = 0) {
    ctx.beginPath(); // 新しいパスを開始
    ctx.arc(food.x + offsetX, food.y + offsetY, 3, 0, 2 * Math.PI); // 小さい円を描画
    ctx.fillStyle = food.color; // 塗りつぶし色を設定
    ctx.fill(); // 塗りつぶし
}

// キーの状態を管理するオブジェクト
const keyState = {
    'ArrowUp': false,
    'ArrowDown': false,
    'ArrowLeft': false,
    'ArrowRight': false
};

// キーが押されたときの処理
document.addEventListener('keydown', (event) => {
    if (keyState.hasOwnProperty(event.key)) {
        keyState[event.key] = true; // 対応するキーの状態を更新
    }
});

// キーが離されたときの処理
document.addEventListener('keyup', (event) => {
    if (keyState.hasOwnProperty(event.key)) {
        keyState[event.key] = false; // 対応するキーの状態を更新
    }
});

// ゲームループ関数
function gameLoop() {
    let moved = false; // プレイヤーが動いたかどうかのフラグ

    // キーの状態に応じてプレイヤーを移動
    if (keyState['ArrowUp']) {
        currentPlayer.y -= currentPlayer.speed;
        moved = true;
    }

    if (keyState['ArrowDown']) {
        currentPlayer.y += currentPlayer.speed;
        moved = true;
    }

    if (keyState['ArrowLeft']) {
        currentPlayer.x -= currentPlayer.speed;
        moved = true;
    }

    if (keyState['ArrowRight']) {
        currentPlayer.x += currentPlayer.speed;
        moved = true;
    }

    if (moved) {
        socket.emit('move', { x: currentPlayer.x, y: currentPlayer.y }); // サーバーに移動を通知
    }

    render({ 'You': currentPlayer }, foods); // 現在の状態を描画

    requestAnimationFrame(gameLoop); // 次のフレームをリクエスト
}

// ゲームループを開始
gameLoop();

// 色を反転させる関数
function hColor(color) {
    var rgbVal = color.slice(4, -1); // 'rgb'の文字を除去して数値部分を取り出す
    var [R, G, B] = rgbVal.split(',').map(Number); // 数値に変換

    if (!isNaN(R + G + B) && 0 <= R && R <= 255 && 0 <= G && G <= 255 && 0 <= B && B <= 255) {
        var max = Math.max(R, Math.max(G, B)); // 最大値を取得
        var min = Math.min(R, Math.min(G, B)); // 最小値を取得

        var sum = max + min; // 最大値と最小値の合計

        var newR = sum - R; // 反転色の計算
        var newG = sum - G; // 反転色の計算
        var newB = sum - B; // 反転色の計算

        var hColor = `rgb(${newR}, ${newG}, ${newB})`; // 反転色を生成

        return hColor; // 反転色を返す
    } else {
        return `rgb(0,0,0)`; // 無効な色の場合は黒を返す
    }
}
