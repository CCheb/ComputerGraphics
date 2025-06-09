#pragma once

// Forward declaration only — no include needed
// header file only needs to know that the type exists
// we fill in the details in the cpp file instead
struct GLFWwindow;

class Pyramid
{
    public:
        Pyramid(float x, float y, float z);
        ~Pyramid();
    
         // Deleted copy constructor and assignment (no copying)
         // VBOs and VAOs cannot be shallow copied. Each pyramid
         // object is entitled with their own VBO and VAO
        Pyramid(const Pyramid&) = delete;
        Pyramid& operator=(const Pyramid&) = delete;

        // Move constructor and assignment
        Pyramid(Pyramid&& other) noexcept;
        Pyramid& operator=(Pyramid&& other) noexcept;

        // Update the rotation of the pyramid
        void update(unsigned int program, GLFWwindow *window);
        // render the pyramid
        void render();
    
    private:
        // objects VBO and VAO along with a rot array that stores
        // the current rotations of the pyramid;
        unsigned int VBO, VAO;
        float rot[3];
        float loc[3];
};