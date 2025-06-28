#pragma once

#include <glad/glad.h>
#include <GLFW/glfw3.h>

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include <shader/shader_m.h>


class Spotlight
{
    public:
        // movement
        glm::vec3 position;
        glm::vec3 direction;
        float rotDirection;
        // Intensities/colors
        glm::vec3 ambient;
        glm::vec3 diffuse;
        glm::vec3 specular;
        // attenuation
        float constant, linear, quadratic;
        // inner and outer cones
        float innerCutoff, outerCutoff;

        Spotlight(glm::vec3& pos, glm::vec3& dir, glm::vec3& color, bool rotDir, Shader& lightingShader)
        : ambient(glm::vec3(1.0f)), specular(glm::vec3(1.0f)), constant(1.0f), linear(0.09f), quadratic(0.032f),
        innerCutoff(glm::cos(glm::radians(20.5f))), outerCutoff(glm::cos(glm::radians(27.0f)))
        {
            position = pos;
            direction = dir;
            rotDirection = rotDir;
            diffuse = color;

            setSpotlight(lightingShader);
        }

        void move(Shader& lightingShader)
        {
            float radius = 10.0f;

            float rotDir = rotDirection ? 1.0f : -1.0f;
            float time = glfwGetTime();
            // -10.0 -15.0
            position.x = radius * cos(rotDir * time);
            position.z = radius * sin(rotDir * time);


            glm::vec3 front = glm::normalize(glm::vec3(0.0f) - position);
            direction = front;

            setSpotlight(lightingShader);
        }

    private:

        void setSpotlight(Shader& lightingShader)
        {
            lightingShader.setVec3("spotLight.position", position);
            lightingShader.setVec3("spotLight.direction", direction);
            lightingShader.setVec3("spotLight.ambient", ambient);
            lightingShader.setVec3("spotLight.diffuse", diffuse);
            lightingShader.setVec3("spotLight.specular", specular);
            lightingShader.setFloat("spotLight.constant", constant);
            lightingShader.setFloat("spotLight.linear", linear);
            lightingShader.setFloat("spotLight.quadratic", quadratic);
            lightingShader.setFloat("spotLight.cutOff", innerCutoff);
            lightingShader.setFloat("spotLight.outerCutOff", outerCutoff);     
        }

};