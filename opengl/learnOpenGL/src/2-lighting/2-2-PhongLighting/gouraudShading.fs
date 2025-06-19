// Fragment shader:
// ================
#version 330 core
out vec4 FragColor;

in vec3 LightingColor; 

uniform vec3 objectColor;

void main()
{
    // Now instead of performing lighting per fragment its now per vertex.
    FragColor = vec4(LightingColor * objectColor, 1.0);
}