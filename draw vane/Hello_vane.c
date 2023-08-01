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
//c언어 수학 라이브러리
#include <math.h>

typedef struct
{
   // Handle to a program object
   GLuint programObject;

} UserData;

///
// Create a shader object, load the shader source, and
// compile the shader.
// GLint    32    Signed, 2's complement binary integer    GL_INT
// GLuint    32bit    Unsigned binary integer
GLuint LoadShader ( GLenum type, const char *shaderSrc )
{
   GLuint shader;
   GLint compiled;

   // Create the shader object
   shader = glCreateShader ( type );

   if ( shader == 0 )
   {
      return 0;
   }

   // Load the shader source
   glShaderSource ( shader, 1, &shaderSrc, NULL );

   // Compile the shader
   glCompileShader ( shader );

   // Check the compile status
   glGetShaderiv ( shader, GL_COMPILE_STATUS, &compiled );

   if ( !compiled )
   {
      GLint infoLen = 0;

      glGetShaderiv ( shader, GL_INFO_LOG_LENGTH, &infoLen );

      if ( infoLen > 1 )
      {
         char *infoLog = malloc ( sizeof ( char ) * infoLen );

         glGetShaderInfoLog ( shader, infoLen, NULL, infoLog );
         esLogMessage ( "Error compiling shader:\n%s\n", infoLog );

         free ( infoLog );
      }

      glDeleteShader ( shader );
      return 0;
   }

   return shader;

}

///
// Initialize the shader and program object
/*char vShaderStr[] =
        "#version 300 es                                  \n"
        "layout(location = 0) in vec4 vPosition;          \n"
        "void main()                                      \n"
        "{                                                \n"
        "float aspectRatio = 59.0f / 41.0f;               \n" // 이부분을 쉐이더 밖에서 화면비를 구해 넣어주면 될 탠데
        "   mat4 aspectRatioMatrix = mat4(1.0);           \n" // 단위 행렬로 초기화
        "   aspectRatioMatrix[0][0] = aspectRatio;        \n" // X 축 스케일 조정
        "   gl_Position = aspectRatioMatrix * vPosition;   \n"
        "}*/


//
int Init ( ESContext *esContext )
{
   UserData *userData = esContext->userData;
   //vertex shader
    char vShaderStr[] =
    //open gl shading language version
    "#version 300 es                          \n"
    // location=0 의 뜻은 vertex attribut =0 을 뜻함
    "layout(location = 0) in vec4 vPosition;  \n"
    //여기서 attribute이라는 의미가 무엇인지 궁금??챕터1에서는 여러개가 들어갈 수 있어보이는데 어떤식으로 사용되는지 궁금하다!
    //"vPosition"이라는 입력 속성(Attribute)에 있는 데이터를 특별한 출력 변수인 "gl_Position"으로 복사한다는 의미임. 즉, 버텍스 셰이더(Vertex Shader)에서 입력으로 받은 정점의 위치 데이터를 "vPosition"으로부터 읽어와서 "gl_Position"이라는 특별한 출력 변수에 복사함. 모든 vertex shader의 속성들은 "반드시"gl_Position 변수로 나와야합니다. 그래야 다음 파이프라인에 사용가능합니다.
    "void main()                              \n"
      "{                                        \n"
    "float aspectRatio = 59.0f / 41.0f;               \n" //by 원규
    "   mat4 aspectRatioMatrix = mat4(1.0);           \n" // 단위 행렬로 초기화
    "   aspectRatioMatrix[0][0] = aspectRatio;        \n" // X 축 스케일 조정
    "   gl_Position = aspectRatioMatrix * vPosition;   \n"
      "}                                        \n";
    //fragment shader
   char fShaderStr[] =
    "#version 300 es                              \n"
    "precision mediump float;                     \n"
    "out vec4 fragColor;                          \n"
    "void main()                                  \n"
    "{                                            \n"
    "   fragColor = vec4 ( 1.0, 1.0, 0.0, 1.0 );  \n"
    "}                                            \n";
 

   GLuint vertexShader;
   GLuint fragmentShader;
   GLuint programObject;
   GLint linked;

   // Load the vertex/fragment shaders
   vertexShader = LoadShader ( GL_VERTEX_SHADER, vShaderStr );
   fragmentShader = LoadShader ( GL_FRAGMENT_SHADER, fShaderStr );

   // Create the program object
   programObject = glCreateProgram ( );

   if ( programObject == 0 )
   {
      return 0;
   }

   glAttachShader ( programObject, vertexShader );
   glAttachShader ( programObject, fragmentShader );

   // Link the program
   glLinkProgram ( programObject );

   // Check the link status
   glGetProgramiv ( programObject, GL_LINK_STATUS, &linked );

   if ( !linked )
   {
      GLint infoLen = 0;

      glGetProgramiv ( programObject, GL_INFO_LOG_LENGTH, &infoLen );

      if ( infoLen > 1 )
      {
         char *infoLog = malloc ( sizeof ( char ) * infoLen );

         glGetProgramInfoLog ( programObject, infoLen, NULL, infoLog );
         esLogMessage ( "Error linking program:\n%s\n", infoLog );

         free ( infoLog );
      }

      glDeleteProgram ( programObject );
      return FALSE;
   }

   // Store the program object
   userData->programObject = programObject;

   glClearColor ( 1.0f, 1.0f, 1.0f, 0.0f );
   return TRUE;
}

///
// Draw a triangle using the shader pair created in Init()
//
const float rotationAngle=60.0f;

void rotateVertex(float angle,GLfloat* vertex)
{
    angle = angle*M_PI/180.0f;//(각도를 라디안으로 변환)
    float cosA = cos(angle);
    float sinA = sin(angle);
    float x = vertex[0];
    float y = vertex[1];
    
    vertex[0] = x*cosA-y*sinA;
    vertex[1] = x*sinA+y*cosA;
    
}

void Draw ( ESContext *esContext )
{
   UserData *userData = esContext->userData;
   GLfloat vVertices[] = { 0.0f,  0.0f, 0.0f, // 왼쪽 상단
       -0.25f, -0.25f, 0.0f, // 왼쪽 하단
        0.5f, -0.5f, 0.0f, // 오른쪽 하단
        
                         };

   // Set the viewport
   glViewport ( 0, 0, esContext->width, esContext->height );

   // Clear the color buffer
   glClear ( GL_COLOR_BUFFER_BIT );

   // Use the program object
   glUseProgram ( userData->programObject );
    for (int j=0;j<6;j++)
    {
        for (int i = 0; i<3; i++)
        {
            
            int index = i*3;
            rotateVertex(rotationAngle, &vVertices[index]);
            glVertexAttribPointer ( 0, 3, GL_FLOAT, GL_FALSE, 0, vVertices );
            //glVertexAttribPointer ( 0, 3, GL_FLOAT, GL_FALSE, 0, vVertices );
            glEnableVertexAttribArray ( 0 );
            glDrawArrays ( GL_TRIANGLES, 0, 3 );

            
            
        }
    }

   // Load the vertex data
   //glVertexAttribPointer ( 0, 3, GL_FLOAT, GL_FALSE, 0, vVertices );
   //glVertexAttribPointer ( 0, 3, GL_FLOAT, GL_FALSE, 0, vVertices );
   //glEnableVertexAttribArray ( 0 );

   //glDrawArrays ( GL_TRIANGLES, 0, 3 );
   // glVertexAttribPointer ( 0, 3, GL_FLOAT, GL_FALSE, 0, vVertices1 );
}

void Shutdown ( ESContext *esContext )
{
   UserData *userData = esContext->userData;

   glDeleteProgram ( userData->programObject );
}

int esMain ( ESContext *esContext )
{
   esContext->userData = malloc ( sizeof ( UserData ) );

   esCreateWindow ( esContext, "Hello Triangle", 100, 1000, ES_WINDOW_RGB );

   if ( !Init ( esContext ) )
   {
      return GL_FALSE;
   }

   esRegisterShutdownFunc ( esContext, Shutdown );
   esRegisterDrawFunc ( esContext, Draw );

   return GL_TRUE;
}
