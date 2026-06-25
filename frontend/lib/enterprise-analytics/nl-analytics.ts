import type { AnalyticsInsight, ChartSpec, ChartType, DatasetSnapshot } from "./types";
import { buildChartFromInsight, discoverInsights } from "./insight-engine";
import { generateForecast } from "./forecast-engine";

export type NLQueryResult = {
  answer: string;
  insight?: AnalyticsInsight;
  chart?: ChartSpec;
  forecast?: ReturnType<typeof generateForecast>;
};

export function parseNaturalLanguageQuery(query: string, dataset: DatasetSnapshot | null): NLQueryResult {
  const q = query.toLowerCase();
  if (!dataset) {
    return { answer: "Upload or connect a dataset to run natural language analytics." };
  }

  const insights = discoverInsights(dataset);

  if (/highest|top|best|which region|max/i.test(q) && /profit|revenue|sales/i.test(q)) {
    const ins = insights.find((i) => i.category === "regional") ?? insights[0];
    return {
      answer: ins?.explanation ?? "Regional analysis complete.",
      insight: ins,
      chart: ins ? buildChartFromInsight(dataset, ins, "bar") : undefined,
    };
  }

  if (/predict|forecast|next month/i.test(q)) {
    const fc = generateForecast(dataset);
    return {
      answer: `Forecast for ${fc.metric}: next period ~${fc.points[0]?.value.toLocaleString()} (${Math.round(fc.confidence * 100)}% confidence).`,
      forecast: fc,
      chart: {
        id: "nl-forecast",
        type: "timeseries",
        title: "Forecast",
        labels: fc.points.map((p) => p.period),
        series: [
          { label: "Forecast", values: fc.points.map((p) => p.value) },
          { label: "Lower", values: fc.points.map((p) => p.lower) },
          { label: "Upper", values: fc.points.map((p) => p.upper) },
        ],
      },
    };
  }

  if (/why.*drop|revenue drop|decline/i.test(q)) {
    const ins = insights.find((i) => i.trend === "down") ?? insights.find((i) => i.category === "loss_driver");
    return {
      answer: ins?.explanation ?? "Possible drivers: seasonality, regional underperformance, or cost inflation. Review wastage and margin columns.",
      insight: ins,
    };
  }

  if (/top customer|best customer/i.test(q)) {
    return {
      answer: "Customer segmentation ranks high-LTV accounts in the top quartile — export segmentation for CRM targeting.",
      chart: buildChartFromInsight(dataset, insights[0]!, "funnel"),
    };
  }

  if (/show|chart|graph|plot/i.test(q)) {
    const chartType = (/line|trend/i.test(q) ? "line" : /pie|donut/i.test(q) ? "pie" : "bar") as ChartType;
    const ins = insights[0];
    return {
      answer: `Generated ${chartType} chart from your dataset.`,
      chart: ins ? buildChartFromInsight(dataset, ins, chartType) : undefined,
    };
  }

  return {
    answer: `Analyzed ${dataset.rows.length} rows. ${insights[0]?.explanation ?? "Ask about regions, forecasts, or top performers."}`,
    insight: insights[0],
  };
}
