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
  isProcessingChat: boolean;
  githubImport: {
    lastImportedUsername: string;
    projects: ImportedProject[];
  };
  generation: {
    running: boolean;
    stageIndex: number;
    completedAt: string | null;
    pdfUrl: string | null;
    triggerNow?: boolean;
    lastGeneratedIntake?: string | null; // Tracks if data changed since last PDF
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
  pdfUrl: string | null;
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
    primaryDomain: "General",
    skillsSnapshot: "",
    experienceDetails: "",
    educationDetails: "",
    featuredProjectsText: ""
  },
  assistantMessages: [],
  isProcessingChat: false,
  githubImport: {
    lastImportedUsername: "",
    projects: []
  },
  generation: {
    running: false,
    stageIndex: 0,
    completedAt: null,
    pdfUrl: null,
    triggerNow: false,
    lastGeneratedIntake: null
  }
};

const ResumeFlowContext = React.createContext<ResumeFlowContextValue | null>(null);

function parseTextItems(value: string) {
  if (!value) return [];
  return String(value)
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function safeString(val: any): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
      { title: "Normalize input", status: "blocked" as const, detail: "Name and email are required before generation can begin." },
      { title: "Enhance draft", status: "blocked" as const, detail: baseDetails[1] },
      { title: "Evaluate quality", status: "blocked" as const, detail: baseDetails[2] },
      { title: "Generate project bullets", status: "blocked" as const, detail: baseDetails[3] },
      { title: "Compile final PDF", status: "blocked" as const, detail: baseDetails[4] }
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

    return { title, status, detail: baseDetails[index] };
  });
}

export function ResumeFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<FlowState>(() => {
    if (typeof window === "undefined") return defaultState;
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

  const updateIntakeField = React.useCallback((field: keyof IntakeDraft, value: string) => {
    setState((current) => ({
      ...current,
      intake: { ...current.intake, [field]: value }
    }));
  }, []);

  const sendAssistantMessage = React.useCallback(async (message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    if (trimmedMessage.toLowerCase() === "clear") {
      setState({
        ...defaultState,
        assistantMessages: [
          {
            id: createId("assistant"),
            role: "assistant",
            body: "Memory and form data completely cleared. We are starting fresh! What's your name and what kind of resume are we building today?"
          }
        ]
      });
      return;
    }

    const userMessage: AssistantMessage = {
      id: createId("user"),
      role: "user",
      body: trimmedMessage
    };

    setState((current) => ({
      ...current,
      isProcessingChat: true,
      assistantMessages: [...current.assistantMessages, userMessage]
    }));

    try {
      const currentState = state;
      const history = [...currentState.assistantMessages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.body
      }));

      const requestBody = {
        user_input: trimmedMessage,
        history: history,
        current_state: currentState.intake
      };

      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();
      
      let replyText = "I'm sorry, I encountered an error processing that.";
      if (data.reply_to_user) {
        replyText = typeof data.reply_to_user === "string" 
          ? data.reply_to_user 
          : JSON.stringify(data.reply_to_user);
      }

      const assistantMessage: AssistantMessage = {
        id: createId("assistant"),
        role: "assistant",
        body: replyText
      };

      setState((current) => {
        const updates = data.suggested_state_updates || {};
        const newIntake = { ...current.intake };
        
        if (updates.name !== undefined) newIntake.name = safeString(updates.name);
        if (updates.email !== undefined) newIntake.email = safeString(updates.email);
        if (updates.phone !== undefined) newIntake.phone = safeString(updates.phone);
        
        const gh = updates.githubUsername || updates.github_username;
        if (gh !== undefined) newIntake.githubUsername = safeString(gh);
        
        if (updates.linkedin !== undefined) newIntake.linkedin = safeString(updates.linkedin);
        
        const skills = updates.skillsSnapshot || updates.skills;
        if (skills !== undefined) newIntake.skillsSnapshot = safeString(skills);
        
        const exp = updates.experienceDetails || updates.experience;
        if (exp !== undefined) newIntake.experienceDetails = safeString(exp);
        
        const edu = updates.educationDetails || updates.education;
        if (edu !== undefined) newIntake.educationDetails = safeString(edu);
        
        const role = updates.targetRole || updates.target_role;
        if (role !== undefined) newIntake.targetRole = safeString(role);
        
        const hd = updates.headline || updates.profile;
        if (hd !== undefined) newIntake.headline = safeString(hd);

        const projs = updates.featuredProjectsText || updates.projects;
        if (projs !== undefined) newIntake.featuredProjectsText = safeString(projs);

        const shouldTrigger = data.action === "trigger_generation";

        return {
          ...current,
          intake: newIntake,
          isProcessingChat: false,
          assistantMessages: [...current.assistantMessages, assistantMessage],
          generation: {
            ...current.generation,
            triggerNow: shouldTrigger
          }
        };
      });

    } catch (error) {
      console.error("Chat API error:", error);
      setState((current) => ({
        ...current,
        isProcessingChat: false,
        assistantMessages: [
          ...current.assistantMessages, 
          {
            id: createId("assistant"),
            role: "assistant",
            body: "I'm having trouble connecting to the server right now. Please ensure the backend is running."
          }
        ]
      }));
    }
  }, [state]);

  const importProjects = React.useCallback(async () => {
    const username = state.intake.githubUsername.trim();
    if (!username) {
      alert("Please enter a GitHub username in the Intake form first!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/github-repos/${username}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }
      
      const data = await response.json();
      
      const fetchedProjects = data.projects.map((repo: any) => ({
        id: createId("project"),
        name: repo.name,
        selected: true
      }));

      setState((current) => ({
        ...current,
        githubImport: {
          lastImportedUsername: username,
          projects: fetchedProjects
        }
      }));

    } catch (error) {
      console.error("GitHub import error:", error);
      alert("Failed to import projects. Make sure the username is correct and the backend is running.");
    }
  }, [state.intake.githubUsername]);

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

  const startGeneration = React.useCallback(async () => {
    setState((current) => ({
      ...current,
      generation: { 
        ...current.generation,
        running: true, 
        stageIndex: 0, 
        completedAt: null, 
        pdfUrl: null, 
        triggerNow: false,
        lastGeneratedIntake: JSON.stringify(current.intake) // Save snapshot of current data
      }
    }));

    try {
      const requestData = {
        user_data: {
          name: state.intake.name,
          email: state.intake.email,
          phone: state.intake.phone,
          github_username: state.intake.githubUsername,
          linkedin: state.intake.linkedin,
          profile: state.intake.headline,
          inferred_domain: state.intake.primaryDomain || "General",
          skills: [
            {
              category: "Core",
              list: state.intake.skillsSnapshot.split(",").map((s) => s.trim()).filter(Boolean)
            }
          ],
          experience: [
            {
              company: "Experience",
              role: state.intake.targetRole,
              date_range: "",
              bullets: [state.intake.experienceDetails]
            }
          ],
          education: [
            {
              institution: state.intake.educationDetails,
              degree: "",
              graduation_date: "",
              gpa: ""
            }
          ]
        }
      };

      const response = await fetch("http://localhost:8000/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);

      setState((current) => ({
        ...current,
        generation: {
          ...current.generation,
          running: false,
          stageIndex: GENERATION_STAGE_COUNT,
          completedAt: new Date().toISOString(),
          pdfUrl: pdfUrl,
          triggerNow: false
        }
      }));
    } catch (error) {
      console.error("Generation failed:", error);
      setState((current) => ({
        ...current,
        generation: { ...current.generation, running: false, stageIndex: 0, completedAt: null, pdfUrl: null, triggerNow: false }
      }));
      alert(`Generation Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    }
  }, [state.intake]);

  React.useEffect(() => {
    if (state.generation.triggerNow) {
      setState((current) => ({
        ...current,
        generation: { ...current.generation, triggerNow: false }
      }));
      startGeneration();
    }
  }, [state.generation.triggerNow, startGeneration]);

  const resetGeneration = React.useCallback(() => {
    setState((current) => ({
      ...current,
      generation: { ...current.generation, running: false, stageIndex: 0, completedAt: null, pdfUrl: null, triggerNow: false }
    }));
  }, []);

  const resetFlow = React.useCallback(() => {
    setState(defaultState);
  }, []);

  const quality = React.useMemo(() => computeQuality(state), [state]);
  const canGenerate = quality.score >= 55 && !!state.intake.name && !!state.intake.email;
  const generationStages = React.useMemo(() => buildGenerationStages(state, quality), [quality, state]);
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
    downloadFileName,
    pdfUrl: state.generation.pdfUrl
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