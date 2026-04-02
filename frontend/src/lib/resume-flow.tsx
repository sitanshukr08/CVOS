import React from "react";

const STORAGE_KEY = "cvos-resume-flow";
const GENERATION_STAGE_COUNT = 5;

export interface AssistantMessage {
  id: string;
  role: "assistant" | "user";
  body: string;
}

export interface ImportedProject {
  id: string;
  name: string;
  selected: boolean;
}

export interface IntakeDraft {
  name: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  githubUsername: string;
  linkedin: string;
  targetRole: string;
  primaryDomain: string;
  skillsSnapshot: string;
  experienceDetails: string;
  educationDetails: string;
  featuredProjectsText: string;
}

interface FlowState {
  intake: IntakeDraft;
  assistantMessages: AssistantMessage[];
  githubImport: {
    lastImportedUsername: string;
    projects: ImportedProject[];
  };
  generation: {
    running: boolean;
    stageIndex: number;
    completedAt: string | null;
  };
}

interface QualityIssue {
  title: string;
  detail: string;
}

interface QualitySnapshot {
  score: number;
  confidence: number;
  sections: {
    profile: number;
    content: number;
    projects: number;
  };
  issues: QualityIssue[];
}

interface ResumeFlowContextValue {
  state: FlowState;
  updateIntakeField: (field: keyof IntakeDraft, value: string) => void;
  sendAssistantMessage: (message: string) => void;
  importProjects: () => void;
  toggleProjectSelection: (projectId: string) => void;
  quality: QualitySnapshot;
  canGenerate: boolean;
  generationStages: Array<{
    title: string;
    status: "pending" | "active" | "complete" | "blocked";
    detail: string;
  }>;
  startGeneration: () => void;
  resetGeneration: () => void;
  resetFlow: () => void;
  downloadFileName: string;
}

const defaultState: FlowState = {
  intake: {
    name: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    githubUsername: "",
    linkedin: "",
    targetRole: "",
    primaryDomain: "",
    skillsSnapshot: "",
    experienceDetails: "",
    educationDetails: "",
    featuredProjectsText: ""
  },
  assistantMessages: [],
  githubImport: {
    lastImportedUsername: "",
    projects: []
  },
  generation: {
    running: false,
    stageIndex: 0,
    completedAt: null
  }
};

const ResumeFlowContext = React.createContext<ResumeFlowContextValue | null>(null);

function parseTextItems(value: string) {
  return value
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function generateAssistantReply(message: string, draft: IntakeDraft, projects: ImportedProject[]) {
  const text = message.toLowerCase();
  const role = draft.targetRole || "target role";

  if (text.includes("metric") || text.includes("impact") || text.includes("result")) {
    return `Focus on measurable change for the ${role}. Add one number tied to scope, performance, users, or time saved before you move forward.`;
  }

  if (text.includes("github") || text.includes("repo") || text.includes("project")) {
    if (projects.length > 0) {
      return `Use the selected repositories as evidence. Pull exact tools, architecture choices, and one concrete outcome from the project that best supports your ${role} direction.`;
    }

    return "Bring in a repository only if it proves real technical depth. Favor projects with clear tooling, meaningful README context, and enough scope to justify resume space.";
  }

  if (text.includes("summary") || text.includes("headline") || text.includes("profile")) {
    return `Keep the profile summary narrow. Anchor it to the ${role}, name exact strengths, and remove anything that sounds generic or inflated.`;
  }

  if (text.includes("bullet") || text.includes("experience")) {
    return "Rewrite the bullet around three things: what you built, what stack you used, and what changed because of the work. If one of those is missing, the line is still weak.";
  }

  return "Push the draft toward specificity. Name tools, clarify scope, and prefer evidence over general responsibility statements before moving to review.";
}

function buildProjectsFromDraft(draft: IntakeDraft) {
  return parseTextItems(draft.featuredProjectsText).slice(0, 6).map((name) => ({
    id: createId("project"),
    name,
    selected: true
  }));
}

function computeQuality(state: FlowState): QualitySnapshot {
  const skills = parseTextItems(state.intake.skillsSnapshot);
  const selectedProjects = state.githubImport.projects.filter((project) => project.selected);
  const issues: QualityIssue[] = [];

  let profile = 0;
  if (state.intake.name) profile += 22;
  else issues.push({ title: "Missing name", detail: "Add a full name so the draft can be addressed correctly." });
  if (state.intake.email) profile += 22;
  else issues.push({ title: "Missing email", detail: "An email address is required before the flow can generate a resume." });
  if (state.intake.headline) profile += 18;
  else issues.push({ title: "Weak profile", detail: "Add a headline or target summary so the resume has a clear direction." });
  if (state.intake.targetRole) profile += 18;
  else issues.push({ title: "No target role", detail: "The draft needs a target role so the language stays relevant." });
  if (state.intake.linkedin) profile += 10;
  else issues.push({ title: "Missing LinkedIn", detail: "LinkedIn is optional, but its absence weakens the profile section." });
  if (state.intake.phone) profile += 10;
  const content = Math.min(
    100,
    (skills.length >= 3 ? 24 : 10) +
      (state.intake.experienceDetails.trim().length > 80 ? 42 : 14) +
      (state.intake.educationDetails.trim().length > 20 ? 18 : 8) +
      (state.assistantMessages.length > 0 ? 16 : 8)
  );

  if (skills.length < 3) {
    issues.push({ title: "Thin skills section", detail: "Add at least three concrete tools or frameworks." });
  }

  if (state.intake.experienceDetails.trim().length <= 80) {
    issues.push({
      title: "Weak experience detail",
      detail: "The experience section still needs more scope, tooling, or outcome detail."
    });
  }

  if (state.intake.educationDetails.trim().length <= 20) {
    issues.push({
      title: "Thin education context",
      detail: "Education is still too sparse to feel verified in the final draft."
    });
  }

  let projects = 0;
  if (state.intake.githubUsername) projects += 35;
  else issues.push({ title: "No GitHub username", detail: "Project scoring is limited until a GitHub username is available." });

  if (selectedProjects.length > 0) projects += 45;
  else issues.push({ title: "No selected projects", detail: "Choose at least one project to carry into the reviewed draft." });

  if (state.githubImport.lastImportedUsername) projects += 20;

  const score = Math.round((profile + content + projects) / 3);
  const confidence = Math.round((0.45 + (score / 100) * 0.5) * 100) / 100;

  return {
    score,
    confidence,
    sections: {
      profile: Math.min(profile, 100),
      content,
      projects: Math.min(projects, 100)
    },
    issues
  };
}

function buildGenerationStages(state: FlowState, quality: QualitySnapshot) {
  const baseDetails = [
    "Validate required profile fields and normalize the structured draft.",
    "Strengthen the draft using the writer layer and assistant feedback.",
    "Score the reviewed content and compute section-level confidence.",
    "Pull repository evidence and format project bullets for the resume.",
    "Compile the LaTeX template into the final downloadable PDF."
  ];

  if (!state.intake.name || !state.intake.email) {
    return [
      {
        title: "Normalize input",
        status: "blocked" as const,
        detail: "Name and email are required before generation can begin."
      },
      {
        title: "Enhance draft",
        status: "blocked" as const,
        detail: baseDetails[1]
      },
      {
        title: "Evaluate quality",
        status: "blocked" as const,
        detail: baseDetails[2]
      },
      {
        title: "Generate project bullets",
        status: "blocked" as const,
        detail: baseDetails[3]
      },
      {
        title: "Compile final PDF",
        status: "blocked" as const,
        detail: baseDetails[4]
      }
    ];
  }

  return [
    "Normalize input",
    "Enhance draft",
    "Evaluate quality",
    "Generate project bullets",
    "Compile final PDF"
  ].map((title, index) => {
    let status: "pending" | "active" | "complete";

    if (state.generation.completedAt) {
      status = "complete";
    } else if (state.generation.running) {
      if (index < state.generation.stageIndex) status = "complete";
      else if (index === state.generation.stageIndex) status = "active";
      else status = "pending";
    } else {
      status = index === 0 && quality.score >= 55 ? "active" : "pending";
    }

    return {
      title,
      status,
      detail: baseDetails[index]
    };
  });
}

export function ResumeFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<FlowState>(() => {
    if (typeof window === "undefined") {
      return defaultState;
    }

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch {
      return defaultState;
    }
  });

  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  React.useEffect(() => {
    if (!state.generation.running) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setState((current) => {
        const nextIndex = current.generation.stageIndex + 1;

        if (nextIndex >= GENERATION_STAGE_COUNT) {
          return {
            ...current,
            generation: {
              running: false,
              stageIndex: GENERATION_STAGE_COUNT,
              completedAt: new Date().toISOString()
            }
          };
        }

        return {
          ...current,
          generation: {
            ...current.generation,
            stageIndex: nextIndex
          }
        };
      });
    }, 850);

    return () => window.clearTimeout(timeout);
  }, [state.generation.running, state.generation.stageIndex]);

  const updateIntakeField = React.useCallback((field: keyof IntakeDraft, value: string) => {
    setState((current) => ({
      ...current,
      intake: {
        ...current.intake,
        [field]: value
      }
    }));
  }, []);

  const sendAssistantMessage = React.useCallback((message: string) => {
    if (!message.trim()) {
      return;
    }

    setState((current) => {
      const userMessage: AssistantMessage = {
        id: createId("user"),
        role: "user",
        body: message.trim()
      };

      const assistantMessage: AssistantMessage = {
        id: createId("assistant"),
        role: "assistant",
        body: generateAssistantReply(message, current.intake, current.githubImport.projects)
      };

      return {
        ...current,
        assistantMessages: [...current.assistantMessages, userMessage, assistantMessage]
      };
    });
  }, []);

  const importProjects = React.useCallback(() => {
    setState((current) => ({
      ...current,
      githubImport: {
        lastImportedUsername: current.intake.githubUsername.trim(),
        projects: buildProjectsFromDraft(current.intake)
      }
    }));
  }, []);

  const toggleProjectSelection = React.useCallback((projectId: string) => {
    setState((current) => ({
      ...current,
      githubImport: {
        ...current.githubImport,
        projects: current.githubImport.projects.map((project) =>
          project.id === projectId ? { ...project, selected: !project.selected } : project
        )
      }
    }));
  }, []);

  const startGeneration = React.useCallback(() => {
    setState((current) => ({
      ...current,
      generation: {
        running: true,
        stageIndex: 0,
        completedAt: null
      }
    }));
  }, []);

  const resetGeneration = React.useCallback(() => {
    setState((current) => ({
      ...current,
      generation: {
        running: false,
        stageIndex: 0,
        completedAt: null
      }
    }));
  }, []);

  const resetFlow = React.useCallback(() => {
    setState(defaultState);
  }, []);

  const quality = React.useMemo(() => computeQuality(state), [state]);
  const canGenerate = quality.score >= 55 && !!state.intake.name && !!state.intake.email;
  const generationStages = React.useMemo(
    () => buildGenerationStages(state, quality),
    [quality, state]
  );
  const downloadFileName = state.intake.name
    ? `${state.intake.name.trim().replace(/\s+/g, "_")}_Resume.pdf`
    : "CVOS_Resume.pdf";

  const value: ResumeFlowContextValue = {
    state,
    updateIntakeField,
    sendAssistantMessage,
    importProjects,
    toggleProjectSelection,
    quality,
    canGenerate,
    generationStages,
    startGeneration,
    resetGeneration,
    resetFlow,
    downloadFileName
  };

  return <ResumeFlowContext.Provider value={value}>{children}</ResumeFlowContext.Provider>;
}

export function useResumeFlow() {
  const context = React.useContext(ResumeFlowContext);

  if (!context) {
    throw new Error("useResumeFlow must be used within ResumeFlowProvider");
  }

  return context;
}
