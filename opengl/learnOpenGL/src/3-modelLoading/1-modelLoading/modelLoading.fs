#version 330 core
out vec4 FragColor;

// Light properties 
struct Light {
    vec3 position;  
  
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
	
    float constant;
    float linear;
    float quadratic;
};

// varyings
in vec2 TexCoords;
in vec3 FragPos;
in vec3 Normal;

uniform vec3 viewPos;
uniform Light light;

// In this case we are only using one texture while discarding the rest (specular, normal, height, etc)
// The sampler points to a texture unit and that texture unit will point to the texture data via its ID
uniform sampler2D texture_diffuse1;
uniform sampler2D texture_specular2;
uniform float shininess;

void main()
{   
    // ambient
    // --------
    vec3 ambient = light.ambient * texture(texture_diffuse1, TexCoords).rgb;

    // diffuse
    // --------
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(light.position - FragPos);
    float diff = max(dot(norm, lightDir), 0.0); // angle between lightDir and normal vector
    // for texture we are sampling the diffuse mapping with the corresponding TexCoordinates
    vec3 diffuse = light.diffuse * diff * texture(texture_diffuse1, TexCoords).rgb;  
    
    // specular
    // ---------
    vec3 viewDir = normalize(viewPos - FragPos);
    // reflection: want the mirror reflection of the light bouncing off of the surface
    vec3 reflectDir = reflect(-lightDir, norm);  
    // calculate specular highlight
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = light.specular * spec * texture(texture_specular2, TexCoords).rgb;  
    
    // attenuation. allows us to light up objects within a certain distance
    float distance    = length(light.position - FragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    

    ambient *= attenuation;
    diffuse *= attenuation;
    specular *= attenuation;

    vec3 result = ambient + diffuse + specular;
    FragColor = vec4(result, 1.0);
}