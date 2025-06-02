
add_executable(texturesCombined main.cpp)

# Link shared library and dependencies
target_link_libraries(texturesCombined PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(texturesCombined PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET texturesCombined POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/texture.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/texture.vs
        $<TARGET_FILE_DIR:texturesCombined>
)

add_custom_command(TARGET texturesCombined POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/resources/textures
    $<TARGET_FILE_DIR:texturesCombined>/resources/textures
)