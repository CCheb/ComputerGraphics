#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

// In this case we are only using one texture while discarding the rest (specular, normal, height, etc)
// The sampler points to a texture unit and that texture unit will point to the texture data via its ID
uniform sampler2D texture_diffuse1;

void main()
{    
    FragColor = texture(texture_diffuse1, TexCoords);
}