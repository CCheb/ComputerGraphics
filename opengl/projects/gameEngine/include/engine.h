#pragma once

#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <shader/shader_m.h>
#include <stb_image.h>
#include <camera.h>

class GameObject
{
protected:
	// World settings
	glm::vec3 pos;
	float rot;

	int sWrap;
	int tWrap;
	// Constructor is set to protecte since we dont want to make an object off of this parent class
	// we create objects only from the child classes
	GameObject(glm::vec3 pos, float rot, int sWrap, int tWrap);
	
	unsigned int loadTexture(char const* path, int sWrap, int tWrap, int minFilter = GL_LINEAR_MIPMAP_LINEAR, int magFilter = GL_LINEAR);

public:
	// Shaders. The idea is that this would be a resource that all child classes share
	// we need a pointer here since shader compilation needs to happen after the creation of the context
	// by glfw and glad. Normally anything static would be defined before the class and in this case will cause a segmentation fault
	static Shader* world;
	//static Shader weapon;

	// Pure virtual functions which will require each child class to implement it
	virtual void update() = 0;
	virtual void draw() = 0;

	// core render function in which a child class would call within draw. This is so that we have a nice interface in main when updating and rendering
	virtual void render(Shader* program, unsigned int VAO ,unsigned int textureID, int primitiveType, int triangleCount); 
	// clean up static resources from GameObject
	static void cleanShaders();

	// since we want a base object to point to child objects, the base class need to also access the childs destructor in order to safely dispose of any resources
	// in this case we dont have any special constructors for the child classes but if we dont have this then the base pointer will only be able to call its own destructor
	virtual ~GameObject() = default;

};


class Cube : public GameObject
{
private:
	static unsigned int VBO, VAO, textureID;
	static float vertices[180];
	glm::mat4 model;
	int primitiveType, verticeCount;

public:
	Cube(glm::vec3 pos = glm::vec3(0.0f,0.0f,0.0f), float rot = 0, int primitiveType = GL_TRIANGLES, int verticeCount = 36);

	void update() override;
	void draw() override;


	static void cleanUp();
};



class Weapon : public GameObject
{
	public: 
		Weapon();
		void draw() override;
		void update() override;


};



class Player
{
private:
	glm::mat4 projection, view, model;
	//std::vector<std::unique_ptr<GameObject>> weapons;
	int weaponSelection;
	struct weapons
	{
		// Pistol object

		// Shotgun object
	};

public:
	Camera camera;
	float scr_width, scr_height;
	Player(glm::vec3 pos, float rot, unsigned int scr_width = 800, unsigned int scr_height = 600);
	void processInput(GLFWwindow *window);
	void update(GLFWwindow *window);
	void draw();

};


