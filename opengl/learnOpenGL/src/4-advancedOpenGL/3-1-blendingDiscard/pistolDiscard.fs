#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform vec2 uOffset;
uniform vec2 uScale;
uniform sampler2D texture1;

void main()
{   
    // each fragment now has an alpha component in which we can now treat texColor as a vec4
    //vec4 texColor = texture(texture1, TexCoords);
    // we want to only keep fragments that have an alpha component of 1.0 (opaque) while discarding
    // low alpha values (transparent)
    vec2 uv = TexCoords * uScale + uOffset; // Taking the supplied texture coordinates from the quad and shrinking and offseting them to only grab from the specified sprite
    vec4 texColor = texture(texture1, uv);

    // if the textcoord landed outside of the gun sprite itself then it must have an alpha that is less than 0.1 and because of this we discard it!
    if(texColor.a < 0.1)
        discard;

    // this will only run when the textcoord falls within the gun sprite and will be thus visible to the player camera.
    FragColor = texColor;
}