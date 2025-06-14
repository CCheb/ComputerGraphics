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
         // we are saying that this class does not support copying of any form
        Pyramid(const Pyramid&) = delete;
        Pyramid& operator=(const Pyramid&) = delete;

        // Move constructor and assignment
        // during reallocation of something like a vector, a new object is created and in this case 
        // it needs the VBO and VAO of the old object by moving not copying. 
        // if we only had a copy constructor, when the reallocation did happen, 
        // yeah the VBO and VAO were copied over to the new object but by destroying the old one, 
        // it also destroyed the new one
        Pyramid(Pyramid&& other) noexcept;
        Pyramid& operator=(Pyramid&& other) noexcept;

        // Update the rotation of the pyramid
        void update(unsigned int program, GLFWwindow *window);
        // render the pyramid
        void render() const;
    
    private:
        // objects VBO and VAO along with a rot array that stores
        // the current rotations of the pyramid;
        unsigned int VBO, VAO;
        float rot[3];
        float loc[3];
};