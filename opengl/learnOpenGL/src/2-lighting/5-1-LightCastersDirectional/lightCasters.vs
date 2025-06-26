#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

// Varyings for the fragment shader
out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoords;

// from local space to clip space. fragment shader will handle screen space
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    // doing lighting in world space 
    FragPos = vec3(model * vec4(aPos, 1.0));
    // normal matrix for when any non-uniform scales are made 
    Normal = mat3(transpose(inverse(model))) * aNormal;  
    // texture coordinates that will be sampled in the sampler 
    TexCoords = aTexCoords;
    
    gl_Position = projection * view * vec4(FragPos, 1.0);
}