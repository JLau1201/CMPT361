// Initialize all game features
function initializeGame(){
    let gameBoard = [
        ['WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL',],
        ['WALL', 'dot', 'dot', 'dot', 'dot' , 'pellet' , 'dot' , 'dot' , 'dot' , 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'dot' , 'dot' , 'WALL', 'dot' , 'dot' , 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'dot' , 'dot' , 'WALL', 'dot' , 'dot' , 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot', 'dot' , 'dot' , 'WALL',],
        ['WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL',],
    ];

    let gameState = {
        time: 60, 
        score: 0,
        dots: 58,
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

    // Start webgl drawing
    setup('none', 'none', 0, gameBoard);
    
    // Enable the game state listener to Start game
    stateEventListener(gameState, gameBoard, player, enemy1, enemy2);
}
// Define what to do when the game is over
function gameOver(gameState){
    document.removeEventListener('keydown', move);
    let overlay = document.getElementById('overlay');
    if(gameState.state === 'win'){
        // On player win
        // Define the players final score by their score + remaining time * 100
        let finalScore = gameState.score + Math.floor(gameState.time)*100;
        overlay.innerHTML = 'You Win!<br>Your Score: ' + finalScore + '<br>Press Shift + R to Restart';
        overlay.style.display = 'flex';
    }else if(gameState.state === 'lose'){
        overlay.innerHTML = 'You Lose!<br>Press Shift + R to Restart';
        overlay.style.display = 'flex';
    }
}
// Define Game loop
// Loops every .33s
function game(gameState, player, enemy1, enemy2, gameBoard){
    // When the game is in play, tell enemies how to move
    if(gameState.state === 'play'){
        random(enemy1, player, gameBoard, gameState);
        shortestPath(enemy2, player, gameBoard, gameState);
        gameState.time-=.333;
        let timer = document.getElementById("time");
        timer.innerHTML = Math.floor(gameState.time);
    }
    // Declare the Player win when time runs out
    if(gameState.time === 0){
        gameState.state = 'win';
        gameOver(gameState);
    }
}
// Check if the player is on the same tile as an enemy
function checkCaught(gameState, gameBoard, enemy, player){
    let score = document.getElementById('score');
    
    if(enemy.pos[0] === player.pos[0] && enemy.pos[1] === player.pos[1]){
        // If the player is not powered up, lose points
        if(player.state === 0){
            if(player.score >= 5000){
                // Lose 1000 when the player has more than 5000 points for game balance
                gameState.score -= 1000;
            }else{
                gameState.score -= 500;
            }
        }
        // Remove power up
        player.state = 0;

        score.innerHTML = gameState.score;
        // Check if the player has less than 0 points
        if(gameState.score <= 0){
            gameState.state = 'lose';
            gameOver(gameState);
        }

        // Reset enemy position to middle
        enemy.pos = enemy.initPos;
        drawScene('none', 'reset', enemy.tag, gameBoard);
    }
}
//Check if the player is on a dot or power pellet
function checkDot(gameState, gameBoard, player){
    let score = document.getElementById('score');
    // Check if the player is on a dot gain points
    if(gameBoard[player.pos[0]][player.pos[1]] === 'dot'){
        gameState.score += 100;
        gameState.dots --;
        score.innerHTML = gameState.score;
        // Check if the player caught all dots to end game
        if(gameState.dots === 0){
            gameState.state = 'win';
            gameOver(gameState);
        }
    // Check if player recieves power pellet to not lose points on next death
    }else if(gameBoard[player.pos[0]][player.pos[1]] === 'pellet'){
        player.state = 1;
        console.log(player.state);
    }
}
// Event Listener to check for player input to move Pacman
function keyEventListener(gameState, gameBoard, player, enemy1, enemy2) {
	document.addEventListener('keydown', move = (e) => {
		const keyName = e.key;
        if(!player.canMove) return;
        // Set player movement delay
        setTimeout(function() { player.canMove = true; }, 250);
        // Left movement
		if (keyName === 'ArrowLeft' && gameBoard[player.pos[0]][player.pos[1] - 1] !== 'WALL') {
            player.move = 'left';
            playerMove(gameState, gameBoard, player, enemy1, enemy2);
        // Right movement
		} else if (keyName === 'ArrowRight'  && gameBoard[player.pos[0]][player.pos[1] + 1] !== 'WALL') {
            player.move = 'right';
            playerMove(gameState, gameBoard, player, enemy1, enemy2);
        // Up movement
		} else if (keyName === 'ArrowUp'  && gameBoard[player.pos[0] - 1][player.pos[1]] !== 'WALL') {
            player.move = 'up';
            playerMove(gameState, gameBoard, player, enemy1, enemy2);
        // Down movement
		} else if (keyName === 'ArrowDown'  && gameBoard[player.pos[0] + 1][player.pos[1]] !== 'WALL') {
            player.move = 'down';
            playerMove(gameState, gameBoard, player, enemy1, enemy2);
		}
        //printBoard(gameBoard);
	});
}
// State Listener to check when player inputs a state key (start, pause, resume, restart)
let gamePlay;
function stateEventListener(gameState, gameBoard, player, enemy1, enemy2){
    let overlay = document.getElementById('overlay');

    document.addEventListener('keydown', (event) => {
        const keyName = event.key;
        // Start game
        if(keyName === 's' && gameState.state === ''){
            overlay.style.display = 'none';
            keyEventListener(gameState, gameBoard, player, enemy1, enemy2);
            gamePlay = setInterval(game, 333, gameState, player, enemy1, enemy2, gameBoard);
            gameState.state = 'play';
        // Pause game
        }else if(keyName === 'p' && gameState.state === 'play'){
            overlay.innerHTML = 'Press R to Resume<br>Press Shift + R to Restart';
            overlay.style.display = 'flex';
            player.canMove = false;
            gameState.state = 'pause';
        // Resume Game
        }else if(keyName === 'r' && gameState.state === 'pause'){
            overlay.style.display = 'none';

            player.canMove = true;
            gameState.state = 'play';
        // Restart Game
        }else if(keyName === 'R'){
            document.removeEventListener('keydown', move);
            clearInterval(gamePlay);
            // Reinitialize all game features
            gameBoard = [
                ['WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL',],
                ['WALL', 'dot', 'dot', 'dot', 'dot' , 'pellet' , 'dot' , 'dot' , 'dot' , 'dot' , 'WALL',],
                ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
                ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
                ['WALL', 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'WALL',],
                ['WALL', 'dot' , 'WALL', 'dot' , 'dot' , 'WALL', 'dot' , 'dot' , 'WALL', 'dot' , 'WALL',],
                ['WALL', 'dot' , 'WALL', 'dot' , 'dot' , 'WALL', 'dot' , 'dot' , 'WALL', 'dot' , 'WALL',],
                ['WALL', 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'WALL',],
                ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
                ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
                ['WALL', 'dot' , 'dot' , 'dot' , 'dot' , '___' , 'dot' , 'dot' , 'dot' , 'dot' , 'WALL',],
                ['WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL',],
            ];
        
            gameState = {
                time: 60, 
                score: 0,
                dots: 59,
                state: ''};
        
            player = {
                pos: [10, 5],
                move: '',
                canMove: true,
                state: 0,
            };
        
            enemy1 = {
                initPos: [5, 5],
                pos: [5, 5],
                tag: 1,
            };
        
            enemy2 = {
                initPos: [6, 5],
                pos: [6, 5],
                tag: 2,
            };
            let time = document.getElementById('time');
            let score = document.getElementById('score');
            time.innerHTML = gameState.time;
            score.innerHTML = gameState.score;
            drawScene('reset', 'reset', 3, gameBoard);
            overlay.innerHTML = 'Press S to Start';
            overlay.style.display = 'flex';
        }
    });
}

// Enemy movement randomized
function random(enemy, player, gameBoard, gameState){
    let posMoves = [];
    // Find all possible directions the enemy can move
    if(gameBoard[enemy.pos[0]][enemy.pos[1] - 1] !== 'WALL') posMoves.push('left');
    if(gameBoard[enemy.pos[0]][enemy.pos[1] + 1] !== 'WALL') posMoves.push('right');
    if(gameBoard[enemy.pos[0] - 1][enemy.pos[1]] !== 'WALL') posMoves.push('up');
    if(gameBoard[enemy.pos[0] + 1][enemy.pos[1]] !== 'WALL') posMoves.push('down');
    // Randomly select a direction
    let move = Math.floor(Math.random() * posMoves.length);
    // Move the enemy
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

    checkCaught(gameState, gameBoard, enemy, player);
}

// Find shortest Path
// https://www.geeksforgeeks.org/shortest-distance-two-cells-matrix-grid/
class QueueItem {
    constructor(x, y, w)
    {
        this.row = x;
        this.col = y;
        this.dist = w;
    }
};
function nextStep(gameBoard, enemy, player){
    let source = new QueueItem(0, 0, '');
 
    // To keep track of visited QueueItems. Marking
    // blocked cells as visited.
    let visited = Array.from(Array(gameBoard.length), ()=>Array(gameBoard[0].length).fill(false));
    for(let i = 0; i < gameBoard.length; i++){
        for(let j = 0; j < gameBoard[0].length; j++){
            if(gameBoard[i][j] === 'WALL'){
                visited[i][j] = true;
            }
            else{
                visited[i][j] = false;
            }
        }
    }
    source.row = enemy.pos[0];
    source.col = enemy.pos[1];

    // applying BFS on matrix cells starting from source
    let q = [];
    q.push(source);
    visited[source.row][source.col] = true;
    while(q.length!=0){
        let p = q[0];
        q.shift();
 
        // Destination found;
        if(p.row === player.pos[0] && p.col === player.pos[1]){
            return p.dist.split(' ')[0];
        }
 
        // moving up
        if(p.row - 1 >= 0 && visited[p.row - 1][p.col] == false){
            q.push(new QueueItem(p.row - 1, p.col, p.dist + 'up '));
            visited[p.row - 1][p.col] = true;
        }
 
        // moving down
        if(p.row + 1 < gameBoard.length && visited[p.row + 1][p.col] == false){
            q.push(new QueueItem(p.row + 1, p.col, p.dist + 'down '));
            visited[p.row + 1][p.col] = true;
        }
 
        // moving left
        if(p.col - 1 >= 0 && visited[p.row][p.col - 1] == false){
            q.push(new QueueItem(p.row, p.col - 1, p.dist + 'left '));
            visited[p.row][p.col - 1] = true;
        }
 
         // moving right
        if(p.col + 1 < gameBoard[0].length && visited[p.row][p.col + 1] == false){
            q.push(new QueueItem(p.row, p.col + 1, p.dist + 'right '));
            visited[p.row][p.col + 1] = true;
        }
    }
    return -1;
}

// Enemy movement by shortest path
function shortestPath(enemy, player, gameBoard, gameState){
    // Get the next direction to move in by taking the first step in the shortest path found through BFS
    let move = nextStep(gameBoard, enemy, player);
    // Move the enemy
    if(move === 'left' && gameBoard[enemy.pos[0]][enemy.pos[1] - 1] !== 'WALL'){
        enemy.pos = [enemy.pos[0], enemy.pos[1] - 1];
    }else if(move === 'right' && gameBoard[enemy.pos[0]][enemy.pos[1] + 1] !== 'WALL'){
        enemy.pos = [enemy.pos[0], enemy.pos[1] + 1];
    }else if(move === 'up' && gameBoard[enemy.pos[0] - 1][enemy.pos[1]] !== 'WALL'){
        enemy.pos = [enemy.pos[0] - 1, enemy.pos[1]];
    }else if(move === 'down' && gameBoard[enemy.pos[0] + 1][enemy.pos[1]] !== 'WALL'){
        enemy.pos = [enemy.pos[0] + 1, enemy.pos[1]];
    }
    
    drawScene('none', move, enemy.tag, gameBoard);

    checkCaught(gameState, gameBoard, enemy, player);
}
// Player movement
function playerMove(gameState, gameBoard, player, enemy1, enemy2){
    // Clear dot from game board
    gameBoard[player.pos[0]][player.pos[1]] = '___';
    // Move Pacman
    if(player.move === 'left'){
        player.pos = [player.pos[0], player.pos[1] - 1];
    }else if(player.move === 'right'){
        player.pos = [player.pos[0], player.pos[1] + 1];
    }else if(player.move === 'up'){
        player.pos = [player.pos[0] - 1, player.pos[1]];
    }else if(player.move === 'down'){
        player.pos = [player.pos[0] + 1, player.pos[1]];
    }

    // Check any conditions for the tile Pacman moves on
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