function initializeGame(){
    let gameBoard = [
        ['WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL',],
        ['WALL', 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'dot' , 'dot' , 'enemy', 'dot', 'dot' , 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'dot' , 'dot' , 'enemy', 'dot', 'dot' , 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL', 'WALL', 'WALL', 'dot' , 'WALL',],
        ['WALL', 'dot' , 'dot' , 'dot' , 'dot' , 'player', 'dot', 'dot', 'dot' , 'dot' , 'WALL',],
        ['WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL',],
    ];

    let playerPos = [10, 5];

    let time = 60;
    let score = 0;
    
    keyEventListener(gameBoard, playerPos);
}

function printBoard(gameBoard){
    let div = document.getElementById('content');

    let buffer = '';
    for(let i = 0; i < gameBoard.length; i++){
        for(let j = 0; j < gameBoard[i].length; j++){
            buffer += `<span class='tile'>${gameBoard[i][j]}</span>` + " ";
        }

        buffer += "<br>";
    }

    div.innerHTML = buffer
}

function keyEventListener(gameBoard, playerPos) {
    
	document.addEventListener('keydown', (event) => {
		const keyName = event.key;
		if (keyName === "ArrowLeft" && gameBoard[playerPos[0]][playerPos[1] - 1] !== 'WALL') {
            gameBoard[playerPos[0]][playerPos[1]] = 'empty';
            
            playerPos = [playerPos[0], playerPos[1] - 1];
            gameBoard[playerPos[0]][playerPos[1]] = 'player';

		} else if (keyName === "ArrowRight"  && gameBoard[playerPos[0]][playerPos[1] + 1] !== 'WALL') {
			gameBoard[playerPos[0]][playerPos[1]] = 'empty';
            
            playerPos = [playerPos[0], playerPos[1] + 1];
            gameBoard[playerPos[0]][playerPos[1]] = 'player';

		} else if (keyName === "ArrowUp"  && gameBoard[playerPos[0] - 1][playerPos[1]] !== 'WALL') {
			gameBoard[playerPos[0]][playerPos[1]] = 'empty';
            
            playerPos = [playerPos[0] - 1, playerPos[1]];
            gameBoard[playerPos[0]][playerPos[1]] = 'player';

		} else if (keyName === "ArrowDown"  && gameBoard[playerPos[0] + 1][playerPos[1]] !== 'WALL') {
			gameBoard[playerPos[0]][playerPos[1]] = 'empty';
            
            playerPos = [playerPos[0] + 1, playerPos[1]];
            gameBoard[playerPos[0]][playerPos[1]] = 'player';

		}
        
        printBoard(gameBoard);

	});

}

initializeGame();