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

// Global initialization
const aPositionLoc = 0;
const aColorLoc = 1;
let gl;
let program;

let pRad = .175/2;
let pLen = Math.sqrt(3) * pRad;
let pFrontX = 0;
let pFrontY = -.65;
let pLeftX = -pLen/2;
let pLeftY = -.78125;
let pRightX = pLen/2;
let pRightY = -.78125;

let g1X = 0;
let g1Y = .081;
let g2X = 0;
let g2Y = -.081;

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

function createProgram(gl, vertexShader, fragmentShader) {
    // create a program.
    let program = gl.createProgram();
   
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
   
    return program;
}

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

function setup(){
    gl = initializeContext();
    
    let vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    program = createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(program);

    gl.enableVertexAttribArray(aPositionLoc);
    gl.enableVertexAttribArray(aColorLoc);
    
    drawScene();
}

function drawScene(playerInput, enemyInput, enemy, gameBoard){
    drawBackground(gameBoard);
    drawPlayer(playerInput);
    drawGhosts(enemyInput, enemy);
}

function drawGhosts(input, enemy){
    const uPointSizeLoc = gl.getUniformLocation(program, 'uPointSize');
    gl.uniform1f(uPointSizeLoc, 30);
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
    }else{
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
    }
    
    const ghostVertexBuffer = new Float32Array([
        g1X,g1Y,      1,0,0,
        g2X,g2Y,      0,0,1,
    ]);

    const ghostVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ghostVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, ghostVertexBuffer, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

    gl.drawArrays(gl.POINTS, 0, 2);

}

function rotateRight(){
    pFrontX = Math.sin(90*Math.PI/180)*pRad + pFrontX;
    pFrontY = Math.cos(90*Math.PI/180)*pRad - pFrontY;
    
    pLeftX = Math.sin(90*Math.PI/180)*pRad + pLeftX;
    pLeftY = Math.cos(90*Math.PI/180)*pRad - pLeftY;

    pRightX = Math.sin(90*Math.PI/180)*pRad + pRightX;
    pRightY = Math.cos(90*Math.PI/180)*pRad - pRightY;
    
}

function drawPlayer(input){
    if(input === 'left'){
        pFrontX -= .184;
        pLeftX -= .184;
        pRightX -= .184;
    } else if(input === 'right'){
        pFrontX += .184;
        pLeftX += .184;
        pRightX += .184;
    }else if(input === 'up'){
        pFrontY += .163;
        pLeftY += .163;
        pRightY += .163;
    }else if(input === 'down'){
        pFrontY -= .163;
        pLeftY -= .163;
        pRightY -= .163;
    }

    const playerVertexBuffer = new Float32Array([
        pFrontX,pFrontY,            0,0,1,
        pLeftX,pLeftY,              0,0,1,
        pRightX,pRightY,            0,0,1,
    ]);

    const playerVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, playerVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, playerVertexBuffer, gl.STATIC_DRAW);

    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function drawDot(xOffset, yOffset){
    const r = .04;
    const dotVertexBuffer = [-.185*xOffset,-.165*yOffset,0.980, 0.964, 0.0294];
    let angle = 90;
    for(let i = 0; i < 20; i++){
        dotVertexBuffer.push(Math.cos(angle*Math.PI/180)*r-.182*xOffset);
        dotVertexBuffer.push(Math.sin(angle*Math.PI/180)*r-.165*yOffset);
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

function drawBackground(gameBoard){
    const bgVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bgVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bgVertexBuffer, gl.STATIC_DRAW);

    const bgIndBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bgIndBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bgIndexData, gl.STATIC_DRAW);

    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 5 * 4, 2 * 4);
    
    gl.drawElements(gl.TRIANGLES, 48, gl.UNSIGNED_BYTE, 0);

    const bgLineVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bgLineVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bgLineVertexBuffer, gl.STATIC_DRAW);

    const bgLineIndBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bgLineIndBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bgLineIndexData, gl.STATIC_DRAW);

    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

    gl.drawElements(gl.LINES, 48, gl.UNSIGNED_BYTE, 0);

    for(let i = 0; i < gameBoard.length; i++){
        for(let j = 0; j < gameBoard[i].length; j++){
            if(gameBoard[i][j] === 'dot'){
                drawDot((5-j), -1*(5.5-i));
            }
        }
    }
}

setup();