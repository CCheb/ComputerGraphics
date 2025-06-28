#version 330 core
out vec4 FragColor;

// Material struct that holds diffuse and specular maps that will
// act as the fragments object color
struct Material {
    vec3 diffuse;
    vec3 specular;
    vec3 ambient;
    float shininess;
}; 

// Spot light struct
struct SpotLight {
    vec3 position;
    vec3 direction;
    float cutOff;   // phi (inner cone)
    float outerCutOff;  // gamma (outer cone)
  
    // attenuation
    float constant;
    float linear;
    float quadratic;
  
    // intensity
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;       
};

// varyings from the vertex shader
in vec3 FragPos;
in vec3 Normal;

//#define NR_SPOTLIGHTS 2

uniform vec3 viewPos;
// initiallize all structs and specify each of their attributes in the application
//uniform SpotLight spotLights[NR_SPOTLIGHTS];
uniform SpotLight spotLight;
uniform Material material;

// function prototype. 
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir);

void main()
{    
    // properties
    vec3 norm = normalize(Normal);
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 result;
    
    result = CalcSpotLight(spotLight, norm, FragPos, viewDir);
    // phase 3: spot light
   // for(int i = 0; i < NR_SPOTLIGHTS; i++)
        //result += CalcSpotLight(spotLights[i], norm, FragPos, viewDir);    
    
    FragColor = vec4(result, 1.0);
}

// calculates the color when using a spot light.
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize(light.position - fragPos);
    // diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);
    // specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    // attenuation
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    
    // spotlight intensity was negative
    float theta = dot(lightDir, normalize(-light.direction)); 
    float epsilon = light.cutOff - light.outerCutOff;
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);
    // combine results
    vec3 ambient = light.ambient * material.ambient;
    vec3 diffuse = light.diffuse * diff * material.diffuse;
    vec3 specular = light.specular * spec * material.specular;
    //ambient *= attenuation * intensity;
    diffuse *= attenuation * intensity;
    specular *= attenuation * intensity;
    return (ambient + diffuse + specular);
}