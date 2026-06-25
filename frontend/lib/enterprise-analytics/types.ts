export type DataSourceKind =
  | "csv"
  | "excel"
  | "json"
  | "parquet"
  | "sql"
  | "mongodb"
  | "postgresql"
  | "mysql"
  | "rest_api"
  | "google_sheets"
  | "cloud_storage";

export type DataColumnType = "string" | "number" | "date" | "boolean" | "currency" | "unknown";

export type DataColumn = {
  name: string;
  type: DataColumnType;
  nullCount: number;
  uniqueCount: number;
  sample: string[];
};

export type DataRelationship = {
  from: string;
  to: string;
  kind: "foreign_key" | "correlation" | "hierarchy";
  strength: number;
};

export type IngestionIssue = {
  kind: "missing" | "duplicate" | "outlier" | "encoding" | "timezone" | "unit" | "currency";
  column?: string;
  message: string;
  severity: "info" | "warning" | "error";
};

export type IngestionReport = {
  id: string;
  sourceKind: DataSourceKind;
  fileName?: string;
  rowCount: number;
  columnCount: number;
  columns: DataColumn[];
  relationships: DataRelationship[];
  issues: IngestionIssue[];
  encoding?: string;
  currencyDetected?: string;
  timezoneDetected?: string;
  createdAt: string;
};

export type DatasetSnapshot = {
  id: string;
  name: string;
  sourceKind: DataSourceKind;
  headers: string[];
  rows: Record<string, string | number | null>[];
  report: IngestionReport;
};

export type CleaningOperation =
  | "remove_duplicates"
  | "fix_missing"
  | "normalize_formats"
  | "merge_columns"
  | "split_column"
  | "convert_currency"
  | "standardize_dates"
  | "remove_noise";

export type CleaningPreview = {
  operation: CleaningOperation;
  beforeRows: number;
  afterRows: number;
  affectedCells: number;
  sampleBefore: Record<string, unknown>[];
  sampleAfter: Record<string, unknown>[];
};

export type InsightCategory =
  | "revenue_trend"
  | "sales_growth"
  | "loss_driver"
  | "profitability"
  | "segmentation"
  | "regional"
  | "seasonality"
  | "forecast"
  | "anomaly"
  | "risk"
  | "opportunity";

export type AnalyticsInsight = {
  id: string;
  category: InsightCategory;
  title: string;
  explanation: string;
  confidence: number;
  metric?: string;
  value?: string;
  trend?: "up" | "down" | "flat";
};

export type ChartType =
  | "bar"
  | "line"
  | "area"
  | "scatter"
  | "bubble"
  | "heatmap"
  | "treemap"
  | "pie"
  | "donut"
  | "geo"
  | "timeseries"
  | "waterfall"
  | "funnel"
  | "radar"
  | "sankey";

export type ChartSpec = {
  id: string;
  type: ChartType;
  title: string;
  xKey?: string;
  yKey?: string;
  series: { label: string; values: number[] }[];
  labels?: string[];
};

export type DashboardTemplateId = "ceo" | "finance" | "marketing" | "sales" | "operations" | "custom";

export type DashboardWidget = {
  id: string;
  chartId: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type DashboardLayout = {
  id: string;
  template: DashboardTemplateId;
  name: string;
  widgets: DashboardWidget[];
};

export type ForecastPoint = {
  period: string;
  value: number;
  lower: number;
  upper: number;
};

export type ForecastResult = {
  id: string;
  metric: string;
  model: string;
  points: ForecastPoint[];
  confidence: number;
};

export type ReportFormat = "pdf" | "word" | "powerpoint" | "excel" | "markdown";

export type ReportKind = "executive" | "technical" | "business" | "investor";

export type BusinessRecommendation = {
  id: string;
  area: "cost" | "marketing" | "inventory" | "pricing" | "expansion" | "risk" | "profit";
  title: string;
  why: string;
  impact: "high" | "medium" | "low";
};

export type PythonStack = "pandas" | "numpy" | "sklearn" | "statsmodels" | "pyspark" | "duckdb";

export type AnalyticsModule =
  | "sources"
  | "ingestion"
  | "cleaning"
  | "insights"
  | "viz"
  | "dashboards"
  | "forecast"
  | "reports"
  | "python"
  | "advisor"
  | "export";

export type ExportFormat = "excel" | "csv" | "pdf" | "powerpoint" | "word" | "png" | "svg" | "json";

export type StreamingArchitecture = {
  kafka: { enabled: false; topic?: string; broker?: string };
  spark: { enabled: false; appName?: string; master?: string };
  note: string;
};
