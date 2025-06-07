#pragma once

// Forward declaration only — no include needed
// header file only needs to know that the type exists
// we fill in the details in the cpp file instead
struct GLFWwindow;

class Pyramid
{
    public:
        Pyramid();
        ~Pyramid();
    
        // Update the rotation of the pyramid
        void update(unsigned int program, GLFWwindow *window);
        // render the pyramid
        void render();
    
    private:
        // objects VBO and VAO along with a rot array that stores
        // the current rotations of the pyramid;
        unsigned int VBO, VAO;
        float rot[3];
};