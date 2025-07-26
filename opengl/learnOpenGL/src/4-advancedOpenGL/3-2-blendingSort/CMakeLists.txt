
add_executable(blendingSort main.cpp)

# Link shared library and dependencies
target_link_libraries(blendingSort PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(blendingSort PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET blendingSort POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/blendingSort.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/blendingSort.vs
        $<TARGET_FILE_DIR:blendingSort>
)

# Copy resources directory
add_custom_command(TARGET blendingSort POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/resources/textures/
    $<TARGET_FILE_DIR:blendingSort>/resources/textures
)