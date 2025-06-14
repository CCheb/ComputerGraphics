#version 330 core
out vec4 FragColor;

// Varying from vertex shader. Holds the particular vertex texture coordinates
in vec2 TexCoord;

// texture samplers
uniform sampler2D texture1;	// container
uniform sampler2D texture2;	// awesome face

void main()
{	// remember that this is ran for every vertex in comming from the attributes
	// linearly interpolate between both textures (80% container, 20% awesomeface)
	FragColor = mix(texture(texture1, TexCoord), texture(texture2, TexCoord), 0.2);
}