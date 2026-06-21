#pragma once

#include <string>

namespace omnimind {

struct GpuPipelineResult {
  bool ok;
  bool cloud_fallback;
  std::string route;
  double latency_ms;
};

GpuPipelineResult run_media_pipeline(const std::string& tool, const std::string& prompt);

}  // namespace omnimind
