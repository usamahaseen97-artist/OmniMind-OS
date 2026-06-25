"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyCleaning,
  autoBuildDashboard,
  discoverInsights,
  generateBusinessRecommendations,
  generateForecast,
  generateReportMarkdown,
  triggerExport,
  ingestFile,
  parseNaturalLanguageQuery,
  previewCleaning,
  sampleDataset,
  type AnalyticsInsight,
  type AnalyticsModule,
  type BusinessRecommendation,
  type ChartSpec,
  type CleaningOperation,
  type CleaningPreview,
  type DashboardLayout,
  type DashboardTemplateId,
  type DatasetSnapshot,
  type DataSourceKind,
  type ForecastResult,
  type ReportKind,
} from "./enterprise-analytics";
import { runAnalyticsPipeline } from "./agent-pipeline-store";
import { omniCore } from "../core/omnicore/OmniCore";

type EnterpriseAnalyticsContextValue = {
  dataset: DatasetSnapshot | null;
  activeModule: AnalyticsModule;
  setActiveModule: (m: AnalyticsModule) => void;
  insights: AnalyticsInsight[];
  recommendations: BusinessRecommendation[];
  charts: ChartSpec[];
  activeChart: ChartSpec | null;
  setActiveChart: (c: ChartSpec | null) => void;
  forecast: ForecastResult | null;
  dashboard: DashboardLayout | null;
  cleaningPreview: CleaningPreview | null;
  nlAnswer: string | null;
  loading: boolean;
  loadSample: () => void;
  uploadFile: (file: File, kind: DataSourceKind) => Promise<void>;
  connectSource: (kind: DataSourceKind, connectionString: string) => Promise<void>;
  previewClean: (op: CleaningOperation) => void;
  applyClean: (op: CleaningOperation) => void;
  runInsights: () => void;
  runForecast: () => void;
  buildDashboard: (template: DashboardTemplateId) => void;
  askNL: (query: string) => void;
  generateReport: (kind: ReportKind) => string;
  exportReport: (format: "csv" | "json" | "markdown") => void;
};

const EnterpriseAnalyticsContext = createContext<EnterpriseAnalyticsContextValue | null>(null);

export function EnterpriseAnalyticsProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<DatasetSnapshot | null>(null);
  const [activeModule, setActiveModule] = useState<AnalyticsModule>("sources");
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [recommendations, setRecommendations] = useState<BusinessRecommendation[]>([]);
  const [charts, setCharts] = useState<ChartSpec[]>([]);
  const [activeChart, setActiveChart] = useState<ChartSpec | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [dashboard, setDashboard] = useState<DashboardLayout | null>(null);
  const [cleaningPreview, setCleaningPreview] = useState<CleaningPreview | null>(null);
  const [nlAnswer, setNlAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const syncPipeline = useCallback((ds: DatasetSnapshot) => {
    const revenueCol = ds.headers.find((h) => /revenue|sales/i.test(h));
    if (revenueCol) {
      const series = ds.rows.map((r) =>
        typeof r[revenueCol] === "number" ? r[revenueCol] : parseFloat(String(r[revenueCol] ?? 0)) || 0,
      );
      void runAnalyticsPipeline(series.length ? series : [0]);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("omnimind:enterprise-analytics-dataset", { detail: { dataset: ds } }),
      );
    }
  }, []);

  const runInsights = useCallback(() => {
    if (!dataset) return;
    const found = discoverInsights(dataset);
    setInsights(found);
    setRecommendations(generateBusinessRecommendations(dataset, found));
    setActiveModule("insights");
  }, [dataset]);

  useEffect(() => {
    const sample = sampleDataset();
    setDataset(sample);
    const found = discoverInsights(sample);
    setInsights(found);
    setRecommendations(generateBusinessRecommendations(sample, found));
    syncPipeline(sample);

    const onBrainCtx = () => {
      /* Brain already injects workspace context — dataset stays in sync */
    };
    window.addEventListener("omnimind:brain-workspace-context", onBrainCtx);
    return () => window.removeEventListener("omnimind:brain-workspace-context", onBrainCtx);
  }, [syncPipeline]);

  const loadSample = useCallback(() => {
    const sample = sampleDataset();
    setDataset(sample);
    syncPipeline(sample);
    runInsights();
  }, [runInsights, syncPipeline]);

  const uploadFile = useCallback(
    async (file: File, kind: DataSourceKind) => {
      setLoading(true);
      try {
        const ds = await ingestFile(file, kind);
        setDataset(ds);
        syncPipeline(ds);
        setActiveModule("ingestion");
      } finally {
        setLoading(false);
      }
    },
    [syncPipeline],
  );

  const connectSource = useCallback(
    async (kind: DataSourceKind, connectionString: string) => {
      setLoading(true);
      try {
        const { connectAnalyticsSource } = await import("./enterprise-analytics/analytics-api");
        const ds = await connectAnalyticsSource(kind, connectionString);
        setDataset(ds);
        syncPipeline(ds);
        setActiveModule("ingestion");
        runInsights();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not connect data source";
        console.error("[OmniMind] Analytics source connect failed:", err);
        omniCore.notifications.show("Connection failed", message, "error");
      } finally {
        setLoading(false);
      }
    },
    [syncPipeline, runInsights],
  );

  const previewClean = useCallback(
    (op: CleaningOperation) => {
      if (!dataset) return;
      setCleaningPreview(previewCleaning(dataset, op));
      setActiveModule("cleaning");
    },
    [dataset],
  );

  const applyClean = useCallback(
    (op: CleaningOperation) => {
      if (!dataset) return;
      const next = applyCleaning(dataset, op);
      setDataset(next);
      setCleaningPreview(null);
      syncPipeline(next);
      runInsights();
    },
    [dataset, runInsights, syncPipeline],
  );

  const runForecast = useCallback(() => {
    if (!dataset) return;
    setForecast(generateForecast(dataset));
    setActiveModule("forecast");
  }, [dataset]);

  const buildDashboard = useCallback(
    (template: DashboardTemplateId) => {
      const layout = autoBuildDashboard(template, dataset);
      setDashboard(layout);
      setActiveModule("dashboards");
    },
    [dataset],
  );

  const askNL = useCallback(
    (query: string) => {
      const result = parseNaturalLanguageQuery(query, dataset);
      setNlAnswer(result.answer);
      if (result.chart) {
        setCharts((prev) => [result.chart!, ...prev.filter((c) => c.id !== result.chart!.id)]);
        setActiveChart(result.chart);
      }
      if (result.forecast) setForecast(result.forecast);
      if (result.insight) setInsights((prev) => [result.insight!, ...prev]);
      const col = dataset?.headers.find((h) => /revenue|sales/i.test(h));
      const series = col
        ? dataset!.rows.map((r) => (typeof r[col] === "number" ? r[col] : 0) as number)
        : [22, 38, 31, 55, 48];
      void runAnalyticsPipeline(series);
    },
    [dataset],
  );

  const generateReport = useCallback(
    (kind: ReportKind) => generateReportMarkdown(kind, dataset, insights),
    [dataset, insights],
  );

  const exportReport = useCallback(
    (format: "csv" | "json" | "markdown") => {
      if (format === "csv" && dataset) triggerExport("csv", { dataset });
      else if (format === "json" && dataset) triggerExport("json", { dataset });
      else triggerExport("pdf", { reportMd: generateReport("executive") });
    },
    [dataset, generateReport],
  );

  const value = useMemo(
    () => ({
      dataset,
      activeModule,
      setActiveModule,
      insights,
      recommendations,
      charts,
      activeChart,
      setActiveChart,
      forecast,
      dashboard,
      cleaningPreview,
      nlAnswer,
      loading,
      loadSample,
      uploadFile,
      connectSource,
      previewClean,
      applyClean,
      runInsights,
      runForecast,
      buildDashboard,
      askNL,
      generateReport,
      exportReport,
    }),
    [
      dataset,
      activeModule,
      insights,
      recommendations,
      charts,
      activeChart,
      forecast,
      dashboard,
      cleaningPreview,
      nlAnswer,
      loading,
      loadSample,
      uploadFile,
      connectSource,
      previewClean,
      applyClean,
      runInsights,
      runForecast,
      buildDashboard,
      askNL,
      generateReport,
      exportReport,
    ],
  );

  return <EnterpriseAnalyticsContext.Provider value={value}>{children}</EnterpriseAnalyticsContext.Provider>;
}

export function useEnterpriseAnalytics() {
  const ctx = useContext(EnterpriseAnalyticsContext);
  if (!ctx) throw new Error("useEnterpriseAnalytics must be used within EnterpriseAnalyticsProvider");
  return ctx;
}

export function useEnterpriseAnalyticsOptional() {
  return useContext(EnterpriseAnalyticsContext);
}
