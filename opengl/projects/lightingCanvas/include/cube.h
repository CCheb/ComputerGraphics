#pragma once

// Forward declaration only — no include needed
// header file only needs to know that the type exists
// we fill in the details in the cpp file instead
struct GLFWwindow;

class Cube
{
    public:
        Cube(float locX, float locY, float locZ, float rotSpeed);
        ~Cube();
    
         // Deleted copy constructor and assignment (no copying)
         // VBOs and VAOs cannot be shallow copied. Each Cube
         // object is entitled with their own VBO and VAO
         // we are saying that this class does not support copying of any form
        Cube(const Cube&) = delete;
        Cube& operator=(const Cube&) = delete;

        // Move constructor and assignment
        // during reallocation of something like a vector, a new object is created and in this case 
        // it needs the VBO and VAO of the old object by moving not copying. 
        // if we only had a copy constructor, when the reallocation did happen, 
        // yeah the VBO and VAO were copied over to the new object but by destroying the old one, 
        // it also destroyed the new one
        Cube(Cube&& other) noexcept;
        Cube& operator=(Cube&& other) noexcept;

        // Update the rotation of the Cube
        void update(unsigned int program, GLFWwindow *window, float deltaTime);
        // render the Cube
        void render() const;
    
    private:
        // objects VBO and VAO along with a rot array that stores
        // the current rotations of the Cube;
        unsigned int VBO, VAO;
        float rot[3];
        float loc[3];
        float rotSpeed;
};