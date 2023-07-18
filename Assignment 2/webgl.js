const vertexShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: vert

layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec4 aColor;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

out vec4 vColor;

void main(){
    vColor = aColor;

    gl_Position = uProjection * uView * uModel * aPosition;
}`;

const fragmentShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: frag

precision lowp float;

in vec4 vColor;
out vec4 fragColor;

void main(){
    fragColor = vColor;
}`;

const aPositionLoc = 0;
const aColorLoc = 1;

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

    canvas.width = pixelRatio * canvas.clientWidth * 4;
    canvas.height = pixelRatio * canvas.clientHeight * 4;
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(.3, .3, .3, 1);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.lineWidth(1.0);

    return gl;
}

function setup(){
    gl = initializeContext();

    let vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    createProgram(gl, vertexShader, fragmentShader);
    
    gl.enableVertexAttribArray(aPositionLoc);
    
    gl.useProgram(program);
    
    const vertices = get_vertices();
    const faces = get_faces();
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(faces).map(v => v-1)), gl.STATIC_DRAW);

    const modelLoc = gl.getUniformLocation(program, 'uModel');
    const viewLoc = gl.getUniformLocation(program, 'uView');
    const projectionLoc = gl.getUniformLocation(program, 'uProjection');
    
    const viewMat = lookAt(vec3(0, 0, 30), vec3(0, 0, 0), vec3(0, 1, 0));
    const projectionMat = perspective(Math.PI * 10, gl.canvas.width / gl.canvas.height, .01, 1000);

    gl.uniformMatrix4fv(viewLoc, false, flatten(viewMat));
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMat));

    drawCow(gl, faces.length * 3, modelLoc);
}

function drawCow(gl, faces, modelLoc){
    let transX = 0;
    let transY = 0;
    let transZ = 0;
    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;

    let rightX = 0;
    let rightY = 0;

    let leftMouse = false;
    let rightMouse = false;

    let modelMat = mat4();

    gl.canvas.addEventListener('mousedown', (e) => {
        if(e.which === 1){
            leftMouse = true;
        }else if(e.which === 3){
            rightMouse = true;
            rightX = e.clientX;
            rightY = e.clientY;
        }
    })

    gl.canvas.addEventListener('mouseup', (e) => {
        if(e.which === 1){
            leftMouse = false;
        }else if(e.which === 3){
            rightMouse = false;
        }
    });

    gl.canvas.addEventListener('mousemove', (e) => {
        if(leftMouse){
            const rect = gl.canvas.getBoundingClientRect();
            transX = 2 * ((e.clientX - rect.left) / rect.width * 2 - 1) * (.3*-transZ + 8);
            transY = ((e.clientY - rect.top) / rect.height * - 2 + 1) * (.3*-transZ + 8);
        }else if(rightMouse){
            if(e.clientX > rightX){
                rotX += 3;
            }else if(e.clientX < rightX){
                rotX -= 3;
            }
            if(e.clientY > rightY){
                rotY += 3;
            }else if(e.clientY < rightY){
                rotY -= 3;
            }
            rightX = e.clientX;
            rightY = e.clientY;
        }
        draw();
    });

    document.addEventListener('wheel', (e) => {
        if(e.deltaY > 0){
            transZ += 1;
        }else if(e.deltaY < 0){
            transZ -= 1;
        }

        draw();
    });

    document.addEventListener('keydown', (e) => {
        if(e.key === 'ArrowLeft'){
            rotZ -= 3;
        }else if(e.key === 'ArrowRight'){
            rotZ += 3;
        }else if(e.key === 'r'){
            transX = 0;
            transY = 0;
            transZ = 0;
            rotX = 0;
            rotY = 0;
            rotZ = 0;
        }
        draw();
    });

    function draw(){
        
        const rotationMat = mult(rotateZ(rotZ), mult(rotateY(rotX), rotateX(rotY)));
        const translationMat = translate(transX, transY, transZ);
        modelMat = mult(translationMat, rotationMat);

        gl.uniformMatrix4fv(modelLoc, false, flatten(modelMat));
    
        gl.clearColor(.4, .4, .4, 1);

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawElements(gl.TRIANGLES, faces, gl.UNSIGNED_SHORT, 0);
    }

    draw();
}

// https://stackoverflow.com/questions/737022/how-do-i-disable-right-click-on-my-web-page
document.addEventListener('contextmenu', event => event.preventDefault());

setup();