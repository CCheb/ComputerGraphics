#version 330 core
layout (location = 0) in vec3 aPos; // dont need normals nor texture coordinates for light cube

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    // Basic perspective transformations
    gl_Position = projection * view * model * vec4(aPos, 1.0);
}