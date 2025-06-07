#version 330 core
out vec4 FragColor;

in vec3 ourColor;
in vec2 TexCoord;

// texture sampler. This is what hold the texture itself
uniform sampler2D texture1;

void main()
{
	// Basically pairing the texture coordinated specified by the triangle 
	// and passing them over to the texture itself so that the fragment shader can 
	// interpolate the texture
	FragColor = texture(texture1, TexCoord) * vec4(ourColor, 1.0);
}