const vertexShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: vert

uniform float uPointSize;
uniform vec2 uPosition;

void main(){
    gl_PointSize = uPointSize;
    gl_Position = vec4(uPosition, 0.0, 1.0);
}`;

const fragmentShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: frag

precision mediump float;

uniform int uIndex;
uniform vec4 uColors[2];

out vec4 fragColor;

void main(){
    fragColor = uColors[uIndex];
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
    canvas.height = pixelRatio * canvas.clientHeight * 5;

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

function drawBackground(gl, program){
    const uPositionLoc = gl.getUniformLocation(program, 'uPosition');
    const uPointSizeLoc = gl.getUniformLocation(program, 'uPointSize');
    const uIndexLoc = gl.getUniformLocation(program, 'uIndex');
    const uColorsLoc = gl.getUniformLocation(program, 'uColors');

    gl.uniform4fv(uColorsLoc, [
        .4,.4,.4,1,
        .8,.8,.8,1,
    ]);
    
    gl.uniform2f(uPositionLoc, 0, 0);
    gl.uniform1f(uPointSizeLoc, 750);
    gl.uniform1i(uIndexLoc, 0);

    gl.drawArrays(gl.POINTS, 0, 1);

    gl.uniform1f(uPointSizeLoc, 500);
    gl.uniform1i(uIndexLoc, 1);
    gl.drawArrays(gl.POINTS, 0, 1);
}

setup();