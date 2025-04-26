// Конфигурация игры
const config = {
    type: Phaser.AUTO, // Автоматический выбор WebGL или Canvas
    width: 800, // Ширина игрового поля
    height: 600, // Высота игрового поля
    scene: {
        preload: preload, // Функция загрузки ресурсов
        create: create, // Функция инициализации
        update: update // Функция обновления (60 раз в секунду)
    },
    physics: {
        default: 'arcade', // Используем физику Arcade
        arcade: {
            gravity: { y: 0 }, // Гравитация отсутствует
            debug: false // Отключение отладочных рамок
        }
    },
    scale: {
        mode: Phaser.Scale.FIT, // Адаптация под размер экрана
        autoCenter: Phaser.Scale.CENTER_BOTH // Центрирование
    }
};

// Инициализация игры
const game = new Phaser.Game(config);

// Глобальные переменные
let player, bullets, enemies, cursors, fireButton, score, scoreText, lastFired = 0;

// Загрузка ресурсов
function preload() {
    this.load.image('player', 'assets/player.png'); // Спрайт игрока
    this.load.image('bullet', 'assets/bullet.png'); // Спрайт пули
    this.load.image('enemy', 'assets/enemy.png'); // Спрайт врага
}

// Инициализация объектов
function create() {
    // Создаём игрока
    player = this.physics.add.sprite(400, 500, 'player');
    player.setCollideWorldBounds(true); // Ограничение движения краями экрана

    // Создаём группу пуль
    bullets = this.physics.add.group();

    // Создаём группу врагов
    enemies = this.physics.add.group();
    this.time.addEvent({
        delay: 2000, // Спавн врага каждые 2 секунды
        loop: true,
        callback: () => {
            const enemy = enemies.create(Phaser.Math.Between(0, 800), 0, 'enemy');
            enemy.setVelocity(0, 100); // Движение вниз
        }
    });

    // Настройка управления
    cursors = this.input.keyboard.createCursorKeys();
    fireButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Настройка коллизий
    this.physics.add.collider(bullets, enemies, hitEnemy, null, this);
    this.physics.add.collider(player, enemies, gameOver, null, this);

    // Инициализация счёта
    score = 0;
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
}

// Обновление игры
function update() {
    // Движение игрока
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
    } else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-200);
    } else if (cursors.down.isDown) {
        player.setVelocityY(200);
    } else {
        player.setVelocityY(0);
    }

    // Стрельба
    if (fireButton.isDown && this.time.now > lastFired) {
        const bullet = bullets.create(player.x, player.y - 20, 'bullet');
        bullet.setVelocity(0, -300); // Движение пули вверх
        lastFired = this.time.now + 500; // Задержка 0.5 секунды
    }

    // Удаление пуль за пределами экрана
    bullets.getChildren().forEach(bullet => {
        if (bullet.y < 0) bullet.destroy();
    });
}

// Обработка попадания пули во врага
function hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
}

// Обработка столкновения игрока с врагом
function gameOver() {
    this.scene.pause();
    this.add.text(400, 300, 'Game Over!', { fontSize: '64px', fill: '#fff' })
        .setOrigin(0.5);
    this.time.delayedCall(2000, () => {
        this.scene.restart();
    });
}