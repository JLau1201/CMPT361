const vertexShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: vert

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec3 aColor;

out vec3 vColor;

void main(){
    vColor = aColor;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const fragmentShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: frag

precision lowp float;

in vec3 vColor;
out vec4 fragColor;

void main(){
    fragColor = vec4(vColor, 1.0);
}`;

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
    let gl = initializeContext();
    
    let vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    let program = createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(program);
    
    drawBackground(gl, program);
    
}

function drawBackground(gl){
    const vertexBuffer = new Float32Array([
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

    const elementIndexData = new Uint8Array([
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

    const aPositionLoc = 0;
    const aColorLoc = 1;
    
    const vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexBuffer, gl.STATIC_DRAW);

    const elementIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elementIndexData, gl.STATIC_DRAW);

    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

    gl.enableVertexAttribArray(aPositionLoc);
    gl.enableVertexAttribArray(aColorLoc);
   
    gl.drawElements(gl.TRIANGLES, 48, gl.UNSIGNED_BYTE, 0);
    
    const lineBuffer = new Float32Array([
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

    const lineIndexData = new Uint8Array([
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

    const lineBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
    gl.bufferData(gl.ARRAY_BUFFER, lineBuffer, gl.STATIC_DRAW);

    const lineIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lineIndexData, gl.STATIC_DRAW);

    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

    gl.drawElements(gl.LINES, 48, gl.UNSIGNED_BYTE, 0);
}

setup();