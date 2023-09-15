import { getGL2, createShader, getProgram } from "./until.js";

const vertexAttribExVertexShaderSource: string = `#version 300 es
    layout(location=0) in vec4 a_position;
    layout(location=1) in vec4 a_color;
    out vec4 v_color;
    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }`;

const vertexAttribExFragmentShaderSource: string = `#version 300 es
    precision mediump float;
    in vec4 v_color;
    out vec4 o_fragColor;
    void main() {
        o_fragColor = v_color;
    }`

let color = "#32a852";

export function resetColor() {
    const colorInput: HTMLInputElement = document.querySelector("#constVertexAttributesPicker");
    color = colorInput.value;
    constVertexAttributeEx();
}

function glColorBufferInit(gl: WebGLRenderingContext, backgroundColor: string): void {
    const {r, g, b}: RGB = hexToRgb(backgroundColor);
    gl.clearColor(r, g, b, 1);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

export function checkMaxVertexAttribs(): void {
    const gl: WebGLRenderingContext = getGL2(document.createElement("canvas"));
    const maxVertexAttribs: number = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    alert(`max vertex attribs: ${maxVertexAttribs}`);
}

interface RGB {
    r: number;
    g: number;
    b: number;
}

function hexToRgb(hex: string): RGB {
    // Hex 코드에서 # 문자 제거
    hex = hex.replace(/^#/, '');

    // Hex 코드를 파싱하여 R, G, B 값을 추출
    const bigint = parseInt(hex, 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;

    // Alpha 값을 적용하여 RGBA 문자열 생성
    return {r, g, b};
}

function constVertexAttributeEx() {
    // webGL2 객체 생성
    const gl: WebGLRenderingContext = getGL2(document.querySelector("#constVertexAttribute"));
    // vertex, fragment Shader 생성
    const vertexShader: WebGLShader = createShader(gl, gl.VERTEX_SHADER, vertexAttribExVertexShaderSource);
    const fragmentShader: WebGLShader = createShader(gl, gl.FRAGMENT_SHADER, vertexAttribExFragmentShaderSource);
    // programingObj 생성
    const program: WebGLProgram = getProgram(gl, vertexShader, fragmentShader);

    // VAO 생성
    const positionBuffer: WebGLBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // 정점 위치정보 생성
    const vertexPos: number[] = [
        0, 0.5, 0,
        -0.5, -0.5, 0,
        0.5, -0.5, 0
    ];
    // VAO 에 정보 입력
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos), gl.STATIC_DRAW);

    // Color Buffer 초기화
    glColorBufferInit(gl, "#000000");
    gl.useProgram(program);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    const {r, g, b} = hexToRgb(color);
    gl.vertexAttrib4f(1, r, g, b, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function main() {
    constVertexAttributeEx();
}

main();
// @ts-ignore
window.resetColor = resetColor;
// @ts-ignore
window.checkMaxVertexAttribs = checkMaxVertexAttribs;
