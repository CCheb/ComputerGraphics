#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;

out vec3 FragPos;
out vec3 Normal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{   
    // Lighting is done here in world space so we need the fragment in world space
    // It would be a poor choice do the lighting in local space since the object will be moved, rotated, or scaled
    FragPos = vec3(model * vec4(aPos, 1.0));    
    Normal = mat3(transpose(inverse(model))) * aNormal;  // Used in the case of non-uniform scales
    
    gl_Position = projection * view * vec4(FragPos, 1.0);
}