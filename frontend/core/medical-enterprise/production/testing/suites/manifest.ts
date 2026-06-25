/** Test suite manifest — wire to vitest/jest in CI */
export const CLINICAL_AI_SPEC = { id: "unit-clinical-ai", describe: "Clinical AI Engine", tests: ["agents register", "pipeline runs", "disclaimer present"] };
export const IMAGING_SPEC = { id: "unit-imaging", describe: "Imaging Platform", tests: ["upload pipeline", "viewer state", "RBAC"] };
export const REGRESSION_SPEC = { id: "regression-full", describe: "Full Regression", tests: ["phases 1-8 export", "tsc clean"] };
