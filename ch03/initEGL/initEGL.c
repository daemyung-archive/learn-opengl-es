//
// Created by 신원규 on 2023/08/30.
//
#include <EGL/egl.h>
#include <GLFW/glfw3.h>
#include <stdio.h>

int main() {
  // GLFW 초기화
  if (!glfwInit()) {
    fprintf(stderr, "GLFW 초기화 실패\n");
    return -1;
  }

  // GLFW 윈도우 생성
  GLFWwindow *window = glfwCreateWindow(800, 600, "OpenGL Window", NULL, NULL);
  if (!window) {
    fprintf(stderr, "GLFW 윈도우 생성 실패\n");
    glfwTerminate();
    return -1;
  }

  // GLFW 윈도우 컨텍스트 활성화
  glfwMakeContextCurrent(window);

  // EGL 디스플레이 초기화
  EGLDisplay display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
  eglInitialize(display, NULL, NULL);

  // EGL 구성 선택
  EGLConfig config;
  EGLint configAttribs[] = {EGL_RED_SIZE,  8, EGL_GREEN_SIZE, 8,
                            EGL_BLUE_SIZE, 8, EGL_NONE};
  eglChooseConfig(display, configAttribs, &config, 1, NULL);

  // 윈도우 서피스 생성
  EGLSurface surface = eglCreateWindowSurface(
      display, config, (EGLNativeWindowType)window, NULL);

  // EGL 컨텍스트 생성 및 연결
  EGLint contextAttribs[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};
  EGLContext context =
      eglCreateContext(display, config, EGL_NO_CONTEXT, contextAttribs);
  eglMakeCurrent(display, surface, surface, context);

  // 이벤트 루프 시작
  while (!glfwWindowShouldClose(window)) {
    // OpenGL 렌더링 코드 작성

    glfwSwapBuffers(window);
    glfwPollEvents();
  }

  // EGL 정리
  eglDestroySurface(display, surface);
  eglDestroyContext(display, context);
  eglTerminate(display);

  // GLFW 정리
  glfwDestroyWindow(window);
  glfwTerminate();

  return 0;
}
