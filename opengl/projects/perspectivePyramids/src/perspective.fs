#version 330 core
out vec4 FragColor;

in vec3 vColor;

void main()
{
	// setting the color for the vertex
	FragColor = vec4(vColor, 1.0);
}