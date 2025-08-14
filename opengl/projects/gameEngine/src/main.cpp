#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <stb_image.h>

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>


#include <shader/shader_m.h>
#include <camera.h>
#include <engine.h>

#include <iostream>
#include <vector>
#include <memory>

void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void mouse_callback(GLFWwindow* window, double xpos, double ypos);
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset);
void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods);
void processInput(GLFWwindow *window);

// settings
unsigned int SCR_WIDTH = 800;
unsigned int SCR_HEIGHT = 600;

// camera

//Camera camera(glm::vec3(0.0f, 0.0f, 3.0f), 45.0f);
float lastX = (float)SCR_WIDTH / 2.0;
float lastY = (float)SCR_HEIGHT / 2.0;
bool firstMouse = true;


Player player(glm::vec3(0.0f, 0.0f, 3.0f), 45.0f);

// timing
float deltaTime = 0.0f;
float lastFrame = 0.0f;


int main()
{
    // glfw: initialize and configure context
    // ------------------------------
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

#ifdef __APPLE__
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif

    // glfw window creation
    // --------------------
    GLFWwindow* window = glfwCreateWindow(SCR_WIDTH, SCR_HEIGHT, "Game Engine", NULL, NULL);
    if (window == NULL)
    {
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
    glfwSetCursorPosCallback(window, mouse_callback);
    glfwSetScrollCallback(window, scroll_callback);
    glfwSetKeyCallback(window, key_callback);

    // tell GLFW to capture our mouse
    glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);

    // glad: load all OpenGL function pointers
    // ---------------------------------------
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
    {
        std::cout << "Failed to initialize GLAD" << std::endl;
        return -1;
    }

    // configure global opengl state
    // -----------------------------
    glEnable(GL_DEPTH_TEST);

    // After properly setting up context we then assign a shader program to world.
    GameObject::world = new Shader("../src/worldShader.vs", "../src/worldShader.fs");

    // creating a vector of gameobjects. In this case we have base pointers that point to
    // child objects via polymorphism. Ex: GameObject* base = Cube(...);
    // Main caveat is that base pointer is only able to access virtual functions that the child overrode

    // A unique ptr is a smart pointer that 'owns' to what ever resource it points to. Once it goes out of scope
    // the memory is automatically freed
    std::vector<std::unique_ptr<GameObject>> gameObjects;
    // push back a unique pointer to the vector of that points to a cube object
    // make_unique creates a raw pointer to the specified type and then wraps it around a unique ptr/
    gameObjects.push_back(std::make_unique<Cube>(glm::vec3(0.0f, 0.0f, 0.0f), 0.0f));   // Cube
    gameObjects.push_back(std::make_unique<Cube>(glm::vec3(2.0f, 0.0f, 0.0f), 0.0f));


    

    // render loop
    // -----------
    while (!glfwWindowShouldClose(window))
    {
        // per-frame time logic
        // --------------------
        float currentFrame = static_cast<float>(glfwGetTime());
        deltaTime = currentFrame - lastFrame;
        lastFrame = currentFrame;

        // keyboard input
        // -----
        processInput(window);

        // render
        // ------
        glClearColor(0.2f, 0.2f, 0.2f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);


        /*
        // camera stuff
        GameObject::world->use();
        glm::mat4 projection = glm::perspective(glm::radians(camera.Zoom), (float)SCR_WIDTH / (float)SCR_HEIGHT, 0.1f, 100.0f);
        glm::mat4 view = camera.GetViewMatrix();
        glm::mat4 model = glm::mat4(1.0f);
        GameObject::world->setMat4("projection", projection);
        GameObject::world->setMat4("view", view);   
        */

        // updating camera
        player.update();


        // update and render loop. we make sure to update objects before we draw them
        for(auto& object : gameObjects)
        {
            object->update();
            object->draw();
        }
        
        // glfw: swap buffers and poll IO events (keys pressed/released, mouse moved etc.)
        // -------------------------------------------------------------------------------
        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    // clean ups 
    Cube::cleanUp();    // cleans up the cubes shared resources (VAO, VBO since these are static)
    GameObject::cleanShaders(); // makes sure to handle shader pointer and free it properly

    glfwTerminate();
    return 0;
}

// process all input: query GLFW whether relevant keys are pressed/released this frame and react accordingly
// ---------------------------------------------------------------------------------------------------------
void processInput(GLFWwindow *window)
{
    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);

    if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
    {
        player.camera.ProcessKeyboard(FORWARD, deltaTime);
        
    }
    if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
    {

        player.camera.ProcessKeyboard(BACKWARD, deltaTime);
        
    }
    if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
    {

        player.camera.ProcessKeyboard(LEFT, deltaTime);
       
    }
    if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
    {

        player.camera.ProcessKeyboard(RIGHT, deltaTime);
       
    }

    if(glfwGetKey(window, GLFW_KEY_LEFT_SHIFT) == GLFW_PRESS)
    {
        player.camera.MovementSpeed = 5.0f;
    }
    else
    {
        player.camera.MovementSpeed = 2.5f;
    }
}

// glfw: whenever the window size changed (by OS or user resize) this callback function executes
// ---------------------------------------------------------------------------------------------
void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
    // make sure the viewport matches the new window dimensions; note that width and 
    // height will be significantly larger than specified on retina displays.
    glViewport(0, 0, width, height);
    // Fullscreening functionality
    player.scr_width = width;
    player.scr_height = height;
}

// glfw: whenever the mouse moves, this callback is called
// -------------------------------------------------------
void mouse_callback(GLFWwindow* window, double xposIn, double yposIn)
{
    float xpos = static_cast<float>(xposIn);
    float ypos = static_cast<float>(yposIn);
    if (firstMouse)
    {
        lastX = xpos;
        lastY = ypos;
        firstMouse = false;
    }

    float xoffset = xpos - lastX;
    float yoffset = lastY - ypos; // reversed since y-coordinates go from bottom to top

    lastX = xpos;
    lastY = ypos;

    player.camera.ProcessMouseMovement(xoffset, yoffset);
}

// glfw: whenever the mouse scroll wheel scrolls, this callback is called
// ----------------------------------------------------------------------
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset)
{
    player.camera.ProcessMouseScroll(static_cast<float>(yoffset));
}

void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods)
{
    // notify when the pistol was fired when pressing space
    if(key == GLFW_KEY_SPACE && action == GLFW_PRESS)
    {
        std::cout << "Space pressed!" << std::endl;
    }
    
}

