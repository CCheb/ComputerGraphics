#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D texture1;

void main()
{   
    // each fragment now has an alpha component in which we can now treat texColor as a vec4
    vec4 texColor = texture(texture1, TexCoords);
    // we want to only keep fragments that have an alpha component of 1.0 (opaque) while discarding
    // low alpha values (transparent)
    if(texColor.a < 0.1)
        discard;

    FragColor = texColor;
}