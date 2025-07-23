#version 330 core
out vec4 FragColor;

uniform vec3 lightColor;

void main()
{
    // uncomment for solid color
    // FragColor = vec4(0.04, 0.28, 0.26, 1.0);
    FragColor = vec4(lightColor,1.0);
}