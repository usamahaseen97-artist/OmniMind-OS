cmake_minimum_required(VERSION 3.20)
project(performance_cpp LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(performance_cpp
  src/main.cpp
  src/pipeline.cpp
)

target_include_directories(performance_cpp PRIVATE include)
