
add_executable(transformations main.cpp)

# Link shared library and dependencies
target_link_libraries(transformations PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(transformations PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET transformations POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/transform.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/transform.vs
        $<TARGET_FILE_DIR:transformations>
)

add_custom_command(TARGET transformations POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/resources/textures
    $<TARGET_FILE_DIR:transformations>/resources/textures
)