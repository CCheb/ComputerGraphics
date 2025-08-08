#pragma once

#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <shader/shader_m.h>
#include <stb_image.h>

class GameObject
{
protected:
	// World settings
	glm::vec3 pos;
	float rot;

	// Constructor is set to protecte since we dont want to make an object off of this parent class
	// we create objects only from the child classes
	GameObject(int minFilter, int magFilter, int sWrap, int tWrap);

	// Pure virtual function which will require each child class to implement it
	virtual void update() = 0;

	// inhereted by all children;
	void render(Shader& program, unsigned int VAO ,unsigned int textureID, int primitiveType, int triangleCount); 
	unsigned int loadTexture(char const* path);

	// Shaders. The idea is that this would be a resource that all child classes share
	static Shader world;
	static Shader weapon;

private:
	// Texture settings;
	int minFilter;
	int magFilter;
	int sWrap;
	int tWrap;

};


class Cube
{
private:
	static unsigned int VBO, VAO, textureID;
	static float vertices[180];
	glm::mat4 model;
	int primitiveType, triangleCount;

public:
	Cube(glm::vec3 pos, float rot);

};
