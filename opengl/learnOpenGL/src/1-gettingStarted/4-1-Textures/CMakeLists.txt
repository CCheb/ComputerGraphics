
add_executable(textures main.cpp)

# Link shared library and dependencies
target_link_libraries(textures PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(textures PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET textures POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/texture.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/texture.vs
        $<TARGET_FILE_DIR:textures>
)

add_custom_command(TARGET textures POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/resources/textures
    $<TARGET_FILE_DIR:textures>/resources/textures
)