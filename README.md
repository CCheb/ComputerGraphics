# Computer Graphics Collection

A collection of projects exploring **Computer Graphics** concepts using **WebGL** and **OpenGL**.  
This repository includes:

- **WebGL Projects (Spring 2025)** – Browser-based graphics experiments and games.  
- **OpenGL Projects (Summer 2025)** – C++ applications built with **CMake**, following [LearnOpenGL](https://learnopengl.com) tutorials.


## Project Structure
```bash
    ComputerGraphics/
    ├── Canvas2D            # Canvas API experiments and small games
    ├── opengl              # OpenGL projects (C++ & CMake)
    │   ├── learnOpenGL     # Tutorials based on Joey de Vries' LearnOpenGL
    │   └── projects        # Custom OpenGL projects
    └── webgl               # WebGL projects and experiments
```

## Overview

This repository serves as a **personal learning hub** for Computer Graphics programming, covering:

- **WebGL (JavaScript)** – Projects/Assignments from Computer Graphics course. Real-time graphics in the browser.  
- **OpenGL (C++ with CMake)** – Intermediate to advance graphics concepts and experimentations Cross-platform rendering.  
- **Canvas 2D** – Simple drawing and animations.  
- **Fundamental graphics concepts**: transformations, shading, frame buffers, and more.

- **Note:** these projects have been developed and tested on macOS/Linux so far.

## Installation & Build

### WebGL

- No build required.  
- Open the `index.html` files in any modern browser supporting WebGL.  
- **Note:** `EscapeTheMaze` requires a basic Python server running on `localhost`.  
  ```bash
  cd webgl/EscapeTheMaze
  python3 -m http.server
- Either this or visit my [portfolio](https://CCheb.github.io)
- You might need to refresh a couple of times so that the all the textures load in.

## OpenGL

**Requirements:**

- **CMake** 3.10 or higher 
- **g++** 17 or higher 
- **OpenGL** 3.3 or higher  
- **GLFW3**, **GLAD**, **GLM**, **Assimp** (included or install via your package manager)

**Build Instructions:**

**For learnOpenGL**

```bash
# Navigate to OpenGL learnOpenGL folder
cd opengl/learnOpenGL

# Create a build directory and navigate into it
mkdir build && cd build

# Generate build files with CMake
cmake ..

# Compile the project. This will compile all samples
make

# Navigate to desired sample within build
cd build/src/*chapter*/*sample*/

# Finally run executable
./ExecutableName
```

**For projects**

```bash
# Navigate to the OpenGL projects folder
cd opengl/projects/*DesiredProject*

# Create a build directory and navigate into it
mkdir build && cd build

# Generate build files with CMake
cmake ..

# Compile the project
make

# Run the compiled executable
./ExecutableName

```

## References:  

- https://learnopengl.com
- https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API
- https://www.opengl.org/
- https://github.com/g-truc/glm
- https://github.com/assimp/assimp


