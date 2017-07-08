/**
 * Created by davidslu on 04/07/2017.
 */

var player;
var obstacles = [];
var clock;
var gameInProgress = false;

var BASE_DIFFICULTY = 300,
    LEVEL_DURATION = 1500,
    LEVEL_DIFFICULTY_INCREASE = .666,
    OBSTACLE_WIDTH = 15,
    INITIAL_OBSTACLE_SPEED = 1,
    SPEED_INCREASE = .333;

function startGame() {
    if (gameInProgress) {
        return;
    }
    gameInProgress = true;
    player = new Character(20, "red", 200, 100);
    clock = new Clock(0, 0);
    gameBoard.start();
}

function resetGame() {
    gameInProgress = false;
    gameBoard.frameNo = 0;
    gameBoard.level = 0;
    obstacles = [];
    gameBoard.reset();
}

var gameBoard = {
    canvas : document.getElementById('gameBoard'),
    frameNo: 0,
    level: 0,
    start : function() {
        this.canvas.width = $('#gameBoard').width();
        this.canvas.height = $('#gameBoard').height();
        this.context = this.canvas.getContext('2d');
        this.interval = setInterval(updateGameBoard, 20);
    },
    restart : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    reset: function() {
        clearInterval(this.interval);
        //this.restart();
    }
};

function Character(height, color, x, y) {
    this.height = height;
    this.x = x;
    this.y = y;
    var ctx;
    this.update = function() {
        ctx = gameBoard.context;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.height, this.y - (this.height / 2));
        ctx.lineTo(this.x - this.height, this.y + (this.height / 2));
        ctx.fill();
    };
    this.newPos = function(x, y) {
        this.x = x;
        this.y = y;
        this.hitBorder();
    };
    this.hitBorder = function() {
        var hBorder = gameBoard.canvas.width;
        var vBorder = gameBoard.canvas.height;
        if (this.x > hBorder) {
            this.x = hBorder;
        } else if (this.x < this.height) {
            this.x = this.height;
        }
        if (this.y > vBorder - (this.height / 2)) {
            this.y = vBorder - (this.height / 2);
        } else if (this.y < this.height / 2) {
            this.y = this.height / 2;
        }
    };
    this.crashWith = function(otherObj) {

        var charTop = this.y - this.height / 2 + 2;
        var charBot = this.y + this.height / 2 - 2;

        var charLeft = this.x - this.height + 2;
        var charRight = this.x - 2;

        return (otherObj.top - (charLeft - otherObj.left) / 2 <= charBot &&
                otherObj.bot >= charTop - (charLeft - otherObj.left) / 2 &&
                otherObj.left <= charRight && otherObj.right >= charLeft);
    };
}

function Clock(minute, second) {
    this.minute = minute;
    this.second = second;
    this.clock = $('.clock');

    this.increaseTime = function() {
        this.second ++;
        if (this.second == 60) {
            this.minute ++;
            this.second = 0;
        }
    };

    this.update = function() {
        if (this.second < 10) {
            this.clock.text(this.minute + ':0' + this.second);
        } else {
            this.clock.text(this.minute + ':' + this.second);
        }
    };

    this.danger = function() {
        this.clock.css('color', 'red');
    };

    this.safe = function() {
        this.clock.css('color', '#333');
    };

    this.reset = function() {
        this.minute = 0;
        this.second = 0;
        this.clock.text('00:00');
    }
}

function Obstacle(x, y, width, up, down, color, boardHeight, boardWidth, gap, speed) {
    this.y = y;
    this.x = x;
    this.width = width;
    this.up = up;
    this.down = down;
    this.bHeight = boardHeight;
    this.bWidth = boardWidth;
    this.gap = gap / 2 - player.height;
    this.top = this.y;
    this.left = this.x;
    this.right = this.x + this.width;
    this.bot = this.y - this.gap;
    this.speed = speed;

    this.update = function() {
        var ctx = gameBoard.context,
            baseHeight = player.height * 2;

        var gapMove = this.gap * (1 - (this.x / this.bWidth));

        ctx.fillStyle = color;
        if (this.up) {
            this.left = this.x;
            this.right = this.x + this.width;
            this.bot = this.y + gapMove;
            this.top = this.y + (this.y - baseHeight) * (-1 + (this.x / this.bWidth)) - baseHeight;

            ctx.fillRect(this.x, this.y + gapMove, this.width,
                (this.y - baseHeight) * (-1 + (this.x / this.bWidth)) - baseHeight - gapMove);
            //this.width, -(this.y - baseHeight) + ((this.y - baseHeight) * (this.x / this.bWidth)) - baseHeight);
        } else {
            this.left = this.x;
            this.right = this.x + this.width;
            this.top = this.y - gapMove;
            this.bot = this.y + (this.bHeight - this.y - baseHeight) * (1 - (this.x / this.bWidth)) + baseHeight;

            ctx.fillRect(this.x, this.y - gapMove, this.width,
                (this.bHeight - this.y - baseHeight) * (1 - (this.x / this.bWidth)) + baseHeight + gapMove);
            //(this.bHeight - this.y - baseHeight) - ((this.bHeight - this.y - baseHeight) * (this.x / this.bWidth)) + baseHeight);
        }
    };
    this.newPos = function() {
        this.x -= this.speed;
    };
}

function updateGameBoard() {
    var w, h, height, minHeight, maxHeight, minGap, maxGap, gap, i, o;

    gameBoard.restart();
    gameBoard.frameNo ++;

    if (gameBoard.frameNo % 50 == 0) {
        clock.increaseTime();
        clock.update();
    }


    if (gameBoard.frameNo % LEVEL_DURATION == 0) {
        clock.danger();
        gameBoard.level ++;
        obstacles = [];
    }

    if (gameBoard.frameNo % (gameBoard.level * LEVEL_DURATION + 250) == 0) {
        clock.safe();
    }

    if (gameBoard.frameNo == 1 || gameBoard.frameNo %
        Math.floor(BASE_DIFFICULTY * (Math.pow(LEVEL_DIFFICULTY_INCREASE, gameBoard.level))) == 0) {

        w = gameBoard.canvas.width;
        h = gameBoard.canvas.height;
        minHeight = player.height * 2;
        maxHeight = h - minHeight;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        minGap = player.height * 2;
        maxGap = h - height + 1;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
        obstacles.push(new Obstacle(w, height, OBSTACLE_WIDTH, true, false, "green", h, w, gap, INITIAL_OBSTACLE_SPEED + SPEED_INCREASE * gameBoard.level));
        obstacles.push(new Obstacle(w, height + gap, OBSTACLE_WIDTH, false, true, "green", h, w, gap, INITIAL_OBSTACLE_SPEED + SPEED_INCREASE * gameBoard.level));
    }

    var offset = $("#gameBoard").offset();
    $(document).mousemove(function(e){
        player.newPos(e.pageX - offset.left, e.pageY - offset.top);
    });

    player.update();

    for (i = 0; i < obstacles.length; i += 1) {
        obstacles[i].newPos();
        obstacles[i].update();
        if (obstacles[i].x + obstacles[i].width <= 0) {
             obstacles.shift();
        }
    }

    for (i = 0; i < obstacles.length; i += 1) {
        if (player.crashWith(obstacles[i])) {
            resetGame();
        }
    }
}