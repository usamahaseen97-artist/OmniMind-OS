import type { ChartSpec, DashboardLayout, DashboardTemplateId, DatasetSnapshot } from "./types";
import { buildChartFromInsight, discoverInsights } from "./insight-engine";
import { DASHBOARD_TEMPLATES } from "./config";

export function autoBuildDashboard(
  template: DashboardTemplateId,
  dataset: DatasetSnapshot | null,
): DashboardLayout {
  const meta = DASHBOARD_TEMPLATES.find((t) => t.id === template) ?? DASHBOARD_TEMPLATES[0]!;
  const insights = dataset ? discoverInsights(dataset) : [];
  const charts: ChartSpec[] = insights.slice(0, meta.widgets || 4).map((ins, i) => {
    const types = ["bar", "line", "pie", "area", "timeseries", "waterfall"] as const;
    return buildChartFromInsight(dataset!, ins, types[i % types.length]);
  });

  return {
    id: `dash-${template}-${Date.now()}`,
    template,
    name: meta.label,
    widgets: charts.map((c, i) => ({
      id: `w-${i}`,
      chartId: c.id,
      x: (i % 2) * 6,
      y: Math.floor(i / 2) * 4,
      w: 6,
      h: 4,
    })),
  };
}

export function pythonNotebookSnippet(stack: string, datasetName: string): string {
  const imports: Record<string, string> = {
    pandas: "import pandas as pd",
    numpy: "import numpy as np",
    sklearn: "from sklearn.linear_model import LinearRegression",
    statsmodels: "import statsmodels.api as sm",
    pyspark: "from pyspark.sql import SparkSession",
    duckdb: "import duckdb",
  };
  return `${imports[stack] ?? "import pandas as pd"}
# OmniMind reusable notebook cell
df = pd.read_csv("${datasetName}")
summary = df.describe()
print(summary)`;
}
