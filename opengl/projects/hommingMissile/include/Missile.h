#pragma once

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include <shader/shader_m.h>

struct GLFWwindow;

class Missile
{
    public:

        Missile(glm::vec3 front, glm::vec3 position, float yaw, float pitch, float speed);
        ~Missile();

        // Deleting both copy constructor and assignment operator to prevent
        // any copying of object contents. Need movement to be enforced not copying
        Missile(const Missile&) = delete;
        Missile& operator=(const Missile&) = delete;

        // Move constructor and new assignment operator that enforces movement
        Missile(Missile&& other) noexcept;
        Missile& operator=(Missile&& other) noexcept;

        // update function
        void update(GLFWwindow* window, Shader& vShader, float deltaTime);
        // render function
        void render();

    private:

        void processInput(GLFWwindow* window);

        glm::vec3 position;
        glm::vec3 front;
        glm::vec3 right;
        glm::vec3 up;
        glm::vec3 worldUp;
        
        float pitch;
        float yaw;
        float speed;

        unsigned int VBO, VAO;
};
