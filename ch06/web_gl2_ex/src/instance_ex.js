import { mat4 } from "../node_modules/gl-matrix/esm/index.js";
import { getGL2, createShader, getProgram } from "./until.js";
const NUM_INSTANCES = 25;
const POSITION_LOC = 0;
const COLOR_LOC = 1;
const MVP_LOC = 2;
let gl;
let program;
let positionVBO;
let colorVBO;
let mvpVBO;
let indicesIBO;
let numIndices;
const angle = new Array(NUM_INSTANCES);
const instancingExVertexShaderSource = `#version 300 es
    layout(location=0) in vec4 a_position;
    layout(location=1) in vec4 a_color;
    layout(location=2) in mat4 a_mvpMatrix;
    out vec4 v_color;
    
    void main() {
        v_color = a_color;
        gl_Position = a_mvpMatrix * a_position;
    }
`;
const instancingExFragmentShaderSource = `#version 300 es
    precision mediump float;
    in vec4 v_color;
    layout(location=0) out vec4 outColor;
    
    void main() {
        outColor = v_color;
    }
`;
function generateCube(size) {
    const positions = new Float32Array([
        // 앞
        -size, -size, size,
        size, -size, size,
        size, size, size,
        -size, size, size,
        // 뒤
        -size, -size, -size,
        -size, size, -size,
        size, size, -size,
        size, -size, -size,
        // 위
        -size, size, -size,
        -size, size, size,
        size, size, size,
        size, size, -size,
        // 아래
        -size, -size, -size,
        size, -size, -size,
        size, -size, size,
        -size, -size, size,
        // 오른쪽
        size, -size, -size,
        size, size, -size,
        size, size, size,
        size, -size, size,
        // 왼쪽
        -size, -size, -size,
        -size, -size, size,
        -size, size, size,
        -size, size, -size,
    ]);
    const indices = new Uint32Array([
        // 앞
        0, 1, 2, 0, 2, 3,
        // 뒤
        4, 5, 6, 4, 6, 7,
        // 위
        8, 9, 10, 8, 10, 11,
        // 아래
        12, 13, 14, 12, 14, 15,
        // 오른쪽
        16, 17, 18, 16, 18, 19,
        // 왼쪽
        20, 21, 22, 20, 22, 23,
    ]);
    return {
        positions: positions,
        indices: indices
    };
}
function generateRandomColors(num) {
    const colors = new Uint8Array(num * 4);
    for (let i = 0; i < num; i++) {
        colors[i * 4] = Math.random() * 255; // R
        colors[i * 4 + 1] = Math.random() * 255; // G
        colors[i * 4 + 2] = Math.random() * 255; // B
        colors[i * 4 + 3] = 255;
    }
    return colors;
}
// WebGL 버퍼 생성 유틸리티 함수
function createVBO(gl, data) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
}
function createIBO(gl, data) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
}
function initInstancingEx() {
    // webGL2 객체 생성
    gl = getGL2(document.querySelector("#instancingEx"));
    // vertex, fragment Shader 생성
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, instancingExVertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, instancingExFragmentShaderSource);
    // programingObj 생성
    program = getProgram(gl, vertexShader, fragmentShader);
    const geometry = generateCube(0.1);
    numIndices = geometry.indices.length;
    positionVBO = createVBO(gl, geometry.positions);
    colorVBO = createVBO(gl, generateRandomColors(NUM_INSTANCES));
    mvpVBO = createVBO(gl, new Float32Array(NUM_INSTANCES * 16));
    indicesIBO = createIBO(gl, geometry.indices);
    for (let i = 0; i < NUM_INSTANCES; i++) {
        angle[i] = Math.random() * 360;
    }
    requestAnimationFrame(renderInstancingEx);
}
function renderInstancingEx() {
    requestAnimationFrame(renderInstancingEx);
    const fieldOfView = Math.PI / 4;
    const perspective = mat4.create();
    const viewMatrix = mat4.create();
    const canvas = gl.canvas;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
    const aspect = canvas.width / canvas.height;
    mat4.perspective(perspective, fieldOfView, aspect, 1, 20);
    const cameraPosition = [0, 0, -5];
    const targetPosition = [0, 0, 0];
    const up = [0, 1, 0];
    mat4.lookAt(viewMatrix, cameraPosition, targetPosition, up);
    const matrixBuf = new Float32Array(NUM_INSTANCES * 16);
    const numRows = Math.sqrt(NUM_INSTANCES);
    const numColumns = numRows;
    for (let instance = 0; instance < NUM_INSTANCES; instance++) {
        const modelView = mat4.create();
        const translateX = ((instance % numRows) / numRows) * 2 - 1;
        const translateY = ((Math.floor(instance / numColumns)) / numColumns) * 2 - 1;
        mat4.translate(modelView, modelView, [translateX, translateY, -2]);
        angle[instance] += (0.016 * 40.0);
        if (angle[instance] >= 360) {
            angle[instance] -= 360;
        }
        mat4.rotate(modelView, modelView, angle[instance] * Math.PI / 180, [1, 0, 1]);
        mat4.mul(matrixBuf.subarray(instance * 16, (instance + 1) * 16), perspective, modelView);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, mvpVBO);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixBuf);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionVBO);
    gl.enableVertexAttribArray(POSITION_LOC);
    gl.vertexAttribPointer(POSITION_LOC, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorVBO);
    gl.enableVertexAttribArray(COLOR_LOC);
    gl.vertexAttribPointer(COLOR_LOC, 4, gl.UNSIGNED_BYTE, true, 0, 0);
    gl.vertexAttribDivisor(COLOR_LOC, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, mvpVBO);
    for (let i = 0; i < 4; i++) {
        let loc = MVP_LOC + i;
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 16 * 4, i * 4 * 4);
        gl.vertexAttribDivisor(loc, 1);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesIBO);
    gl.drawElementsInstanced(gl.TRIANGLES, numIndices, gl.UNSIGNED_INT, 0, NUM_INSTANCES);
}
initInstancingEx();
