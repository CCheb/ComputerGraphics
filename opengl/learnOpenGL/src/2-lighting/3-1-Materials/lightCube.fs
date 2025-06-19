#version 330 core
out vec4 FragColor;

uniform vec3 lightColor;

void main()
{
    // vec4(1.0)
    FragColor = vec4(lightColor, 1.0); // having the physical light cube change lights as well
}