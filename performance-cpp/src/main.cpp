#include "pipeline.hpp"

#include <iostream>

int main() {
  const auto visionary = omnimind::run_media_pipeline("visionary-ai", "cinematic ad scene");
  const auto vfx = omnimind::run_media_pipeline("vfx-editor", "composite pass");
  const auto architect = omnimind::run_media_pipeline("architectural-designer", "4k viewport render");

  std::cout << "performance-cpp ready\n";
  std::cout << "tool=visionary-ai route=" << visionary.route << " fallback=" << visionary.cloud_fallback << "\n";
  std::cout << "tool=vfx-editor route=" << vfx.route << " fallback=" << vfx.cloud_fallback << "\n";
  std::cout << "tool=architectural-designer route=" << architect.route << " fallback=" << architect.cloud_fallback
            << "\n";
  return 0;
}
