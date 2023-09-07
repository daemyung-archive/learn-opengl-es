const vertexShaderSource = `#version 300 es
    layout(location=0) in vec4 a_position;
    layout(location=1) in vec4 a_color;
    out vec4 v_color;
    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }`;
const fragmentShaderSource = `#version 300 es
    precision mediump float;
    in vec4 v_color;
    out vec4 o_fragColor;
    void main() {
        o_fragColor = v_color;
    }`;
let color = "#32a852";
function resetColor() {
    const colorInput = document.querySelector("#constVertexAttributesPicker");
    color = colorInput.value;
    constVertexAttributeEx();
}
function getGL2(canvas) {
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        throw new Error("Unable to initialize WebGL2");
    }
    return gl;
}
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
function getProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
function checkMaxVertexAttribs() {
    const gl = getGL2(document.createElement("canvas"));
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    alert(`max vertex attribs: ${maxVertexAttribs}`);
}
function hexToRgb(hex) {
    // Hex 코드에서 # 문자 제거
    hex = hex.replace(/^#/, '');
    // Hex 코드를 파싱하여 R, G, B 값을 추출
    const bigint = parseInt(hex, 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    // Alpha 값을 적용하여 RGBA 문자열 생성
    return { r, g, b };
}
function constVertexAttributeEx() {
    const gl = getGL2(document.querySelector("#constVertexAttribute"));
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = getProgram(gl, vertexShader, fragmentShader);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const vertexPos = [
        0, 0.5, 0,
        -0.5, -0.5, 0,
        0.5, -0.5, 0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos), gl.STATIC_DRAW);
    gl.clearColor(0, 0, 0, 1);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    console.log('color: ', color);
    const rgba = hexToRgb(color);
    gl.vertexAttrib4f(1, rgba.r, rgba.g, rgba.b, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
function main() {
    constVertexAttributeEx();
}
main();
