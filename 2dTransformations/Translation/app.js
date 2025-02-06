"use strict";

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */

  // Grabing both the canvas reference and the gl context. We apply this all in a procedural program
  // but this can easily be translated over to a more object oriented format
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  // Boilerplate helps easy go through the program/compile process by using just one line. We simply pass the
  // gl context and both the vertex and fragment shaders and it would go through the entire compilation process
  // which 99% of the time is the same for webgl programs
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);

  // "Hey webgl, we want to extablish this program as the current program we want to work with" You could use multiple
  // program within a webgl application
  gl.useProgram(program);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  var colorLocation = gl.getUniformLocation(program, "u_color");
  var translationLocation = gl.getUniformLocation(program, "u_translation");

  // Create a buffer to put positions in
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer). Binding position buffer to the claw
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Put geometry data into buffer. Notice how this function only sets our data buffer and is execute exactly once! 
  // We only need to send that buffer once and then let the vertex shader do all of the math for us when it comes to translation
  setGeometry(gl);

  // Important: declare our tranlation variable. The idea is to use the sliders as a way to feed this variable data which it will then pass
  // on over to the translation uniform. Initially its set to 0 and we call drawScene as way to set up our scene
  var translation = [0, 0];

  // Random solid color selector
  var color = [Math.random(), Math.random(), Math.random(), 1];

  
  // Calll it once to set-up our scene
  drawScene();

  // Setup a ui. If the slider is updated it will call updatePosition with the right index
  // which updates the appropriate translation (x or y)
  webglLessonsUI.setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});

  function updatePosition(index) {
    return function(event, ui) {
      translation[index] = ui.value;
      // For every update we re-draw our scene which is really just updating the vertex variables
      drawScene();
    };
  }

  // Draw the scene. Notice its outside main!
  function drawScene() {
    // Resize and set our viewport just in case we change our window sizes
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas. Think of this as the clear - update - render cycle
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // No need to have this be called everytime since the buffer values never really change
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);


    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // set the color. Also can put this outside of the drawscene function
    gl.uniform4fv(colorLocation, color);

    // Set the translation. The most important part!
    gl.uniform2fv(translationLocation, translation);

    // Draw the geometry. Now call the shaders
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 18;  // 6 triangles in the 'F', 3 points per triangle
    gl.drawArrays(primitiveType, offset, count);
  }
}

// Fill the buffer with the values that define a letter 'F'.
// Very simple function. Know that each rectangle is composed
// of two triangles each with 3 verticies
function setGeometry(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          // left column
          0, 0,
          30, 0,
          0, 150,
          0, 150,
          30, 0,
          30, 150,

          // top rung
          30, 0,
          100, 0,
          30, 30,
          30, 30,
          100, 0,
          100, 30,

          // middle rung
          30, 60,
          67, 60,
          30, 90,
          30, 90,
          67, 60,
          67, 90,
      ]),
      gl.STATIC_DRAW);
}

main();
