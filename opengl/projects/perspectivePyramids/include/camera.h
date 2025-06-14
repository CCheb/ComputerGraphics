#ifndef CAMERA_H
#define CAMERA_H

#include <glad/glad.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

// Defines several possible options for camera movement. Used as abstraction to stay away from window-system specific input methods
enum Camera_Movement {
    FORWARD,
    BACKWARD,
    LEFT,
    RIGHT,
    LROLL,
    RROLL
};

// Default camera values
const float YAW         = -90.0f;
const float PITCH       =  0.0f;
const float ROLL        =  0.0f;
const float SPEED       =  2.5f;
const float SENSITIVITY =  0.1f; // Needs to be quite low
const float ZOOM        =  45.0f;   // affects fov


// An abstract camera class that processes input and calculates the corresponding Euler Angles, Vectors and Matrices for use in OpenGL
class Camera
{
public:
    // camera Attributes
    glm::vec3 Position;
    glm::vec3 Front;
    glm::vec3 Up;
    glm::vec3 Right;
    glm::vec3 WorldUp;
    // euler Angles
    float Yaw;
    float Pitch;
    float Roll;
    // camera options
    float MovementSpeed;
    float MouseSensitivity;
    float Zoom;

    // constructor with vectors
    Camera(glm::vec3 position = glm::vec3(0.0f, 0.0f, 0.0f), glm::vec3 up = glm::vec3(0.0f, 1.0f, 0.0f), float yaw = YAW, float pitch = PITCH, float roll = ROLL) : Front(glm::vec3(0.0f, 0.0f, -1.0f)), MovementSpeed(SPEED), MouseSensitivity(SENSITIVITY), Zoom(ZOOM)
    {
        Position = position;
        WorldUp = up; // sets the WorldUp to the default up value which is just the up vector
        Yaw = yaw;
        Roll= roll;
        Pitch = pitch;
        updateCameraVectors();
    }
    // constructor with scalar values
    Camera(float posX, float posY, float posZ, float upX, float upY, float upZ, float yaw, float pitch, float roll) : Front(glm::vec3(0.0f, 0.0f, -1.0f)), MovementSpeed(SPEED), MouseSensitivity(SENSITIVITY), Zoom(ZOOM)
    {
        Position = glm::vec3(posX, posY, posZ);
        WorldUp = glm::vec3(upX, upY, upZ);
        Yaw = yaw;
        Pitch = pitch;
        Roll = roll;
        updateCameraVectors();
    }

    // returns the view matrix calculated using Euler Angles and the LookAt Matrix
    glm::mat4 GetViewMatrix()
    {
        // Roll would affect the cameras Up vector which then influences how the Right 
        // vector will be calculated. This thus gives us the rolling effect
        return glm::lookAt(Position, Position + Front, Up);
    }

    // processes input received from any keyboard-like input system. Accepts input parameter in the form of camera defined ENUM (to abstract it from windowing systems)
    void ProcessKeyboard(Camera_Movement direction, float deltaTime)
    {
        float velocity = MovementSpeed * deltaTime;
        // Movement
        if (direction == FORWARD)
            Position += Front * velocity;
        if (direction == BACKWARD)
            Position -= Front * velocity;
        if (direction == LEFT)
            Position -= Right * velocity;
        if (direction == RIGHT)
            Position += Right * velocity;
        // Rolling
        if (direction == LROLL)
            Roll -= velocity;
        if (direction == RROLL)
            Roll += velocity;
        
        updateCameraVectors();
    }

    // processes input received from a mouse input system. Expects the offset value in both the x and y direction.
    void ProcessMouseMovement(GLFWwindow* window,float xoffset, float yoffset, GLboolean constrainPitch = true)
    {
        // Without sensitivity, camera movement would be very fast
        xoffset *= MouseSensitivity;
        yoffset *= MouseSensitivity;

        // If left shift is pressed, only update the roll and not the Yaw
        if (glfwGetKey(window, GLFW_KEY_LEFT_SHIFT) == GLFW_PRESS)
            Roll += xoffset;
        else
            Yaw += xoffset;
        
        Pitch += yoffset;

        // make sure that when pitch is out of bounds, screen doesn't get flipped
        if (constrainPitch)
        {
            if (Pitch > 89.0f)
                Pitch = 89.0f;
            if (Pitch < -89.0f)
                Pitch = -89.0f;
        }

        // update Front, Right and Up Vectors using the updated Euler angles
        updateCameraVectors();
    }

    // processes input received from a mouse scroll-wheel event. Only requires input on the vertical wheel-axis
    void ProcessMouseScroll(float yoffset)
    {
        Zoom -= (float)yoffset;
        if (Zoom < 1.0f)
            Zoom = 1.0f;
        if (Zoom > 45.0f)
            Zoom = 45.0f;
    }

private:
    // calculates the front vector from the Camera's (updated) Euler Angles
    void updateCameraVectors()
    {
        // Step 1: calculate the new Front vector
        glm::vec3 front;
        front.x = cos(glm::radians(Yaw)) * cos(glm::radians(Pitch));
        front.y = sin(glm::radians(Pitch));
        front.z = sin(glm::radians(Yaw)) * cos(glm::radians(Pitch));
        Front = glm::normalize(front);
        // Step 2: Calculate base Right and Up from Front and WorldUp
        glm::vec3 right = glm::normalize(glm::cross(Front, WorldUp));
        glm::vec3 up = glm::normalize(glm::cross(right, Front));

        // Step 3: Apply roll rotation around Front vector (if any)
        if (Roll != 0.0f)
        {
            glm::mat4 rollRotation = glm::rotate(glm::mat4(1.0f), glm::radians(Roll), Front);
            Right = glm::normalize(glm::vec3(rollRotation * glm::vec4(right, 0.0)));
            Up    = glm::normalize(glm::vec3(rollRotation * glm::vec4(up, 0.0)));
        }
        else
        {
            // if no roll was made then update regularly
            Right = right;
            Up = up;
        }
    }
};
#endif
