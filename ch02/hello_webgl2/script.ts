function createShader(gl: WebGLRenderingContext, type: GLenum, source: string): WebGLShader | null {
    let shader: WebGLShader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function loadShader(url: string): Promise<string> {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(xhr.responseText);
            } else {
                reject(new Error("Error loading shader: " + xhr.status));
            }
        };
        xhr.send();
    });
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
    let program: WebGLProgram = gl.createProgram();
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
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // 캔버스와 크기가 다른지 확인합니다.
    const needResize = canvas.width  !== displayWidth ||
        canvas.height !== displayHeight;

    if (needResize) {
        // 캔버스를 동일한 크기가 되도록 합니다.
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }

    return needResize;
}


async function main() {
    let canvas: HTMLCanvasElement = document.querySelector<HTMLCanvasElement>("#c");
    let gl: WebGLRenderingContext = canvas.getContext("webgl2");

    if (!gl) {
        throw new Error("Unable to initialize WebGL. Your browser or machine may not support it.");
    }

    let vertexShaderSource = await loadShader("http://localhost:8080/vertex_shader.glsl");
    let fragmentShaderSource = await loadShader("http://localhost:8080/fragment_shader.glsl");

    let vertexShader: WebGLShader | null
    let fragmentShader: WebGLShader | null
    try {
        vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
         fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    } catch (e) {
        console.log(e);
        return;
    }


    const program: WebGLProgram | null = createProgram(gl, vertexShader, fragmentShader);
    const positionAttributeLocation: number = gl.getAttribLocation(program, "a_Position");
    const positionBuffer: WebGLBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions: number[] = [
        0.0,  0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0
        ];
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false,0,0);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

main();