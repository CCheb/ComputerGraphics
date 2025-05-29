#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;

out vec3 ourColor;

// Here we create a uniform that will offset the triangle to horizontally
// You could also pass it the value it needs in main by getting its location
// and passing the value to that reference
uniform float offset = 0.3;

void main()
{
    // Little bit of attribute swizzling
    gl_Position = vec4(aPos.x + offset, aPos.yz, 1.0);
    ourColor = aColor;
}