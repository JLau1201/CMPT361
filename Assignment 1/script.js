function initializeGame(){
    let gameBoard = [
        ['WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL',],
        ['WALL', 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'dot' , 'dot' , 'WALL', 'dot' , 'dot' , 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'dot' , 'dot' , 'WALL', 'dot' , 'dot' , 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'dot' , 'dot' , 'dot' , 'player', 'dot', 'dot', 'dot' , 'dot' , 'WALL',],
        ['WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL',],
    ];

    let gameState = {
        time: 60, 
        score: 0,
        dots: 59,
        state: ''};

    let player = {
        pos: [10, 5],
        move: '',
        canMove: true,
        state: 0,
    };

    let enemy1 = {
        initPos: [5, 5],
        pos: [5, 5],
        tag: 1,
    };

    let enemy2 = {
        initPos: [6, 5],
        pos: [6, 5],
        tag: 2,
    };

    stateEventListener(gameState, gameBoard, player, enemy1, enemy2);
}

function gameOver(gameState){
    console.log("Game Over");
    if(gameState.state === 'win'){
        console.log("Your Score:");
        console.log(gameState.time);
        let finalScore = gameState.score + gameState.time*100;
        console.log(finalScore)
    }
}

function game(gameState, player, enemy1, enemy2, gameBoard){

    if(gameState.state === 'play'){
        random(enemy1, player, gameBoard, gameState);
        random(enemy2, player, gameBoard, gameState);
        gameState.time--;
        let timer = document.getElementById("time");
        timer.innerHTML = gameState.time;
    }

    if(gameState.time === 0){
        gameState.state = 'win';
        gameOver(gameState);
    }
}

function checkCaught(gameState, gameBoard, enemy, player){
    let score = document.getElementById('score');

    if(player.state === 0 && enemy.pos[0] === player.pos[0] && enemy.pos[1] === player.pos[1]){
        gameState.score -= 500;
        score.innerHTML = gameState.score;
        if(gameState.score <= 0){
            gameState.state = 'lose';
            gameOver(gameState);
        }
        enemy.pos = enemy.initPos;
        drawScene('none', 'reset', enemy.tag, gameBoard);
    }
    
    player.state = 0;
}

function checkDot(gameState, gameBoard, player){
    let score = document.getElementById('score');

    if(gameBoard[player.pos[0]][player.pos[1]] === 'dot'){
        gameState.score += 100;
        gameState.dots --;
        score.innerHTML = gameState.score;
        if(gameState.dots === 0){
            gameState.state = 'win';
            gameOver(gameState);
        }
    }

    console.log(gameState.score)
}

function keyEventListener(gameState, gameBoard, player, enemy1, enemy2) {
	document.addEventListener('keydown', move = (e) => {
		const keyName = e.key;
        if(!player.canMove) return;
        setTimeout(function() { player.canMove = true; }, 250);
		if (keyName === 'ArrowLeft' && gameBoard[player.pos[0]][player.pos[1] - 1] !== 'WALL') {
            player.move = 'left';
            playerMove(gameState, gameBoard, player, enemy1, enemy2);
		} else if (keyName === 'ArrowRight'  && gameBoard[player.pos[0]][player.pos[1] + 1] !== 'WALL') {
            player.move = 'right';
            playerMove(gameState, gameBoard, player, enemy1, enemy2);
		} else if (keyName === 'ArrowUp'  && gameBoard[player.pos[0] - 1][player.pos[1]] !== 'WALL') {
            player.move = 'up';
            playerMove(gameState, gameBoard, player, enemy1, enemy2);
		} else if (keyName === 'ArrowDown'  && gameBoard[player.pos[0] + 1][player.pos[1]] !== 'WALL') {
            player.move = 'down';
            playerMove(gameState, gameBoard, player, enemy1, enemy2);
		}
        //printBoard(gameBoard);
	});
}

let gamePlay;
function stateEventListener(gameState, gameBoard, player, enemy1, enemy2){
    document.addEventListener('keydown', (event) => {
        const keyName = event.key;
        if(keyName === 's' && gameState.state === ''){
            keyEventListener(gameState, gameBoard, player, enemy1, enemy2);
            gamePlay = setInterval(game, 1000, gameState, player, enemy1, enemy2, gameBoard);
            gameState.state = 'play';
            
        }else if(keyName === 'p' && gameState.state === 'play'){
            player.canMove = false;
            gameState.state = 'pause';
            
        }else if(keyName === 'r' && gameState.state === 'pause'){
            player.canMove = true;
            gameState.state = 'play';
            
        }else if(keyName === 'R'){
            document.removeEventListener('keydown', move);
            clearInterval(gamePlay);
            console.log('restart');
            initializeGame();
        }
    });
}

function random(enemy, player, gameBoard, gameState){
    let posMoves = [];
    if(gameBoard[enemy.pos[0]][enemy.pos[1] - 1] !== 'WALL') posMoves.push('left');
    if(gameBoard[enemy.pos[0]][enemy.pos[1] + 1] !== 'WALL') posMoves.push('right');
    if(gameBoard[enemy.pos[0] - 1][enemy.pos[1]] !== 'WALL') posMoves.push('up');
    if(gameBoard[enemy.pos[0] + 1][enemy.pos[1]] !== 'WALL') posMoves.push('down');

    let move = Math.floor(Math.random() * posMoves.length);
    //gameBoard[enemy.pos[0]][enemy.pos[1]] = enemy.prevTile;
    if(posMoves[move] === 'left'){
        enemy.pos = [enemy.pos[0], enemy.pos[1] - 1];
    }else if(posMoves[move] === 'right'){
        enemy.pos = [enemy.pos[0], enemy.pos[1] + 1];
    }else if(posMoves[move] === 'up'){
        enemy.pos = [enemy.pos[0] - 1, enemy.pos[1]];
    }else if(posMoves[move] === 'down'){
        enemy.pos = [enemy.pos[0] + 1, enemy.pos[1]];
    }
    
    drawScene('none', posMoves[move], enemy.tag, gameBoard);

    // if(gameBoard[enemy.pos[0]][enemy.pos[1]] === 'enemy'){
    //     enemy.prevTile = otherEnemyPrev;
    // }else{
    //     enemy.prevTile = gameBoard[enemy.pos[0]][enemy.pos[1]];
    // }
    
    // gameBoard[enemy.pos[0]][enemy.pos[1]] = 'enemy';
    checkCaught(gameState, gameBoard, enemy, player);
    //printBoard(gameBoard);
}

function playerMove(gameState, gameBoard, player, enemy1, enemy2){

    gameBoard[player.pos[0]][player.pos[1]] = '___';
    if(player.move === 'left'){
        player.pos = [player.pos[0], player.pos[1] - 1];
    }else if(player.move === 'right'){
        player.pos = [player.pos[0], player.pos[1] + 1];
    }else if(player.move === 'up'){
        player.pos = [player.pos[0] - 1, player.pos[1]];
    }else if(player.move === 'down'){
        player.pos = [player.pos[0] + 1, player.pos[1]];
    }

    
    checkCaught(gameState, gameBoard, enemy1, player);
    checkCaught(gameState, gameBoard, enemy2, player);
    checkDot(gameState, gameBoard, player);

    drawScene(player.move, 'none', 0, gameBoard);


    gameBoard[player.pos[0]][player.pos[1]] = 'player';
    player.canMove = false;
    player.move = '';
}

function printBoard(gameBoard){
    let div = document.getElementById('content');

    let buffer = '';
    for(let i = 0; i < gameBoard.length; i++){
        for(let j = 0; j < gameBoard[i].length; j++){
            buffer += `<span class='tile'>${gameBoard[i][j]}</span>` + ' ';
        }

        buffer += '<br>';
    }

    div.innerHTML = buffer
}

initializeGame();