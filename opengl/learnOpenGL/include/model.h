#ifndef MODEL_H
#define MODEL_H

#include <glad/glad.h> 

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <stb_image.h>
// Model loading library
#include <assimp/Importer.hpp>  // initial importer object 
#include <assimp/scene.h>   // for the scene node
#include <assimp/postprocess.h>

#include <mesh.h>
#include <shader/shader.h>

#include <string>
#include <fstream>
#include <sstream>
#include <iostream>
#include <map>
#include <vector>
using namespace std;

// Helper function to grab appropriate textures depending on the path
unsigned int TextureFromFile(const char *path, const string &directory, bool gamma = false);

class Model 
{
public:
    // model data 

    // stores all the textures loaded so far, optimization to make sure textures aren't loaded more than once.
    // This way we dont need to load in the same texture again which is costly
    // Texture type is a struct containing essential texture information such as location and type
    vector<Texture> textures_loaded;    

    // A model is composed of one to many meshes and we keep those objects in a vector. Each mesh contains unique vertex and texture information contained in vectors
    vector<Mesh>    meshes;
    string directory;
    bool gammaCorrection;

    // constructor, expects a filepath to a 3D model.
    Model(string const &path, bool gamma = false) : gammaCorrection(gamma)
    {
        // we start by loading the models data into a scene object
        loadModel(path);
    }

    // draws the model, and thus all its meshes
    void Draw(Shader &shader)
    {
        for(unsigned int i = 0; i < meshes.size(); i++)
            meshes[i].Draw(shader);
    }
    
private:
    // loads a model with supported ASSIMP extensions from file and stores the resulting meshes in the meshes vector.
    void loadModel(string const &path)
    {
        // read file via ASSIMP
        Assimp::Importer importer;

        // A scene object contains all the data associated with the model and sits at the top of the tree structure. The idea is that children
        // nodes, as attributes, hold indicies/pointers to the scene's, mesh and material arrays which again contain all the data of the model.

        // We specify the path of the model in our filesystem and set some post processing configs on how assimp should bring in the model. For example
        // aiProcess_Triangulate forces any polygons not as triangles to become triangles. We should specify the configs that best suit or application and model
        const aiScene* scene = importer.ReadFile(path, aiProcess_Triangulate | aiProcess_GenSmoothNormals | aiProcess_FlipUVs | aiProcess_CalcTangentSpace);
        // check for errors
        // if the scene itself doesnt exists, the flags are incomplete or the root node is not present then error out
        if(!scene || scene->mFlags & AI_SCENE_FLAGS_INCOMPLETE || !scene->mRootNode) // if is Not Zero
        {
            cout << "ERROR::ASSIMP:: " << importer.GetErrorString() << endl;
            return;
        }
        // retrieve the directory path of the filepath
        // In this example directory = resources/objects/backpack
        directory = path.substr(0, path.find_last_of('/'));

        // process ASSIMP's root node recursively. Pass in the root node which is the first child node along with the scene
        processNode(scene->mRootNode, scene);
    }

    // processes a node in a recursive fashion. Processes each individual mesh located at the node and repeats this process on its children nodes (if any).
    // It is this way since assimp loads models into a general tree structure where the scene is at the top and the children (individual)
    // meshes are towards the bottom.
    void processNode(aiNode *node, const aiScene *scene)
    {
        // process each mesh located at the current node
        // a node could contain multiple meshes. For example the root node could contain 3 meshes, so we need to process
        // all three before moving on to the next one 
        for(unsigned int i = 0; i < node->mNumMeshes; i++)
        {
            // the node object only contains indices to index the actual objects in the scene. 
            // the scene contains all the data, node is just to keep stuff organized (like relations between nodes).

            // here we access the scenes mMeshes array which contains all of the meshes of the model and only parse
            // the mesh data of the current mesh which belongs to the current node.
            // Here we would collect vertex information (positions, normals, texture coords, face indicies) along with
            // material information (specular and diffuse maps etc)
            aiMesh* mesh = scene->mMeshes[node->mMeshes[i]];
            meshes.push_back(processMesh(mesh, scene));
        }
        // after we've processed all of the meshes (if any) we then recursively process each of the children nodes
        // at the end of the day all owe are doing is cutting up the mMeshes array so that we can turn them into something
        // that openGL will be able to understand
        for(unsigned int i = 0; i < node->mNumChildren; i++)
        {
            processNode(node->mChildren[i], scene);
        }

        // at then end of this recursion we would now have one completed model that would be ready to render!
        // all of the previous functions eventually lead back to this function
    }

    // Function to process the mesh sent from the processNode function
    Mesh processMesh(aiMesh *mesh, const aiScene *scene)
    {
        // data to fill. Each mesh object (from mesh.h) contains these three vectors that need to
        // be filled with the data we just brought in. Its like bringing fish from a fishing trip.
        // After bringing the fish we still need to skin it and cut it up into manageble pieces.
        vector<Vertex> vertices;
        vector<unsigned int> indices;
        vector<Texture> textures;

        // walk through each of the mesh's vertices with the goal of filling up the vertices vector
        for(unsigned int i = 0; i < mesh->mNumVertices; i++)
        {
            // position, normals, text coords, etc...
            Vertex vertex;
            glm::vec3 vector; // we declare a placeholder vector since assimp uses its own vector class that doesn't directly convert to glm's vec3 class so we transfer the data to this placeholder glm::vec3 first.
            // positions
            vector.x = mesh->mVertices[i].x;
            vector.y = mesh->mVertices[i].y;
            vector.z = mesh->mVertices[i].z;
            // after getting the individual components assemble the position vec3 for the current vertex
            vertex.Position = vector;
            // normals
            if (mesh->HasNormals())
            {
                vector.x = mesh->mNormals[i].x;
                vector.y = mesh->mNormals[i].y;
                vector.z = mesh->mNormals[i].z;
                // same idea, we also want the normals associated with the current vertex
                vertex.Normal = vector;
            }
            // texture coordinates
            if(mesh->mTextureCoords[0]) // does the mesh contain texture coordinates? Many models dont have any
            {
                glm::vec2 vec;
                // a vertex can contain up to 8 different texture coordinates. We thus make the assumption that we won't 
                // use models where a vertex can have multiple texture coordinates so we always take the first set (0).
                vec.x = mesh->mTextureCoords[0][i].x; // s
                vec.y = mesh->mTextureCoords[0][i].y; // t
                // we then set the TexCoords vec2 for the current vertex
                vertex.TexCoords = vec;
                
                // These two we will cover in later examples
                // tangent
                vector.x = mesh->mTangents[i].x;
                vector.y = mesh->mTangents[i].y;
                vector.z = mesh->mTangents[i].z;
                vertex.Tangent = vector;
                // bitangent
                vector.x = mesh->mBitangents[i].x;
                vector.y = mesh->mBitangents[i].y;
                vector.z = mesh->mBitangents[i].z;
                vertex.Bitangent = vector;
            }
            else
                vertex.TexCoords = glm::vec2(0.0f, 0.0f);

            // Once we have the position, normal, and text coords for the current vertex we push the struct to the vertices vector
            // thus completing 1/3 of the mesh object. This process would repeat for each vertex of the mesh since they all specify unique information
            vertices.push_back(vertex);
        }
        // now walk through each of the mesh's faces (a face is a mesh its triangle) and retrieve the corresponding vertex indices.
        // Faces represent the primitive shapes that make up the mesh. They can be seen when turning on wireframe mode.
        for(unsigned int i = 0; i < mesh->mNumFaces; i++)
        {
            // loop through the mesh's faces (collection of vertices) and grab the indicies which tells us the order of rendering
            aiFace face = mesh->mFaces[i];
            // retrieve all indices of the face and store them in the indices vector
            // mNumIndicies should be == 3 since we triangulated the model when importing it
            for(unsigned int j = 0; j < face.mNumIndices; j++)
                indices.push_back(face.mIndices[j]);        
        }
        // From here we have completed 2/3 of the object


        // process materials. Now instead of accessing mMeshes to grab meshes we access mMaterials to grab the
        // material properties of the current mesh. Number of materials shouldnt be high since multiple vertices
        // will have texture coordinates that map to the same texture.
        aiMaterial* material = scene->mMaterials[mesh->mMaterialIndex];    
        // we assume a convention for sampler names in the shaders. Each diffuse texture should be named
        // as 'texture_diffuseN' where N is a sequential number ranging from 1 to MAX_SAMPLER_NUMBER. 
        // Same applies to other texture as the following list summarizes:
        // diffuse: texture_diffuseN
        // specular: texture_specularN
        // normal: texture_normalN

        // A mesh could, as its material, contain multiple maps. We pass in the typeName to agree with the convention
        // 1. diffuse maps result should be all diffuse maps in a vector of textures 
        vector<Texture> diffuseMaps = loadMaterialTextures(material, aiTextureType_DIFFUSE, "texture_diffuse");
        // insert the contents of the map at the end of the textures vector 
        textures.insert(textures.end(), diffuseMaps.begin(), diffuseMaps.end());
        // 2. specular maps
        vector<Texture> specularMaps = loadMaterialTextures(material, aiTextureType_SPECULAR, "texture_specular");
        textures.insert(textures.end(), specularMaps.begin(), specularMaps.end());
        // 3. normal maps
        vector<Texture> normalMaps = loadMaterialTextures(material, aiTextureType_HEIGHT, "texture_normal");
        textures.insert(textures.end(), normalMaps.begin(), normalMaps.end());
        // 4. height maps
        vector<Texture> heightMaps = loadMaterialTextures(material, aiTextureType_AMBIENT, "texture_height");
        textures.insert(textures.end(), heightMaps.begin(), heightMaps.end());
        
        // return a mesh object created from the extracted mesh data
        // At this point we have completed one mesh. We would then repeat this for each mesh of the current node
        // and any children nodes. Here we finally create a mesh object and return it back to the vertex
        return Mesh(vertices, indices, textures);
    }

    // checks all material textures of a given type and loads the textures if they're not loaded yet.
    // the required info is returned as a Texture struct.
    vector<Texture> loadMaterialTextures(aiMaterial *mat, aiTextureType type, string typeName)
    {
        vector<Texture> textures;
        // loop through the ammount of textures matching the type this would repeat for every diffuse, specular etc
        for(unsigned int i = 0; i < mat->GetTextureCount(type); i++)
        {
            // will contain the filepath to the texture. we identify that texture by passing in the type along with the id via i
            aiString str;
            mat->GetTexture(type, i, &str);
            // check if texture was loaded before and if so, continue to next iteration: skip loading a new texture
            bool skip = false;
            for(unsigned int j = 0; j < textures_loaded.size(); j++)
            {
                // 0 if they hold the same data
                if(std::strcmp(textures_loaded[j].path.data(), str.C_Str()) == 0)
                {
                    textures.push_back(textures_loaded[j]);
                    skip = true; // a texture with the same filepath has already been loaded, continue to next one. (optimization)
                    break;
                }
            }
            if(!skip)
            {   // if texture hasn't been loaded already, load it
                Texture texture;    // id, type, and path

                // TextureFromFile is a helper function that helps create the texture object given the appropriate file path!
                // this is in short the texture object that we have seem before in other examples
                texture.id = TextureFromFile(str.C_Str(), this->directory); // actual texture object
                texture.type = typeName;    // set the type name this is important for setting the samplers
                texture.path = str.C_Str(); // Should just be the name of the texture not the entire path

                // not only do we push the texture to the local textures vector but we save it internally that way we dont need to load the same texture again
                textures.push_back(texture);
                textures_loaded.push_back(texture);  // store it as texture loaded for entire model, to ensure we won't unnecessary load duplicate textures.
            }
        }
        // finally we return all of the textures of the matching type back to the Models textures vector 
        // we repeat this for all texture types of the model
        return textures;
    }
};


unsigned int TextureFromFile(const char *path, const string &directory, bool gamma)
{
    // form full string filepath
    // Ex: "resources/objects/backpack/diffuse"
    string filename = string(path);
    filename = directory + '/' + filename;

    // Create texture object. we are given an ID to identify the texture on the gpu
    unsigned int textureID;
    glGenTextures(1, &textureID);

    // use stb_image to load the data of the texture. In this case we are loading the entire texture (e.g. diffuse.jpg)
    int width, height, nrComponents;
    unsigned char *data = stbi_load(filename.c_str(), &width, &height, &nrComponents, 0);
    if (data)
    {
        // find the image color format 
        GLenum format;
        if (nrComponents == 1)
            format = GL_RED;
        else if (nrComponents == 3)
            format = GL_RGB;
        else if (nrComponents == 4)
            format = GL_RGBA;

        // bind texture object and link it with the image data
        glBindTexture(GL_TEXTURE_2D, textureID);
        glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format, GL_UNSIGNED_BYTE, data);
        glGenerateMipmap(GL_TEXTURE_2D);

        // set wrapping and filtering settings 
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

        stbi_image_free(data);
    }
    else
    {
        std::cout << "Texture failed to load at path: " << path << std::endl;
        stbi_image_free(data);
    }

    // finally return the fully linked texture object. This process is not new as we have seen it before in other
    // examples
    return textureID;
}
#endif
