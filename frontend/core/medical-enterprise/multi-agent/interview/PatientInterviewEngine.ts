import type { PatientInterviewSession, InterviewSection, InterviewSectionId } from "../types";

const SECTION_DEFS: Omit<InterviewSection, "completed" | "responses">[] = [
  { id: "chief-complaint", label: "Chief Complaint", prompt: "What is the primary reason for today's visit?" },
  { id: "hpi", label: "History of Present Illness", prompt: "Describe onset, duration, character, and modifying factors." },
  { id: "past-medical-history", label: "Past Medical History", prompt: "List prior diagnoses, hospitalizations, and surgeries." },
  { id: "family-history", label: "Family History", prompt: "Relevant family medical conditions." },
  { id: "social-history", label: "Social History", prompt: "Occupation, tobacco, alcohol, substance use, living situation." },
  { id: "medications", label: "Medication Review", prompt: "Current medications including OTC and supplements." },
  { id: "allergies", label: "Allergy Review", prompt: "Drug, food, and environmental allergies with reactions." },
  { id: "review-of-systems", label: "Review of Systems", prompt: "Systematic review by body system." },
  { id: "risk-factors", label: "Risk Factors", prompt: "Cardiovascular, metabolic, infectious, and lifestyle risk factors." },
];

/** Guided patient interview engine */
export class PatientInterviewEngine {
  private sessions = new Map<string, PatientInterviewSession>();

  startInterview(patientId: string): PatientInterviewSession {
    const sections: InterviewSection[] = SECTION_DEFS.map((s) => ({
      ...s,
      completed: false,
      responses: [],
    }));
    const session: PatientInterviewSession = {
      id: `interview-${Date.now()}`,
      patientId,
      sections,
      progress: 0,
      startedAt: new Date().toISOString(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getCurrentSection(sessionId: string): InterviewSection | undefined {
    const session = this.sessions.get(sessionId);
    return session?.sections.find((s) => !s.completed);
  }

  recordResponse(sessionId: string, sectionId: InterviewSectionId, question: string, answer: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Interview session not found");
    const section = session.sections.find((s) => s.id === sectionId);
    if (!section) throw new Error("Section not found");
    section.responses.push({ question, answer, timestamp: new Date().toISOString() });
    section.completed = true;
    const done = session.sections.filter((s) => s.completed).length;
    session.progress = Math.round((done / session.sections.length) * 100);
    if (session.progress === 100) session.completedAt = new Date().toISOString();
    return session;
  }

  getSession(sessionId: string) {
    return this.sessions.get(sessionId);
  }

  exportStructured(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Interview session not found");
    return {
      patientId: session.patientId,
      sections: session.sections.map((s) => ({
        id: s.id,
        label: s.label,
        responses: s.responses,
      })),
      progress: session.progress,
    };
  }
}

let engine: PatientInterviewEngine | null = null;

export function getPatientInterviewEngine() {
  if (!engine) engine = new PatientInterviewEngine();
  return engine;
}
