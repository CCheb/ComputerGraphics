#version 330 core
out vec4 FragColor;

// the two varyings from the vertex shader
in vec3 Normal;  
in vec3 FragPos;  
in vec3 LightPos;
  
uniform vec3 lightPos;  // position of the light (dynamic)
uniform vec3 viewPos;   // position of the camera (dynamic)
uniform vec3 lightColor;    // static white color
uniform vec3 objectColor;   // coral color

void main()
{
    // ambient. the light given off of the environment
    // the strength should be really small so as to not keep the
    // scene be really bright and drowning the diffuse and specular
    float ambientStrength = 0.1;
    vec3 ambient = ambientStrength * lightColor;
  	
    // diffuse. Calculate how the object is lit depending on the direction of the light
    // Only the parts that are directly facing the light will be lit. This is calculated
    // by getting the angle between (dot product) the normal vector of the fragment and the
    // light direction vector hitting the fragment. The greater the angle the less lit the fragment
    // will be
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(lightPos - FragPos);
    float diff = max(dot(norm, lightDir), 0.0); // we dont want negative lighting if angle is 90
    vec3 diffuse = diff * lightColor;
    
    // specular. calculates the specular highlights of the object which depends on the position of the
    // view (camera) and the angle of reflection by the light. the angle between view direction and the reflection
    // vector measures the specularity that is produced.
    float specularStrength = 0.7;   // the shinines of the object (this measures the material)
    vec3 viewDir = normalize(viewPos - FragPos);    // camera position to the fragment
    vec3 reflectDir = reflect(-lightDir, norm);     // reverse light direction (frag to light now) and reflect with norm to get reflection dir
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);   // take dot product and take power. The higher the exponent the smaller the specular circle
    vec3 specular = specularStrength * spec * lightColor;  
        
    // finally add everything together and multiply with the object color which will produce the final light that is reflected!
    vec3 result = (ambient + diffuse + specular) * objectColor;
    FragColor = vec4(result, 1.0);
} 