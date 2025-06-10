
add_executable(coordinateSystems main.cpp)

# Link shared library and dependencies
target_link_libraries(coordinateSystems PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(coordinateSystems PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET coordinateSystems POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/coordinateSystems.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/coordinateSystems.vs
        $<TARGET_FILE_DIR:coordinateSystems>
)

add_custom_command(TARGET coordinateSystems POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/resources/textures
    $<TARGET_FILE_DIR:coordinateSystems>/resources/textures
)