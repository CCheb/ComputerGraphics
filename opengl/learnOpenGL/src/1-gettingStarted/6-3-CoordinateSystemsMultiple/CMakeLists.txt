
add_executable(coordinateSystemsMul main.cpp)

# Link shared library and dependencies
target_link_libraries(coordinateSystemsMul PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(coordinateSystemsMul PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET coordinateSystemsMul POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/coordinateSystemsMul.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/coordinateSystemsMul.vs
        $<TARGET_FILE_DIR:coordinateSystemsMul>
)

add_custom_command(TARGET coordinateSystemsMul POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/resources/textures
    $<TARGET_FILE_DIR:coordinateSystemsMul>/resources/textures
)