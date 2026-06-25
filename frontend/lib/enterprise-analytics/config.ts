import type { DataSourceKind } from "./types";

export const DATA_SOURCE_OPTIONS: { id: DataSourceKind; label: string; hint: string; connect?: boolean }[] = [
  { id: "csv", label: "CSV", hint: "Upload comma-separated file" },
  { id: "excel", label: "Excel", hint: "Upload .xlsx / .xls" },
  { id: "json", label: "JSON", hint: "Upload or paste JSON records" },
  { id: "parquet", label: "Parquet", hint: "Columnar analytics format" },
  { id: "postgresql", label: "PostgreSQL", hint: "Connect database", connect: true },
  { id: "mysql", label: "MySQL", hint: "Connect database", connect: true },
  { id: "mongodb", label: "MongoDB", hint: "Connect NoSQL", connect: true },
  { id: "sql", label: "SQL Database", hint: "Generic SQL connection", connect: true },
  { id: "rest_api", label: "REST API", hint: "Pull from HTTP endpoint", connect: true },
  { id: "google_sheets", label: "Google Sheets", hint: "Connect spreadsheet", connect: true },
  { id: "cloud_storage", label: "Cloud Storage", hint: "Future: S3 / GCS / Azure", connect: true },
];

export const CHART_TYPE_OPTIONS = [
  "bar", "line", "area", "scatter", "bubble", "heatmap", "treemap", "pie", "donut",
  "geo", "timeseries", "waterfall", "funnel", "radar", "sankey",
] as const;

export const DASHBOARD_TEMPLATES = [
  { id: "ceo" as const, label: "CEO Dashboard", widgets: 6 },
  { id: "finance" as const, label: "Finance Dashboard", widgets: 8 },
  { id: "marketing" as const, label: "Marketing Dashboard", widgets: 7 },
  { id: "sales" as const, label: "Sales Dashboard", widgets: 8 },
  { id: "operations" as const, label: "Operations Dashboard", widgets: 6 },
  { id: "custom" as const, label: "Custom Dashboard", widgets: 0 },
];

export const PYTHON_STACKS = ["pandas", "numpy", "sklearn", "statsmodels", "pyspark", "duckdb"] as const;

export const STREAMING_ARCHITECTURE_STUB = {
  kafka: { enabled: false as const, topic: "omnimind.analytics.events", broker: "kafka://localhost:9092" },
  spark: { enabled: false as const, appName: "OmniMindAnalytics", master: "spark://localhost:7077" },
  note: "Streaming layer prepared for Kafka + Spark — enable when cluster is configured.",
};
