// Vertex shader:
// ================
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;

out vec3 LightingColor; // resulting color from lighting calculations

uniform vec3 lightPos;
uniform vec3 viewPos;
uniform vec3 lightColor;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    
    // gouraud shading
    // We esentially perform all lighting calculations in the vertex shader instead of the
    // fragment shader. What happens is that lighting is calculated on a per vertex basis instead
    // on a per fragment basis which produces a less realistic lighting model.
    // ------------------------
    vec3 Position = vec3(model * vec4(aPos, 1.0));
    vec3 Normal = mat3(transpose(inverse(model))) * aNormal;
    
    // ambient
    float ambientStrength = 0.1;
    vec3 ambient = ambientStrength * lightColor;
  	
    // diffuse 
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(lightPos - Position);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;
    
    // specular
    float specularStrength = 1.0; // this is set higher to better show the effect of Gouraud shading 
    vec3 viewDir = normalize(viewPos - Position);  // done in world space
    vec3 reflectDir = reflect(-lightDir, norm);  // Flip lightDir and reflect over the vertex normal
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64);   // angle between camera view on vertex and light reflection on vertex
    vec3 specular = specularStrength * spec * lightColor;      

    LightingColor = ambient + diffuse + specular; // this will be sent out to the fragment shader and multiplied with the object color.
 }