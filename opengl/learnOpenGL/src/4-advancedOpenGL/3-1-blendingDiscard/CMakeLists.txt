
add_executable(blendingDiscard main.cpp)

# Link shared library and dependencies
target_link_libraries(blendingDiscard PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(blendingDiscard PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET blendingDiscard POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/blendingDiscard.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/blendingDiscard.vs
        ${CMAKE_CURRENT_SOURCE_DIR}/pistolDiscard.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/pistolDiscard.vs
        $<TARGET_FILE_DIR:blendingDiscard>
)

# Copy resources directory
add_custom_command(TARGET blendingDiscard POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/resources/textures/
    $<TARGET_FILE_DIR:blendingDiscard>/resources/textures
)