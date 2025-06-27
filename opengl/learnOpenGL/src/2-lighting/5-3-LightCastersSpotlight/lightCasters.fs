#version 330 core
out vec4 FragColor;

// Material struct that includes the diffuse and specular mappings 
struct Material {
    sampler2D diffuse;
    sampler2D specular;    
    float shininess;    // specular highlight size
}; 

// Light struct
struct Light {
    // position is the camera position
    vec3 position;  
    // diretion is the spotdir / camera direction
    vec3 direction;
    // Inner cone phi
    float cutOff;
    // Outer cone gamma
    float outerCutOff;
  
    // Light color/intensity
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
	
    // Attenuation for the light
    float constant;
    float linear;
    float quadratic;
};

// varyings from the vertex shader
in vec3 FragPos;  
in vec3 Normal;  
in vec2 TexCoords;
  
uniform vec3 viewPos;
uniform Material material;
uniform Light light;

void main()
{
    // ambient
    // Light color/intensity * object color
    vec3 ambient = light.ambient * texture(material.diffuse, TexCoords).rgb;
    
    // diffuse 
    vec3 norm = normalize(Normal);
    // unit vector from fragment to light position which follows the camera
    vec3 lightDir = normalize(light.position - FragPos);
    float diff = max(dot(norm, lightDir), 0.0); // Cosine of the angle between the light direction and normal of the fragment
    vec3 diffuse = light.diffuse * diff * texture(material.diffuse, TexCoords).rgb;  
    
    // specular
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);  
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * spec * texture(material.specular, TexCoords).rgb;  
    
    // spotlight (soft edges)
    // theta defines the angle between the spotlight direction (front) and the light direction (difference between light position and fragment pos)
    // theta needs to be a higher cos value so that in turn produces a smaller angle that fits within phi and gamma
    // a higher cos value (towards 1.0) produces a smaller angle!
    float theta = dot(lightDir, normalize(-light.direction)); 
    // epsilon is the difference between the inner and outer cone radiouses. This will help in creating a smooth interpolation of light intensity between 
    // the inner and outer cones. 
    float epsilon = (light.cutOff - light.outerCutOff);
    // Idea is that if fragment is within inner cone then intensity will be 1.0. If inbetween the inner and outer cones then it will vary between 0.0 
    // (more towards the outer cone) and 1.0 (more towards the inner cone)
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);
    // From here we multiply the light intensity with the diffuse and  specular components thus creating a flashlight effect
    // We dont alter the ambient since we dont want fragments outside the cones to be completely dark
    diffuse  *= intensity;
    specular *= intensity;
    //ambient *= intensity;
    
    // attenuation
    float distance    = length(light.position - FragPos);   // distance between fragment and light position (more like the distance formula)
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance)); 
    // multiply the attenuation value with all three since we dont want one component to be unaffected and look like its being shinned from
    // far away   
    ambient  *= attenuation; 
    diffuse   *= attenuation;
    specular *= attenuation;   
        
    // finally just add all components and set the color of the fragment
    vec3 result = ambient + diffuse + specular;
    FragColor = vec4(result, 1.0);
} 