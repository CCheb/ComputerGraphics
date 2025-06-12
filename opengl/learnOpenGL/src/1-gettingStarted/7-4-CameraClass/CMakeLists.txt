
add_executable(cameraClass main.cpp)

# Link shared library and dependencies
target_link_libraries(cameraClass PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(cameraClass PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET cameraClass POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/camera.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/camera.vs
        $<TARGET_FILE_DIR:cameraClass>
)

add_custom_command(TARGET cameraClass POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/resources/textures
    $<TARGET_FILE_DIR:cameraClass>/resources/textures
)