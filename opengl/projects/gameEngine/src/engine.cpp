#include <engine.h>

Shader GameObject::world = Shader("../src/worldShader.vs", "../src/worldShader.fs");
Shader GameObject::weapon = Shader("../src/weaponShader.vs", "../src/weaponShader.fs");

GameObject::GameObject(int minFilter, int magFilter, int sWrap, int tWrap)
{
	this->minFilter = minFilter;
	this->magFilter = magFilter;
	this->sWrap = sWrap;
	this->tWrap = tWrap;

	pos = glm::vec3(0.0f,0.0f,0.0f);
	rot = 0.0f;
}

void GameObject::render(Shader& program, unsigned int VAO ,unsigned int textureID, int primitiveType, int triangleCount)
{
	program.use();
	program.setInt("texture1", 0); // sampler will be configured to GL_TEXTURE0
	glBindVertexArray(VAO);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, textureID);
	glDrawArrays(primitiveType, 0, triangleCount);
}

unsigned int GameObject::loadTexture(char const* path)
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
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, format == GL_RGBA ? sWrap : GL_REPEAT); // for this tutorial: use GL_CLAMP_TO_EDGE to prevent semi-transparent borders. Due to interpolation it takes texels from next repeat 
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, format == GL_RGBA ? tWrap : GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, minFilter); // GL_LINEAR_MIPMAP_LINEAR
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, magFilter);	// GL_LINEAR

        stbi_image_free(data);
    }
    else
    {
        std::cout << "Texture failed to load at path: " << path << std::endl;
        stbi_image_free(data);
    }

    return textureID;
}
