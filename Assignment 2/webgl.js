const vertexShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: vert

layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec3 aNormal;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
out vec3 vNormal;

// Point Light
uniform vec3 uLightWorldPosition;
uniform vec3 uViewWorldPosition;
out vec3 vSurfaceToLight;
out vec3 vSurfaceToView;

// Spot Light
uniform vec3 uSpotLightWorldPosition;
uniform vec3 uSpotViewWorldPosition;
out vec3 vSpotSurfaceToLight;
out vec3 vSpotSurfaceToView;

void main(){
    vNormal = mat3(uModel) * aNormal;
    gl_Position = uProjection * uView * uModel * aPosition;
    vec3 surfaceWorldPosition = (uModel * aPosition).xyz;

    // Point Light
    vSurfaceToLight = uLightWorldPosition - surfaceWorldPosition;
    vSurfaceToView = uViewWorldPosition - surfaceWorldPosition;

    //Spot Light
    vSpotSurfaceToLight = uSpotLightWorldPosition - surfaceWorldPosition;
    vSpotSurfaceToView = uSpotViewWorldPosition - surfaceWorldPosition;
}`;

const fragmentShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: frag

precision highp float;

uniform vec4 uColor;
out vec4 outColor;
in vec3 vNormal;

// Point Light
uniform float uShininess;
in vec3 vSurfaceToLight;
in vec3 vSurfaceToView;

// Spot Light
uniform vec3 uSpotLightColor;
in vec3 vSpotSurfaceToLight;
in vec3 vSpotSurfaceToView;
uniform float uSpotShininess;
uniform vec3 uSpotLightDirection;
uniform float uLimit;

void main(){
    vec3 normal = normalize(vNormal);
    outColor = uColor;

    // Point Light
    vec3 surfaceToLightDirection = normalize(vSurfaceToLight);
    vec3 surfaceToViewDirection = normalize(vSurfaceToView);
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
    float light = dot(normal, surfaceToLightDirection);
    float specular = 0.0;
    if (light > 0.0) {
      specular = pow(dot(normal, halfVector), uShininess);
    }
    vec3 ambient = 0.01 * uColor.rgb;
    vec3 diffuse = 0.01 *  light * uColor.rgb;

    // Spot Light
    vec3 spotSurfaceToLightDirection = normalize(vSpotSurfaceToLight);
    vec3 spotSurfaceToViewDIrection = normalize(vSpotSurfaceToView);
    vec3 spotHalfVector = normalize(spotSurfaceToLightDirection + spotSurfaceToViewDIrection);
    float spotLight = 0.0;
    float spotSpecular = 0.0;
    float dotFromDirection = dot(spotSurfaceToLightDirection, -uSpotLightDirection);
    if (dotFromDirection >= uLimit) {
        spotLight = dot(normal, spotSurfaceToLightDirection);
        if (spotLight > 0.0) {
            spotSpecular = pow(dot(normal, spotHalfVector), uSpotShininess);
        }
    }

    if(outColor.rgb != vec3(1.0, 1.0, 1.0)){
        outColor.rgb *= ambient + diffuse + 1.2 *light + spotLight;
        outColor.rgb += .38 *specular + .5 * spotSpecular;
    }
}`;

const aPositionLoc = 0;
const aNormalLoc = 1;

let transX = 0;
let transY = 0;
let transZ = 0;
let rotX = 0;
let rotY = 0;
let rotZ = 0;

let gl;
let program;
let modelLoc; 
let viewLoc;
let projectionLoc;
let colorLoc;
let shininessLoc;
let lightWorldPositionLoc;
let viewWorldPositionLoc;
let spotShininessLoc;
let spotLightDirectionLoc;
let limitLoc;
let spotLightWorldPositionLoc;
let spotViewWorldPositionLoc;
let spotlightColorLoc;

let rotatePointLight = true;
let pointRotAngle = 0;
let panSpotLight = true;
let spotRotAngle = 0;
let spotDir = 'right';

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
    gl = canvas.getContext("webgl2");

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = pixelRatio * canvas.clientWidth * 2.5;
    canvas.height = pixelRatio * canvas.clientHeight * 4;
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    gl.lineWidth(1.0);

    return gl;
}
// Define the vertices for the point Light wireframe
function getCubeVertices(){
    return [vec3(-.5, -.5, -.5),
            vec3(.5, -.5, -.5),
            vec3(.5, .5, -.5),
            vec3(-.5, .5, -.5),
            vec3(-.5, -.5, .5),
            vec3(.5, -.5, .5),
            vec3(.5, .5, .5),
            vec3(-.5, .5, .5)];
}
// Define the faces for the point light wireframe
function getCubeFaces(){
    return [vec2(0, 1),
            vec2(1, 2),
            vec2(2, 3),
            vec2(3, 0),
            vec2(0, 4),
            vec2(1, 5),
            vec2(2, 6),
            vec2(3, 7),
            vec2(4, 5),
            vec2(5, 6),
            vec2(6, 7),
            vec2(7, 4)];
}
// Draw the point light and wireframe
function drawCube(){
    // Get vertices and faces
    const cubeVertices = getCubeVertices();
    const cubeFaces = getCubeFaces();
    
    // Create buffers
    cubeVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);

    cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(cubeFaces)), gl.STATIC_DRAW);
    
    // Rotate the pointlight
    if(rotatePointLight){
        pointRotAngle -= .025;
        gl.uniform3fv(lightWorldPositionLoc, [8 * Math.cos(pointRotAngle), 5, 5 * Math.sin(pointRotAngle)]);
    }
    // Rotate wireframe
    const modelMat = translate(vec3(8 * Math.cos(pointRotAngle), 5, 5 * Math.sin(pointRotAngle)));

    // Set uniforms and draw
    gl.uniform4fv(colorLoc, [1, 1, 1, 1]);
    gl.uniformMatrix4fv(modelLoc, false, flatten(modelMat));
    gl.drawElements(gl.LINES, cubeFaces.length * 2, gl.UNSIGNED_SHORT, 0);
}
// Define the vertices for the spot Light wireframe
function getConeVertices(){
    const vertices = [];
    vertices.push(vec3(0, 1, 0));

    for (let i = 0; i <= 20; i++) {
        const angle = 2 * (i / 20) * Math.PI;
        const x = .3 * Math.cos(angle);
        const z = .3 * Math.sin(angle);
        vertices.push(vec3(x, 0, z));
    }
    vertices.push(vertices[1]);

    return vertices;
}
// Define the faces for the spot Light wireframe
function getConeFaces(){
    const indices = [];

    for (let i = 1; i <= 20; i++) {
        indices.push(0, i + 1);
    }

    indices.push(0, 1);

    return indices;
}
// Draw the spot light and wireframe
function drawCone(){
    // Get vertices and faces
    const coneVertices = getConeVertices();
    const coneFaces = getConeFaces();

    // Create buffers
    const coneVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(coneVertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);

    const coneIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coneIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(coneFaces), gl.STATIC_DRAW);

    // Rotate the spotlight
    const rotatedPosition = vec3(0, 6, 6);
    let modelMat = translate(0, 6, 6);
    if(panSpotLight) {
        if(spotDir === 'right'){
            spotRotAngle -= 0.01;
            if(spotRotAngle < -0.8){
                spotDir = 'left';
            }
        }else if(spotDir === 'left'){
            spotRotAngle += 0.01;
            if(spotRotAngle > 0.5){
                spotDir = 'right';
            }
        }
        rotatedPosition[0] = -6 * Math.sin(spotRotAngle);
        rotatedPosition[2] = 6 * Math.cos(spotRotAngle);
        gl.uniform3fv(spotLightWorldPositionLoc, rotatedPosition);
    }
    // Rotate the wireframe
    modelMat = mult(modelMat, rotateZ(45 * -spotRotAngle));
    
    // Set uniforms and draw
    gl.uniform3fv(spotlightColorLoc, [0.0, 0.0, 0.0]);
    gl.uniformMatrix4fv(modelLoc, false, flatten(modelMat));
    gl.uniform3fv(spotViewWorldPositionLoc, [0, 0, 30]);
    gl.uniform1f(spotShininessLoc, 40);
    gl.uniform3fv(spotLightDirectionLoc, [0, -1, -1.1]);
    gl.uniform1f(limitLoc, 1.695 * Math.cos(Math.PI * 30 / 180));
    gl.uniform4fv(colorLoc, [1, 1, 1, 1]);
    gl.drawElements(gl.LINES, coneFaces.length, gl.UNSIGNED_SHORT, 0);
}
// Compute the normals for smooth shading
function getNormals(vertices, faces){

    // Calculate the normals for each triangle
    const faceNormals = [];
    for(let i = 0; i < faces.length; i++) {
        const v0 = vertices[faces[i][0] - 1];
        const v1 = vertices[faces[i][1] - 1];
        const v2 = vertices[faces[i][2] - 1];
        const edge1 = subtract(v1, v0);
        const edge2 = subtract(v2, v0);
        const normal = normalize(cross(edge1, edge2));
        faceNormals.push(normal);
    }
    
    // Create normal vertex array
    const vertexNormals = [];
    for(let i = 0; i < vertices.length; i++) {
        vertexNormals.push(vec3(0, 0, 0));
    }
    // Compute the vertex normals for each face normal
    for(let i = 0; i < faces.length; i++) {
        const face0 = faces[i][0] - 1;
        const face1 = faces[i][1] - 1;
        const face2 = faces[i][2] - 1;

        vertexNormals[face0] = add(vertexNormals[face0], faceNormals[i]);
        vertexNormals[face1] = add(vertexNormals[face1], faceNormals[i]);
        vertexNormals[face2] = add(vertexNormals[face2], faceNormals[i]);
    }

    // Normalize each normal vertex for smooth shading
    for(let i = 0; i < vertexNormals.length; i++) {
        vertexNormals[i] = normalize(vertexNormals[i]);
    }

    return vertexNormals;
}
// Draw the cow
function drawCow(){
    // Get vertices and faces
    const cowVertices = get_vertices();
    const cowFaces = get_faces();
    
    // Create buffers
    const cowVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cowVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cowVertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);

    const cowIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cowIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(cowFaces).map(v => v-1)), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(getNormals(cowVertices, cowFaces)), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aNormalLoc, 3, gl.FLOAT, false, 0, 0);

    // Set the rotation and translation of the cow
    const rotationMat = mult(rotateX(rotY), mult(rotateY(rotX), rotateZ(rotZ)));
    const translationMat = translate(transX, transY, transZ);
    modelMat = mult(translationMat, rotationMat);

    // Set the uniforms and draw
    gl.uniformMatrix4fv(modelLoc, false, flatten(modelMat));
    gl.uniform4fv(colorLoc, [0.630, 0.391, 0.220, 1]);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, get_faces().length * 3, gl.UNSIGNED_SHORT, 0);
}
// Render the scene
function drawScene(){
    // Repeatedly draw the scene
    function draw(){
        requestAnimationFrame(draw);
        drawCow();
        drawCube();
        drawCone();
    }

    requestAnimationFrame(draw);
}
// Define the controls for interacting with the cow/lights
function actions(){
    let rightX = 0;
    let rightY = 0;

    let leftMouse = false;
    let rightMouse = false;

    // Get whether left or right mouse button is clicked
    gl.canvas.addEventListener('mousedown', (e) => {
        if(e.which === 1){
            leftMouse = true;
        }else if(e.which === 3){
            rightMouse = true;
            rightX = e.clientX;
            rightY = e.clientY;
        }
    })

    // Get whether left or right mouse button is released
    gl.canvas.addEventListener('mouseup', (e) => {
        if(e.which === 1){
            leftMouse = false;
        }else if(e.which === 3){
            rightMouse = false;
        }
    });
    
    // Get mouse movement
    gl.canvas.addEventListener('mousemove', (e) => {
        if(leftMouse){
            // Translate cow
            const rect = gl.canvas.getBoundingClientRect();
            transX =  1.6 * ((e.clientX - rect.left) / rect.width * 2 - 1) * (.26*-transZ + 8);
            transY =  1.25 * ((e.clientY - rect.top) / rect.height * - 2 + 1) * (.28*-transZ + 8);
        }else if(rightMouse){
            // Rotate Cow
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
    });

    // Get Z axis translation of cow
    document.addEventListener('wheel', (e) => {
        if(e.deltaY > 0){
            transZ += 1;
        }else if(e.deltaY < 0){
            transZ -= 1;
        }
    });

    // Get Z axis rotation of cow and light commands
    document.addEventListener('keydown', (e) => {
        if(e.key === 'ArrowLeft'){
            rotZ += 3;
        }else if(e.key === 'ArrowRight'){
            rotZ -= 3;
        }else if(e.key === 'r'){
            transX = 0;
            transY = 0;
            transZ = 0;
            rotX = 0;
            rotY = 0;
            rotZ = 0;
        }else if(e.key === 'p'){
            if(rotatePointLight === true){
                rotatePointLight = false;
            }else{
                rotatePointLight = true;
            }
        }else if(e.key === 's'){
            if(panSpotLight === true){
                panSpotLight = false;
            }else{
                panSpotLight = true;
            }
        }
    });
}
// Define all the uniform locations and set unchanging uniforms
function setupUniforms(){
    // Enable attribute locations
    gl.enableVertexAttribArray(aPositionLoc);
    gl.enableVertexAttribArray(aNormalLoc);
    
    // Get cow model uniforms
    modelLoc = gl.getUniformLocation(program, 'uModel');
    viewLoc = gl.getUniformLocation(program, 'uView');
    projectionLoc = gl.getUniformLocation(program, 'uProjection');
    colorLoc = gl.getUniformLocation(program, 'uColor');
    // Get point light uniforms
    shininessLoc = gl.getUniformLocation(program, "uShininess");
    lightWorldPositionLoc = gl.getUniformLocation(program, "uLightWorldPosition");
    viewWorldPositionLoc = gl.getUniformLocation(program, "uViewWorldPosition");
    // Get spot light uniforms
    spotShininessLoc = gl.getUniformLocation(program, 'uSpotShininess');
    spotLightDirectionLoc = gl.getUniformLocation(program, 'uSpotLightDirection');
    limitLoc = gl.getUniformLocation(program, 'uLimit');
    spotLightWorldPositionLoc = gl.getUniformLocation(program, 'uSpotLightWorldPosition');
    spotViewWorldPositionLoc = gl.getUniformLocation(program, 'uSpotViewWorldPosition');
    spotlightColorLoc = gl.getUniformLocation(program, 'uSpotlightColor');
    
    // Set unchanging uniforms
    gl.uniform3fv(lightWorldPositionLoc, [8, 5, 5]);
    gl.uniform3fv(viewWorldPositionLoc, [0, 0, 30]);
    gl.uniform1f(shininessLoc, 40);
    const viewMat = lookAt(vec3(0, 0, 30), vec3(0, 0, 0), vec3(0, 1, 0));
    const projectionMat = perspective(Math.PI * 12, gl.canvas.width / gl.canvas.height, .01, 1000);
    gl.uniformMatrix4fv(viewLoc, false, flatten(viewMat));
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMat));
}
// Setup/call all functions
function setup(){
    gl = initializeContext();
    
    let vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);  

    setupUniforms();
    actions();
    drawScene();
}
// https://stackoverflow.com/questions/737022/how-do-i-disable-right-click-on-my-web-page
document.addEventListener('contextmenu', event => event.preventDefault());

setup();