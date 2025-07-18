#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aTexCoords;   // texture coords attribute 

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

// texture coords varying
out vec2 TexCoords;

void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    TexCoords = aTexCoords;
}