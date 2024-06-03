const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let currentPlayer = {
    x: 40,
    y: 30,
    size: 10,
    speed: 2,
    color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
};

let foods = [];

// サーバーから初期状態を受け取る
socket.on('init', data => {
    foods = data.foods;
    const players = { ...data.players };
    delete players[socket.id];
    render(players, foods);
});

// サーバーからゲーム状態の更新を受け取る
socket.on('update', data => {
    foods = data.foods;
    const players = { ...data.players };
    delete players[socket.id];
    render(players, foods);
});

// 新しい餌が追加されたとき
socket.on('newFood', food => {
    foods.push(food);
    render({ 'You': currentPlayer }, foods);
});

// リスポーン処理
socket.on('respawn', () => {
    alert('あんた、食べられたよ');
    currentPlayer.size = 10; // リスポーン時にサイズを初期化
    currentPlayer.x = Math.floor(Math.random() * 1600);
    currentPlayer.y = Math.floor(Math.random() * 1200);
});

function render(players, foods) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = canvas.width / 2 - currentPlayer.x;
    const offsetY = canvas.height / 2 - currentPlayer.y;

    foods.forEach(food => {
        renderFood(food, offsetX, offsetY);
    });

    Object.keys(players).forEach(id => {
        if (id !== 'You') {
            const player = players[id];
            renderPlayer(player, offsetX, offsetY, id);
        }
    });

    renderPlayer(currentPlayer, canvas.width / 2, canvas.height / 2, 'You');
}

function renderPlayer(player, offsetX, offsetY, id) {
    ctx.beginPath();
    ctx.arc(player.x + offsetX, player.y + offsetY, player.size, 0, 2 * Math.PI);
    ctx.fillStyle = player.color;
    ctx.fill();

    ctx.fillStyle = hColor(player.color);
    ctx.fillText(`${id.substring(0, 5)}`, player.x + offsetX - 20, player.y + offsetY + 3);
}

function renderFood(food, offsetX = 0, offsetY = 0) {
    ctx.beginPath();
    ctx.arc(food.x + offsetX, food.y + offsetY, 3, 0, 2 * Math.PI);
    ctx.fillStyle = food.color;
    ctx.fill();
}

const keyState = {
    'ArrowUp': false,
    'ArrowDown': false,
    'ArrowLeft': false,
    'ArrowRight': false
};

document.addEventListener('keydown', (event) => {
    if (keyState.hasOwnProperty(event.key)) {
        keyState[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (keyState.hasOwnProperty(event.key)) {
        keyState[event.key] = false;
    }
});

function gameLoop() {
    let moved = false;

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
        socket.emit('move', { x: currentPlayer.x, y: currentPlayer.y });
    }

    render({ 'You': currentPlayer }, foods);

    requestAnimationFrame(gameLoop);
}

gameLoop();

function hColor(color) {
    var rgbVal = color.slice(4, -1);
    var [R, G, B] = rgbVal.split(',').map(Number);

    if (!isNaN(R + G + B) && 0 <= R && R <= 255 && 0 <= G && G <= 255 && 0 <= B && B <= 255) {
        var max = Math.max(R, Math.max(G, B));
        var min = Math.min(R, Math.min(G, B));

        var sum = max + min;

        var newR = sum - R;
        var newG = sum - G;
        var newB = sum - B;

        var hColor = `rgb(${newR}, ${newG}, ${newB})`;

        return hColor;
    } else {
        return `rgb(0,0,0)`;
    }
}
