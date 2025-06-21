#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;   // need texture coordinates to grab s and t coords

// varyings
out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoords;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    // performing lighting in world space so we need to pass in the fragment positions
    // in world space to the fragment shader
    FragPos = vec3(model * vec4(aPos, 1.0));
    Normal = mat3(transpose(inverse(model))) * aNormal;  // for when non-uniform scales occur
    TexCoords = aTexCoords; // pass the texture coordinates over to the fragment shader
    
    gl_Position = projection * view * vec4(FragPos, 1.0);
}