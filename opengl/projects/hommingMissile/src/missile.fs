#version 330 core
out vec4 FragColor;

in vec3 vColor;

void main()
{
    FragColor = vec4(vColor, 1.0); // set all 4 vector values to 1.0
}