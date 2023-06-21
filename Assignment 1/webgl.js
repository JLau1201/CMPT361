const vertexShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: vert

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec3 aColor;

uniform float uPointSize;

out vec3 vColor;

void main(){
    vColor = aColor;
    gl_Position = vec4(aPosition, 0.0, 1.0);

    gl_PointSize = uPointSize;
}`;

const fragmentShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: frag

precision lowp float;

in vec3 vColor;
out vec4 fragColor;

void main(){
    fragColor = vec4(vColor, 1.0);
}`;

// Global variable initialization
const aPositionLoc = 0;
const aColorLoc = 1;
let gl;
let program;

let pRad = .14/2;
let pLen = Math.sqrt(3) * pRad;
let pCenter = [0,-.74];
let pFrontX = pCenter[0];
let pFrontY = pCenter[1]+pRad;
let pLeftX = pCenter[0]-pLen/2;
let pLeftY = pCenter[1]-.03;
let pRightX = pCenter[0]+pLen/2;
let pRightY = pCenter[1]-.03;

let g1X = 0;
let g1Y = .081;
let g2X = 0;
let g2Y = -.081;

// Set the vertex positions and colours for the background
const bgVertexBuffer = new Float32Array([
    // Background
    -1,-1,          .4, .4, .4,
    1,-1,           .4, .4, .4,
    -1,1,           .4, .4, .4,
    1,1,            .4, .4, .4,

    // Border
    -.825,-.825,    .9, .9, .9,
    .825,-.825,     .9, .9, .9,
    -.825,.825,     .9, .9, .9,
    .825,.825,      .9, .9, .9,

    // Bottom Left Block
    -.65,-.325,     0.00530, 0.530, 0.0315,
    -.0875,-.325,   0.00530, 0.530, 0.0315,
    -.65,-.65,      0.00530, 0.530, 0.0315,
    -.0875,-.65,    0.00530, 0.530, 0.0315,
    
    // Top Right Block
    .65,.325,       0.00530, 0.530, 0.0315,
    .0875,.325,     0.00530, 0.530, 0.0315,
    .65,.65,        0.00530, 0.530, 0.0315,
    .0875,.65,      0.00530, 0.530, 0.0315,

    // Top Left Block
    -.65,.325,      0.00530, 0.530, 0.0315,
    -.0875,.325,    0.00530, 0.530, 0.0315,
    -.65,.65,       0.00530, 0.530, 0.0315,
    -.0875,.65,     0.00530, 0.530, 0.0315,

    // Bottom Right Block
    .65,-.325,      0.00530, 0.530, 0.0315,
    .0875,-.325,    0.00530, 0.530, 0.0315,
    .65,-.65,       0.00530, 0.530, 0.0315,
    .0875,-.65,     0.00530, 0.530, 0.0315,

    // Left Pillar
    -.65,-.15,      0.00530, 0.530, 0.0315,
    -.4625,-.15,    0.00530, 0.530, 0.0315,
    -.65,.15,       0.00530, 0.530, 0.0315,
    -.4625,.15,     0.00530, 0.530, 0.0315,

    // Right Pillar
    .65,-.15,       0.00530, 0.530, 0.0315,
    .4625,-.15,     0.00530, 0.530, 0.0315,
    .65,.15,        0.00530, 0.530, 0.0315,
    .4625,.15,      0.00530, 0.530, 0.0315,
]);
// Set the indices used to draw shapes for background
const bgIndexData = new Uint8Array([
    0,1,2,
    1,2,3,

    4,5,6,
    5,6,7,

    8,9,10,
    9,10,11,

    12,13,14,
    13,14,15,

    16,17,18,
    17,18,19,
    
    20,21,22,
    21,22,23,

    24,25,26,
    25,26,27,

    28,29,30,
    29,30,31
]);
// Set the vertex positions and colours for the enemy box
const bgLineVertexBuffer = new Float32Array([
    // Right
    .0875,.15,      0.0448, 0.273, 0.640,
    .0875,.13,      0.0448, 0.273, 0.640,
    .0875,.11,      0.0448, 0.273, 0.640,
    .0875,.09,      0.0448, 0.273, 0.640,
    .0875,.07,      0.0448, 0.273, 0.640,
    .0875,.05,      0.0448, 0.273, 0.640,
    .0875,.03,      0.0448, 0.273, 0.640,
    .0875,.01,      0.0448, 0.273, 0.640,
    .0875,-.01,     0.0448, 0.273, 0.640,
    .0875,-.03,     0.0448, 0.273, 0.640,
    .0875,-.05,     0.0448, 0.273, 0.640,
    .0875,-.07,     0.0448, 0.273, 0.640,
    .0875,-.09,     0.0448, 0.273, 0.640,
    .0875,-.11,     0.0448, 0.273, 0.640,
    .0875,-.13,     0.0448, 0.273, 0.640,
    .0875,-.15,     0.0448, 0.273, 0.640,

    // Left
    -.0875,.15,      0.0448, 0.273, 0.640,
    -.0875,.13,      0.0448, 0.273, 0.640,
    -.0875,.11,      0.0448, 0.273, 0.640,
    -.0875,.09,      0.0448, 0.273, 0.640,
    -.0875,.07,      0.0448, 0.273, 0.640,
    -.0875,.05,      0.0448, 0.273, 0.640,
    -.0875,.03,      0.0448, 0.273, 0.640,
    -.0875,.01,      0.0448, 0.273, 0.640,
    -.0875,-.01,     0.0448, 0.273, 0.640,
    -.0875,-.03,     0.0448, 0.273, 0.640,
    -.0875,-.05,     0.0448, 0.273, 0.640,
    -.0875,-.07,     0.0448, 0.273, 0.640,
    -.0875,-.09,     0.0448, 0.273, 0.640,
    -.0875,-.11,     0.0448, 0.273, 0.640,
    -.0875,-.13,     0.0448, 0.273, 0.640,
    -.0875,-.15,     0.0448, 0.273, 0.640,

    // Bot
    -.0875,-.15,    0.0448, 0.273, 0.640,
    -.0625,-.15,    0.0448, 0.273, 0.640,
    -.0375,-.15,    0.0448, 0.273, 0.640,
    -.0125,-.15,    0.0448, 0.273, 0.640,
    .0125,-.15,    0.0448, 0.273, 0.640,
    .0375,-.15,    0.0448, 0.273, 0.640,
    .0625,-.15,    0.0448, 0.273, 0.640,
    .0875,-.15,    0.0448, 0.273, 0.640,

    // Top
    -.0875,.15,    0.0448, 0.273, 0.640,
    -.0625,.15,    0.0448, 0.273, 0.640,
    -.0375,.15,    0.0448, 0.273, 0.640,
    -.0125,.15,    0.0448, 0.273, 0.640,
    .0125,.15,    0.0448, 0.273, 0.640,
    .0375,.15,    0.0448, 0.273, 0.640,
    .0625,.15,    0.0448, 0.273, 0.640,
    .0875,.15,    0.0448, 0.273, 0.640,
]);
// Set the indices used to draw the shapes for the enemy box
const bgLineIndexData = new Uint8Array([
    0,1,
    2,3,
    4,5,
    6,7,
    8,9,
    10,11,
    12,13,
    14,15,

    16,17,
    18,19,
    20,21,
    22,23,
    24,25,
    26,27,
    28,29,
    30,31,

    32,33,
    34,35,
    36,37,
    38,39,

    40,41,
    42,43,
    44,45,
    46,47,
]);
// Create the vertex and fragment shaders
function compileShader(gl, shaderType, shaderSource) {
    // Create the shader object
    let shader = gl.createShader(shaderType);
   
    // Set the shader source code.
    gl.shaderSource(shader, shaderSource);
    
    // Compile the shader
    gl.compileShader(shader);
   
    // Check if it compiled
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      // Something went wrong during compilation; get the error
      throw ("could not compile shader:" + gl.getShaderInfoLog(shader));
    }
   
    return shader;
}
// Create the program
function createProgram(gl, vertexShader, fragmentShader) {
    // create a program.
    program = gl.createProgram();
   
    // attach the shaders.
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
   
    // link the program.
    gl.linkProgram(program);
   
    // Check if it linked.
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        // something went wrong with the link; get the error
        throw ("program failed to link:" + gl.getProgramInfoLog(program));
    }
}
// Create the canvas and intialize it
function initializeContext(){
    let canvas = document.getElementById("myCanvas");
    let gl = canvas.getContext("webgl2");

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = pixelRatio * canvas.clientWidth * 2;
    canvas.height = pixelRatio * canvas.clientHeight * 4;
    
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1, 1, 1, 0);
    gl.lineWidth(1.0);

    return gl;
}
// Call all intialization functions and draw initial scene
function setup(playerInput, enemyInput, enemy, gameBoard, playerState){
    gl = initializeContext();
    
    let vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(program);

    gl.enableVertexAttribArray(aPositionLoc);
    gl.enableVertexAttribArray(aColorLoc);
    
    drawScene(playerInput, enemyInput, enemy, gameBoard, playerState);
}
// Draw all items
function drawScene(playerInput, enemyInput, enemy, gameBoard, playerState){
    drawBackground(gameBoard);
    drawPlayer(playerInput, playerState);
    drawGhosts(enemyInput, enemy);
}
// Draw the Ghosts
function drawGhosts(input, enemy){
    // Set the size of the ghosts
    const uPointSizeLoc = gl.getUniformLocation(program, 'uPointSize');
    gl.uniform1f(uPointSizeLoc, 30);
    // Get which enemy moved and move them according to the input
    if(enemy === 1){
        if(input === 'left'){
            g1X -= .184;
        }else if(input === 'right'){
            g1X += .184;
        }else if(input === 'up'){
            g1Y += .162;
        }else if(input === 'down'){
            g1Y -= .162;
        }else if(input === 'reset'){
            g1X = 0;
            g1Y = .08;
        }
    }else if(enemy === 2){
        if(input === 'left'){
            g2X -= .184;
        }else if(input === 'right'){
            g2X += .184;
        }else if(input === 'up'){
            g2Y += .162;
        }else if(input === 'down'){
            g2Y -= .162;
        }else if(input === 'reset'){
            g2X = 0;
            g2Y = -.08;
        }
    }else if(enemy === 3){
        g1X = 0;
        g1Y = .08;
        g2X = 0;
        g2Y = -.08;
    }
    
    const ghostVertexBuffer = new Float32Array([
        g1X,g1Y,      1.00, 0.340, 0.450,
        g2X,g2Y,      0.430, 0.905, 1.00
    ]);

    const ghostVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ghostVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, ghostVertexBuffer, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

    gl.drawArrays(gl.POINTS, 0, 2);

}
// Draw Pacman
function drawPlayer(input, playerState){
    /*
    Pacman referenced as circle inside of each tile
    Based on player input
    Move the center of the circle accordingly
    Rotate Pacman
    Rotation defined by center of the circle
    Point Pacman towards a direction by redefining his front in relation to his radius
    Redraw the left and right angles based on the height of Pacman
    */
    if(input === 'left'){
        pCenter[0] -= .184;
        pFrontX = pCenter[0]-pRad;
        pFrontY = pCenter[1];
        pLeftX = pCenter[0]+.03;
        pLeftY = pCenter[1]-pLen/2;
        pRightX = pCenter[0]+.03;
        pRightY = pCenter[1]+pLen/2;
    } else if(input === 'right'){
        pCenter[0] += .184;
        pFrontX = pCenter[0]+pRad;
        pFrontY = pCenter[1];
        pLeftX = pCenter[0]-.03;
        pLeftY = pCenter[1]+pLen/2;
        pRightX = pCenter[0]-.03;
        pRightY = pCenter[1]-pLen/2;
    }else if(input === 'up'){
        pCenter[1] += .1635;
        pFrontX = pCenter[0];
        pFrontY = pCenter[1]+pRad;
        pLeftX = pCenter[0]-pLen/2;
        pLeftY = pCenter[1]-.03;
        pRightX = pCenter[0]+pLen/2;
        pRightY = pCenter[1]-.03;
    }else if(input === 'down'){
        pCenter[1] -=.1635;
        pFrontX = pCenter[0];
        pFrontY = pCenter[1]-pRad;
        pLeftX = pCenter[0]-pLen/2;
        pLeftY = pCenter[1]+.03;
        pRightX = pCenter[0]+pLen/2;
        pRightY = pCenter[1]+.03;
    }else if(input === 'reset'){
        pCenter = [0,-.74];
        pFrontX = pCenter[0];
        pFrontY = pCenter[1]+pRad;
        pLeftX = pCenter[0]-pLen/2;
        pLeftY = pCenter[1]-.03;
        pRightX = pCenter[0]+pLen/2;
        pRightY = pCenter[1]-.03;
    }
    // Define Pacman colour based on wether he has the Power Pellet
    let pColor1;
    let pColor2;
    let pColor3;
    if (playerState === 0){
        pColor1 = 0;
        pColor2 = 0;
        pColor3 = 1;
    }else if(playerState === 1){
        pColor1 = 0.0;
        pColor2 = 0.880;
        pColor3 = 0.528;
    }

    const playerVertexBuffer = new Float32Array([
        pFrontX,pFrontY,            pColor1,pColor2,pColor3,
        pLeftX,pLeftY,              pColor1,pColor2,pColor3,
        pRightX,pRightY,            pColor1,pColor2,pColor3,
    ]);

    const playerVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, playerVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, playerVertexBuffer, gl.STATIC_DRAW);

    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
// Draw the dots
function drawDot(xOffset, yOffset){
    // Set dot size
    const r = .03;
    // Create the vertex buffer to draw triangles around a center
    // Each circle has 20 edges
    const dotVertexBuffer = [-.1851*xOffset,-.164*yOffset,0.980, 0.964, 0.0294];
    let angle = 90;
    for(let i = 0; i < 20; i++){
        dotVertexBuffer.push(Math.cos(angle*Math.PI/180)*r-.1851*xOffset);
        dotVertexBuffer.push(Math.sin(angle*Math.PI/180)*r-.164*yOffset);
        dotVertexBuffer.push(0.980);
        dotVertexBuffer.push(0.964);
        dotVertexBuffer.push(0.0294);
        angle -= 18;
    }

    const dotIndexData = [];

    for(let i = 0; i < 19; i++){
        dotIndexData.push(0);
        dotIndexData.push(i+1);
        dotIndexData.push(i+2);
    }

    dotIndexData.push(0);
    dotIndexData.push(20);
    dotIndexData.push(1);

    const dotVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dotVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dotVertexBuffer), gl.STATIC_DRAW);

    const dotIndBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dotIndBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(dotIndexData), gl.STATIC_DRAW);

    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

    gl.drawElements(gl.TRIANGLES, 60, gl.UNSIGNED_BYTE, 0);
}
// Draw the pellet
function drawPellet(xOffset, yOffset){
    // Set pellet size
    const r = .03;
    // Create the vertex buffer to draw triangles around a center
    // Each circle has 20 edges
    const dotVertexBuffer = [-.1851*xOffset,-.164*yOffset, 1.00, 0, 0];
    let angle = 90;
    for(let i = 0; i < 20; i++){
        dotVertexBuffer.push(Math.cos(angle*Math.PI/180)*r-.1851*xOffset);
        dotVertexBuffer.push(Math.sin(angle*Math.PI/180)*r-.164*yOffset);
        dotVertexBuffer.push(1.0);
        dotVertexBuffer.push(0);
        dotVertexBuffer.push(0);
        angle -= 18;
    }

    const dotIndexData = [];

    for(let i = 0; i < 19; i++){
        dotIndexData.push(0);
        dotIndexData.push(i+1);
        dotIndexData.push(i+2);
    }

    dotIndexData.push(0);
    dotIndexData.push(20);
    dotIndexData.push(1);

    const dotVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dotVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dotVertexBuffer), gl.STATIC_DRAW);

    const dotIndBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dotIndBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(dotIndexData), gl.STATIC_DRAW);

    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

    gl.drawElements(gl.TRIANGLES, 60, gl.UNSIGNED_BYTE, 0);
}
// Draw the background
function drawBackground(gameBoard){
    // Draw background
    const bgVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bgVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bgVertexBuffer, gl.STATIC_DRAW);

    const bgIndBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bgIndBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bgIndexData, gl.STATIC_DRAW);

    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 5 * 4, 2 * 4);
    
    gl.drawElements(gl.TRIANGLES, 48, gl.UNSIGNED_BYTE, 0);

    // Draw enemy box
    const bgLineVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bgLineVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bgLineVertexBuffer, gl.STATIC_DRAW);

    const bgLineIndBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bgLineIndBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bgLineIndexData, gl.STATIC_DRAW);

    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

    gl.drawElements(gl.LINES, 48, gl.UNSIGNED_BYTE, 0);
    
    // Loop over game board to find where a dot or pellet is and draw it
    for(let i = 0; i < gameBoard.length; i++){
        for(let j = 0; j < gameBoard[i].length; j++){
            if(gameBoard[i][j] === 'dot'){
                drawDot((5-j), -1*(5.5-i));
            }else if(gameBoard[i][j] === 'pellet'){
                drawPellet((5-j), -1*(5.5-i));
            }
        }
    }
}
