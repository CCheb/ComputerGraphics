#version 330 core
out vec4 FragColor;

in vec3 vColor;

void main()
{
	// linearly interpolate between both textures (80% container, 20% awesomeface)
	FragColor = vec4(vColor, 1.0);
}