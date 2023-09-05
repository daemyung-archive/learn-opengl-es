var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
function loadShader(url) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(xhr.responseText);
            }
            else {
                reject(new Error("Error loading shader: " + xhr.status));
            }
        };
        xhr.send();
    });
}
function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
function resizeCanvasToDisplaySize(canvas) {
    // 브라우저가 캔버스를 표시하고 있는 크기를 CSS 픽셀 단위로 얻어옵니다.
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    // 캔버스와 크기가 다른지 확인합니다.
    const needResize = canvas.width !== displayWidth ||
        canvas.height !== displayHeight;
    if (needResize) {
        // 캔버스를 동일한 크기가 되도록 합니다.
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
    return needResize;
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = document.querySelector("#c");
        let gl = canvas.getContext("webgl2");
        if (!gl) {
            throw new Error("Unable to initialize WebGL. Your browser or machine may not support it.");
        }
        let vertexShaderSource = yield loadShader("http://localhost:8080/vertex_shader.glsl");
        let fragmentShaderSource = yield loadShader("http://localhost:8080/fragment_shader.glsl");
        let vertexShader;
        let fragmentShader;
        try {
            vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        }
        catch (e) {
            console.log(e);
            return;
        }
        let program = createProgram(gl, vertexShader, fragmentShader);
        let positionAttributeLocation = gl.getAttribLocation(program, "a_Position");
        let positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        let positions = [
            0.0, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    });
}
main();
