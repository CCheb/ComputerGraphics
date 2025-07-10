
add_executable(modelLoading main.cpp)

# Link shared library and dependencies
target_link_libraries(modelLoading PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(modelLoading PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET modelLoading POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/modelLoading.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/modelLoading.vs
        ${CMAKE_CURRENT_SOURCE_DIR}/lightCube.vs
        ${CMAKE_CURRENT_SOURCE_DIR}/lightCube.fs
        $<TARGET_FILE_DIR:modelLoading>
)

# Copy resources directory
add_custom_command(TARGET modelLoading POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/resources/objects/backpack
    $<TARGET_FILE_DIR:modelLoading>/resources/objects/backpack
)

