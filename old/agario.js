const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// キャンバスのサイズ設定
canvas.width = 800;
canvas.height = 600;

// プレイヤーの設定
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  color: 'blue'
};

// キーボード操作の状態
const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

// キーボードイベントの設定
document.addEventListener('keydown', function(event) {
  switch (event.key) {
    case 'ArrowUp': keys.up = true; break;
    case 'ArrowDown': keys.down = true; break;
    case 'ArrowLeft': keys.left = true; break;
    case 'ArrowRight': keys.right = true; break;
  }
});

document.addEventListener('keyup', function(event) {
  switch (event.key) {
    case 'ArrowUp': keys.up = false; break;
    case 'ArrowDown': keys.down = false; break;
    case 'ArrowLeft': keys.left = false; break;
    case 'ArrowRight': keys.right = false; break;
  }
});



// 食べ物のリスト
const foods = [];

// 食べ物を生成する関数
function createFood() {
  const food = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 5,
    color: 'red'
  };
  foods.push(food);
}

// 衝突を検出する関数
function detectCollision(player, food) {
  const dx = player.x - food.x;
  const dy = player.y - food.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < (player.radius + food.radius);
}




  
// ゲームの更新処理（変更箇所）
function update() {
    if (keys.up) player.y -= 5;
    if (keys.down) player.y += 5;
    if (keys.left) player.x -= 5;
    if (keys.right) player.x += 5;
  
    // 食べ物との衝突検出
    for (let i = foods.length - 1; i >= 0; i--) {
      if (detectCollision(player, foods[i])) {
        player.radius += 1; // プレイヤーのサイズを増やす
        foods.splice(i, 1); // 食べた食べ物をリストから削除
        createFood(); // 新しい食べ物を生成
      }
    }
  
    draw();
    requestAnimationFrame(update);
  }
  
  // 描画処理（変更箇所）
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
  
    // 食べ物を描画
    foods.forEach(function(food) {
      ctx.fillStyle = food.color;
      ctx.beginPath();
      ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  // 初期化処理
  for (let i = 0; i < 20; i++) {
    createFood();
  }
  
  // ゲームの開始
  update();
