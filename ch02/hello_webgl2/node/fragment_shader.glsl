#version 300 es

precision mediump float;

out vec4 FragColor;

void main() {
    // gl_FragColor는 프래그먼트 셰이더가 설정을 담당하는 특수 변수
    FragColor = vec4(1.0f, 0.0f, 0.0f, 1.0f);
}
