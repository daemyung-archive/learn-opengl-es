// The MIT License (MIT)
//
// Copyright (c) 2013 Dan Ginsburg, Budirijanto Purnomo
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

//
// Book:      OpenGL(R) ES 3.0 Programming Guide, 2nd Edition
// Authors:   Dan Ginsburg, Budirijanto Purnomo, Dave Shreiner, Aaftab Munshi
// ISBN-10:   0-321-93388-5
// ISBN-13:   978-0-321-93388-1
// Publisher: Addison-Wesley Professional
// URLs:      http://www.opengles-book.com
//            http://my.safaribooksonline.com/book/animation-and-3d/9780133440133
//
// Hello_Triangle.c
//
//    This is a simple example that draws a single triangle with
//    a minimal vertex/fragment shader.  The purpose of this
//    example is to demonstrate the basic concepts of
//    OpenGL ES 3.0 rendering.
#include "esUtil.h"

typedef struct {
  // Handle to a program object
  GLuint programObject;

} UserData;
///
// Create a shader object, load the shader source, and
// compile the shader.
//
GLuint LoadShader(GLenum type, const char *shaderSrc) {
  GLuint shader;
  GLint compiled;

  // Create the shader object
  // 쉐이더 생성
  shader = glCreateShader(type);

  if (shader == 0) {
    return 0;
  }

  // Load the shader source
  // 쉐이더 생성후 쉐이더에 소스코드 제공
  // void glShaderSource(GLuint shader, GLsizei count, const GLchr*, const GLint
  // *length,)
  /*
   shader: 소스를 추가할 쉐이더의 identifier
   count: 소스 문자열 배열의 length. 여러개의 string source를 제공할 수
   있지만,main entrypoint는 오직 하나여야 한다. string: C에는 문자열이라는
   타입이 없기 때문에, 이를 const char* 로 표현한다. 우리는 문자열의 배열을
   전달해줄 꺼기 때문에, (const char* = String) const * 가 되는것. length: 각
   문자열의 길이를 담고있는 배열
   */
  glShaderSource(shader, 1, &shaderSrc, NULL);

  // Compile the shader
  // 쉐이더에 소스를 특정해 준 뒤에 컴파일 진행
  glCompileShader(shader);

  // Check the compile status
  // 컴파일 성공했는지 실패했는지 체크
  glGetShaderiv(shader, GL_COMPILE_STATUS, &compiled);

  if (!compiled) {
    GLint infoLen = 0;

    glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &infoLen);

    if (infoLen > 1) {
      char *infoLog = malloc(sizeof(char) * infoLen);
      // 에러가 났다면 로그확인
      glGetShaderInfoLog(shader, infoLen, NULL, infoLog);
      esLogMessage("Error compiling shader:\n%s\n", infoLog);

      free(infoLog);
    }

    // 쉐이더 제거
    glDeleteShader(shader);
    return 0;
  }

  return shader;
}

///
// Initialize the shader and program object
//
int Init(const ESContext *esContext) {
  UserData *userData = esContext->userData;
  const char vShaderStr[] =
      "#version 300 es                          \n"
      "layout(location = 0) in vec4 vPosition;  \n"
      "void main()                              \n"
      "{                                        \n"
      "   gl_Position = vPosition;              \n"
      "}                                        \n";
  const char fShaderStr[] =
      "#version 300 es                              \n"
      "precision mediump float;                     \n"
      "out vec4 fragColor;                          \n"
      "void main()                                  \n"
      "{                                            \n"
      "fragColor=vec4(1.0, 1.0, 1.0, 1.0);          \n"
      "}                                            \n";

  GLuint vertexShader;
  GLuint fragmentShader;
  GLuint programObject;
  GLint linked;

  // Load the vertex/fragment shaders
  vertexShader = LoadShader(GL_VERTEX_SHADER, vShaderStr);
  fragmentShader = LoadShader(GL_FRAGMENT_SHADER, fShaderStr);

  // Create the program object
  // program object 생성
  programObject = glCreateProgram();

  if (programObject == 0) {
    return 0;
  }
  // 쉐이더에 프로그램 부착시키기
  glAttachShader(programObject, vertexShader);
  glAttachShader(programObject, fragmentShader);

  // Link the program
  // 쉐이더에 프로그램 링크
  glLinkProgram(programObject);

  // Check the link status
  // 성공적인지 체크
  glGetProgramiv(programObject, GL_LINK_STATUS, &linked);

  if (!linked) {
    GLint infoLen = 0;

    glGetProgramiv(programObject, GL_INFO_LOG_LENGTH, &infoLen);

    if (infoLen > 1) {
      char *infoLog = malloc(sizeof(char) * infoLen);

      glGetProgramInfoLog(programObject, infoLen, NULL, infoLog);
      esLogMessage("Error linking program:\n%s\n", infoLog);

      free(infoLog);
    }
    // program 삭제
    glDeleteProgram(programObject);
    return FALSE;
  }

  // Store the program object
  userData->programObject = programObject;
  // 배경 검은색으로 지우기
  glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
  return TRUE;
}

/// 정사면체 그리기

void Draw(ESContext *esContext) {
  UserData *userData = esContext->userData;
  GLfloat vVertices[] = {
      0.0f / 6.0f,  0.0f / 6.0f,       3.464101f / 6.0f,
      0.0f / 6.0f,  3.464101f / 6.0f,  -1.732050f / 6.0f,
      -3.0f / 6.0f, -1.732050f / 6.0f, -1.732050f / 6.0f,
      3.0f / 6.0f,  -1.732050f / 6.0f, -1.732050f / 6.0f,

  };

  GLushort index[] = {0, 1, 2, 0, 2, 3, 0,
                      3, 1, 1, 3, 2

  };

  // Set the viewport
  // 컴퓨터나 휴대 단말기 등 장치에 display 요소가 표현되는 영역
  glViewport(0, 0, esContext->width, esContext->height);

  // Clear the color buffer
  glClear(GL_COLOR_BUFFER_BIT);

  // Use the program object
  // 프로그램 활성화
  glUseProgram(userData->programObject);

  // Load the vertex data

  glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, vVertices);

  glEnableVertexAttribArray(0);

  
  // 정점들을 선으로 연결
  glDrawElements(GL_LINE_STRIP, 12, GL_UNSIGNED_SHORT, index);
};

void Shutdown(ESContext *esContext) {
  UserData *userData = esContext->userData;

  glDeleteProgram(userData->programObject);
}

int esMain(ESContext *esContext) {
  esContext->userData = malloc(sizeof(UserData));

  esCreateWindow(esContext, "Hello tetrahedron", 320, 240, ES_WINDOW_RGB);

  if (!Init(esContext)) {
    return GL_FALSE;
  }

  esRegisterShutdownFunc(esContext, Shutdown);
  esRegisterDrawFunc(esContext, Draw);

  return GL_TRUE;
}
