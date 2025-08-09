#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <stb_image.h>

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>


#include <shader/shader_m.h>
#include <camera.h>
#include <model.h>

#include <iostream>
#include <cmath>

void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void mouse_callback(GLFWwindow* window, double xpos, double ypos);
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset);
void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods);
void processInput(GLFWwindow *window);
unsigned int loadTexture(const char *path);

// settings
unsigned int SCR_WIDTH = 800;
unsigned int SCR_HEIGHT = 600;

// camera
Camera camera(glm::vec3(0.0f, 0.0f, 3.0f));
float lastX = (float)SCR_WIDTH / 2.0;
float lastY = (float)SCR_HEIGHT / 2.0;
bool firstMouse = true;

// timing
float deltaTime = 0.0f;
float lastFrame = 0.0f;

// weapon bobbing
float bobX = 0.0f;
float bobY = 0.0f;
float bobSpeedX = 2.0f;
float bobSpeedY = 4.0f;

// pistol consts
const int TEXT_WIDTH = 512;
const int TEXT_HEIGHT = 128;
const int FRAME_WIDTH = 110;
const int FRAME_HEIGHT = 120;


bool isFiring = false;
float fireTimer = 0.0f;
float frameDuration = 0.1f;
int indexFrame = 0;

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
    GLFWwindow* window = glfwCreateWindow(SCR_WIDTH, SCR_HEIGHT, "Blending Discard", NULL, NULL);
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

     // build and compile shaders
    // -------------------------
    Shader shader("blendingDiscard.vs", "blendingDiscard.fs");
    Shader pistolShader("pistolDiscard.vs", "pistolDiscard.fs");

    // set up vertex data (and buffer(s)) and configure vertex attributes
    // ------------------------------------------------------------------
    float cubeVertices[] = {
        // positions          // texture Coords
        -0.5f, -0.5f, -0.5f,  0.0f, 0.0f,
         0.5f, -0.5f, -0.5f,  1.0f, 0.0f,
         0.5f,  0.5f, -0.5f,  1.0f, 1.0f,
         0.5f,  0.5f, -0.5f,  1.0f, 1.0f,
        -0.5f,  0.5f, -0.5f,  0.0f, 1.0f,
        -0.5f, -0.5f, -0.5f,  0.0f, 0.0f,

        -0.5f, -0.5f,  0.5f,  0.0f, 0.0f,
         0.5f, -0.5f,  0.5f,  1.0f, 0.0f,
         0.5f,  0.5f,  0.5f,  1.0f, 1.0f,
         0.5f,  0.5f,  0.5f,  1.0f, 1.0f,
        -0.5f,  0.5f,  0.5f,  0.0f, 1.0f,
        -0.5f, -0.5f,  0.5f,  0.0f, 0.0f,

        -0.5f,  0.5f,  0.5f,  1.0f, 0.0f,
        -0.5f,  0.5f, -0.5f,  1.0f, 1.0f,
        -0.5f, -0.5f, -0.5f,  0.0f, 1.0f,
        -0.5f, -0.5f, -0.5f,  0.0f, 1.0f,
        -0.5f, -0.5f,  0.5f,  0.0f, 0.0f,
        -0.5f,  0.5f,  0.5f,  1.0f, 0.0f,

         0.5f,  0.5f,  0.5f,  1.0f, 0.0f,
         0.5f,  0.5f, -0.5f,  1.0f, 1.0f,
         0.5f, -0.5f, -0.5f,  0.0f, 1.0f,
         0.5f, -0.5f, -0.5f,  0.0f, 1.0f,
         0.5f, -0.5f,  0.5f,  0.0f, 0.0f,
         0.5f,  0.5f,  0.5f,  1.0f, 0.0f,

        -0.5f, -0.5f, -0.5f,  0.0f, 1.0f,
         0.5f, -0.5f, -0.5f,  1.0f, 1.0f,
         0.5f, -0.5f,  0.5f,  1.0f, 0.0f,
         0.5f, -0.5f,  0.5f,  1.0f, 0.0f,
        -0.5f, -0.5f,  0.5f,  0.0f, 0un.0f,
        -0.5f, -0.5f, -0.5f,  0.0f, 1.0f,

        -0.5f,  0.5f, -0.5f,  0.0f, 1.0f,
         0.5f,  0.5f, -0.5f,  1.0f, 1.0f,
         0.5f,  0.5f,  0.5f,  1.0f, 0.0f,
         0.5f,  0.5f,  0.5f,  1.0f, 0.0f,
        -0.5f,  0.5f,  0.5f,  0.0f, 0.0f,
        -0.5f,  0.5f, -0.5f,  0.0f, 1.0f
    };
    float planeVertices[] = {
        // positions          // texture Coords 
         5.0f, -0.5f,  5.0f,  2.0f, 0.0f,
        -5.0f, -0.5f,  5.0f,  0.0f, 0.0f,
        -5.0f, -0.5f, -5.0f,  0.0f, 2.0f,

         5.0f, -0.5f,  5.0f,  2.0f, 0.0f,
        -5.0f, -0.5f, -5.0f,  0.0f, 2.0f,
         5.0f, -0.5f, -5.0f,  2.0f, 2.0f
    };
    // the grass texture is laid on a plain quad (two triangles) and the idea is that we simply discard fragments 
    // with alpha values below a certain defined threshold in the fragment shader
    float transparentVertices[] = {
        // positions         // texture Coords (swapped y coordinates because texture is flipped upside down)
        0.0f,  0.5f,  0.0f,  0.0f,  0.0f,
        0.0f, -0.5f,  0.0f,  0.0f,  1.0f,
        1.0f, -0.5f,  0.0f,  1.0f,  1.0f,

        0.0f,  0.5f,  0.0f,  0.0f,  0.0f,
        1.0f, -0.5f,  0.0f,  1.0f,  1.0f,
        1.0f,  0.5f,  0.0f,  1.0f,  0.0f
    };
    // since we are using three different buffers it would be best to do sperate VAO's and VBO's for all of them to avoid any entanglements
    // cube VAO
    unsigned int cubeVAO, cubeVBO;
    glGenVertexArrays(1, &cubeVAO);
    glGenBuffers(1, &cubeVBO);
    glBindVertexArray(cubeVAO); // record button
    glBindBuffer(GL_ARRAY_BUFFER, cubeVBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(cubeVertices), &cubeVertices, GL_STATIC_DRAW);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)(3 * sizeof(float)));
    // plane VAO
    unsigned int planeVAO, planeVBO;
    glGenVertexArrays(1, &planeVAO);
    glGenBuffers(1, &planeVBO);
    glBindVertexArray(planeVAO); // record button
    glBindBuffer(GL_ARRAY_BUFFER, planeVBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(planeVertices), &planeVertices, GL_STATIC_DRAW);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)(3 * sizeof(float)));
    // transparent VAO
    unsigned int transparentVAO, transparentVBO;
    glGenVertexArrays(1, &transparentVAO);
    glGenBuffers(1, &transparentVBO);
    glBindVertexArray(transparentVAO); // record button
    glBindBuffer(GL_ARRAY_BUFFER, transparentVBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(transparentVertices), transparentVertices, GL_STATIC_DRAW);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)(3 * sizeof(float)));
    glBindVertexArray(0);

    // load textures
    // -------------
    std::string filePaths[] =
    {
        "resources/textures/marble.jpg",
        "resources/textures/metal.png",
        "resources/textures/grass.png",
        "resources/textures/minigun.png",
        "resources/textures/PIST2.png"
    };
    unsigned int cubeTexture = loadTexture(filePaths[0].c_str());
    unsigned int floorTexture = loadTexture(filePaths[1].c_str());
    unsigned int transparentTexture = loadTexture(filePaths[2].c_str());
    unsigned int gunTexture = loadTexture(filePaths[3].c_str());
    unsigned int pistolTexture = loadTexture(filePaths[4].c_str());

    // transparent vegetation locations
    // --------------------------------
    vector<glm::vec3> vegetation 
    {
        glm::vec3(-1.5f, 0.0f, -0.48f),
        glm::vec3( 1.5f, 0.0f, 0.51f),
        glm::vec3( 0.0f, 0.0f, 0.7f),
        glm::vec3(-0.3f, 0.0f, -2.3f),
        glm::vec3 (0.5f, 0.0f, -0.6f)
    };

    glm::vec3 gunLoc = glm::vec3(3.0f,0.0f,-0.48f);

    // shader configuration
    // --------------------
    shader.use();
    shader.setInt("texture1", 0);   // sampler will be configured to GL_TEXTURE0

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
        glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // draw objects
        shader.use();
        glm::mat4 projection = glm::perspective(glm::radians(camera.Zoom), (float)SCR_WIDTH / (float)SCR_HEIGHT, 0.1f, 100.0f);
        glm::mat4 view = camera.GetViewMatrix();
        glm::mat4 model = glm::mat4(1.0f);
        shader.setMat4("projection", projection);
        shader.setMat4("view", view);

        // cubes (drawing two cubes)
        glBindVertexArray(cubeVAO);
        glActiveTexture(GL_TEXTURE0);   // only need to activate once by by default texture unit 0 is the default texture unit so this is optional
        glBindTexture(GL_TEXTURE_2D, cubeTexture); // each time we want to draw something new we have to link the correct texture to the texture unit
        model = glm::translate(model, glm::vec3(-1.0f, 0.0f, -1.0f));
        shader.setMat4("model", model);
        glDrawArrays(GL_TRIANGLES, 0, 36);
        model = glm::mat4(1.0f);    // ensure to restart from scratch s0 as to not make any mix any transformations
        model = glm::translate(model, glm::vec3(2.0f, 0.0f, 0.0f));
       // model = glm::rotate(model, glm::radians(45.0f), glm::vec3(0.0f,1.0f,0.0f));
        shader.setMat4("model", model);
        glDrawArrays(GL_TRIANGLES, 0, 36);

        // floor
        glBindVertexArray(planeVAO);
        glBindTexture(GL_TEXTURE_2D, floorTexture);
        model = glm::mat4(1.0f);
        shader.setMat4("model", model);
        glDrawArrays(GL_TRIANGLES, 0, 6);

        // vegetation
        glBindVertexArray(transparentVAO);
        glBindTexture(GL_TEXTURE_2D, transparentTexture);
        for (unsigned int i = 0; i < vegetation.size(); i++)
        {
            model = glm::mat4(1.0f);
            model = glm::translate(model, vegetation[i]);
            shader.setMat4("model", model);
            glDrawArrays(GL_TRIANGLES, 0, 6);
        }


        // pistol
        pistolShader.use();
        pistolShader.setInt("texture1", 0); 
        pistolShader.setMat4("projection", projection);
        
        glBindVertexArray(transparentVAO);
        glActiveTexture(GL_TEXTURE0);  
        glBindTexture(GL_TEXTURE_2D, pistolTexture);
        
        glm::mat4 pistolView = glm::mat4(1.0f);
        pistolShader.setMat4("view", pistolView);

        // normalized coordinates for each frame;
        float frameWidthNorm  = 110.0f / 512.0f;   // = 0.21484375
        float frameHeightNorm = 120.0f / 128.0f;  // = 0.9375

        if(isFiring)
        {
            fireTimer += deltaTime;

            if(fireTimer >= frameDuration)
            {
                fireTimer -= frameDuration;
                indexFrame++;

                if (indexFrame >= 4) // 4 total frames (0 to 3)
                {   
                    indexFrame = 0;
                    isFiring = false;
                }
            }
        }
       
        float u_offset = indexFrame * frameWidthNorm;
        float v_offset = 0.0f; // single row, bottom row

        pistolShader.setVec2("uOffset", u_offset, v_offset);
        pistolShader.setVec2("uScale", frameWidthNorm, frameHeightNorm);

        glDisable(GL_DEPTH_TEST);
        model = glm::mat4(1.0f);
        glm::vec3 offset = glm::vec3(-0.1f,-0.2,-1.0f);
        offset.x += bobX;
        offset.y += bobY;
        model = glm::translate(model, offset);
        model = glm::scale(model, glm::vec3(1.5f, 1.2f, 1.0f));
        model = glm::scale(model, glm::vec3(0.4f, 0.4f, 0.4f));
        pistolShader.setMat4("model", model);
        glDrawArrays(GL_TRIANGLES, 0, 6);
        glEnable(GL_DEPTH_TEST);

        /*
        // minigun
        // disable depth testing so that the sprite does not clip with geometry (110px, 120px)
        // since we are basically slapping a sprite to the camera we dont want it to clip with anything in the world
        // by disabling depth testing temporarly, the sprite's z-values wont be tested with other geometry and the fragments wont be discarded!
        glDisable(GL_DEPTH_TEST);
        glBindTexture(GL_TEXTURE_2D, gunTexture);
        glm::mat4 viewGun = glm::mat4(1.0f);
        shader.setMat4("view", viewGun);

        model = glm::mat4(1.0f);
        glm::vec3 offset = glm::vec3(-0.4f,-0.02,-1.0f);
        offset.x += bobX;
        offset.y += bobY;
       // model = glm::translate(model, gunLoc);
        model = glm::translate(model, offset); // offset the gun a little so that it appears on the right hand side of the screen
        model = glm::scale(model, glm::vec3(1.0f, 1.0f, 1.0f));	// it's a bit too big for our scene, so scale it down
        shader.setMat4("model", model);
        glDrawArrays(GL_TRIANGLES, 0, 6);
        glEnable(GL_DEPTH_TEST);
        */
        


        // glfw: swap buffers and poll IO events (keys pressed/released, mouse moved etc.)
        // -------------------------------------------------------------------------------
        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    // optional: de-allocate all resources once they've outlived their purpose:
    // ------------------------------------------------------------------------
    glDeleteVertexArrays(1, &cubeVAO);
    glDeleteVertexArrays(1, &planeVAO);
    glDeleteBuffers(1, &cubeVBO);
    glDeleteBuffers(1, &planeVBO);

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
        camera.ProcessKeyboard(FORWARD, deltaTime);
        // A * sin(F*glfwGetTime())
        // where A = amplitude (how wide) and F = frequency (how fast)
        bobX = static_cast<float>(0.02f * sin(bobSpeedX * glfwGetTime()));
        bobY = static_cast<float>(0.02f * cos(bobSpeedY * glfwGetTime()));
    }
    if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
    {

        camera.ProcessKeyboard(BACKWARD, deltaTime);
        bobX = static_cast<float>(0.02f * sin(bobSpeedX * glfwGetTime()));
        bobY = static_cast<float>(0.02f * cos(bobSpeedY * glfwGetTime()));
    }
    if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
    {

        camera.ProcessKeyboard(LEFT, deltaTime);
        bobX = static_cast<float>(0.02f * sin(bobSpeedX * glfwGetTime()));
        bobY = static_cast<float>(0.02f * cos(bobSpeedY * glfwGetTime()));
    }
    if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
    {

        camera.ProcessKeyboard(RIGHT, deltaTime);
        bobX = static_cast<float>(0.02f * sin(bobSpeedX * glfwGetTime()));
        bobY = static_cast<float>(0.02f * cos(bobSpeedY * glfwGetTime()));
    }

    if(glfwGetKey(window, GLFW_KEY_LEFT_SHIFT) == GLFW_PRESS)
    {
        camera.MovementSpeed = 5.0f;
        bobSpeedX = 4.0f;
        bobSpeedY = 8.0f;
    }
    else
    {
        camera.MovementSpeed = 2.5f;
        bobSpeedX = 2.0f;
        bobSpeedY = 4.0f;
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
    SCR_WIDTH = width;
    SCR_HEIGHT = height;
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

    camera.ProcessMouseMovement(xoffset, yoffset);
}

// glfw: whenever the mouse scroll wheel scrolls, this callback is called
// ----------------------------------------------------------------------
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset)
{
    camera.ProcessMouseScroll(static_cast<float>(yoffset));
}

void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods)
{
    // notify when the pistol was fired when pressing space
    if(key == GLFW_KEY_SPACE && action == GLFW_PRESS)
    {
        isFiring = true;
        fireTimer = 0.0f;
        indexFrame = 0;
    }
    
}

// utility function for loading a 2D texture from file
// ---------------------------------------------------
unsigned int loadTexture(char const * path)
{
    unsigned int textureID;
    glGenTextures(1, &textureID);

    int width, height, nrComponents;
    unsigned char *data = stbi_load(path, &width, &height, &nrComponents, 0);
    if (data)
    {
        GLenum format;
        if (nrComponents == 1)
            format = GL_RED;
        else if (nrComponents == 3)
            format = GL_RGB;
        else if (nrComponents == 4)
        {
            format = GL_RGBA;
            //std::cout << path << endl;
        }

        

        glBindTexture(GL_TEXTURE_2D, textureID);
        glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format, GL_UNSIGNED_BYTE, data);
        glGenerateMipmap(GL_TEXTURE_2D);        

        // GL_CLAMP_TO_EDGE takes the edges of the texture and stretches them out
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, format == GL_RGBA ? GL_CLAMP_TO_EDGE : GL_REPEAT); // for this tutorial: use GL_CLAMP_TO_EDGE to prevent semi-transparent borders. Due to interpolation it takes texels from next repeat 
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, format == GL_RGBA ? GL_CLAMP_TO_EDGE : GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

        stbi_image_free(data);
    }
    else
    {
        std::cout << "Texture failed to load at path: " << path << std::endl;
        stbi_image_free(data);
    }

    return textureID;
}
