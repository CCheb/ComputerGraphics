
add_executable(cameraMovement main.cpp)

# Link shared library and dependencies
target_link_libraries(cameraMovement PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(cameraMovement PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET cameraMovement POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/camera.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/camera.vs
        $<TARGET_FILE_DIR:cameraMovement>
)

add_custom_command(TARGET cameraMovement POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/resources/textures
    $<TARGET_FILE_DIR:cameraMovement>/resources/textures
)