"use client";

import { createClientClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

interface Project {
    id: string;
    title: string;
    text: string;
    data: string;
    user_id: string;
    created_at: string;
}

type ProjectInsert = Omit<Project, "id" | "user_id" | "created_at">;
type ProjectUpdate = Omit<Project, "user_id" | "created_at">;

type ProjectsContextType = {
    project: Project | undefined;
    projects: Project[];
    loadProjects: () => Promise<void>;
    saveProject: (project: ProjectInsert) => Promise<string>;
    updateProject: (project: ProjectUpdate) => Promise<string>;
    deleteProject: (projectId: string) => Promise<boolean>;
};

const ProjectsContext = createContext<ProjectsContextType | undefined>(
    undefined,
);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [project, setProject] = useState<Project>();
    const [projects, setProjects] = useState<Project[]>([]);

    const loadProjects = async () => {
        const supabase = createClientClient();

        const user = await supabase.auth.getUser();

        if (!user.data.user) {
            return;
        }

        const response = await supabase
            .from("projects")
            .select()
            .eq("user_id", user.data.user.id)
            .order("created_at", { ascending: false });

        setProjects(response.data ?? []);
    };

    const loadProject = async (projectId: string) => {
        const supabase = createClientClient();

        const response = await supabase
            .from("projects")
            .select()
            .eq("id", projectId);

        if (response.error || !response.data || response.data.length !== 1) {
            router.replace("/spreadsheet");
            return;
        }

        setProject(response.data[0]);
    };

    const saveProject = async (project: ProjectInsert) => {
        const supabase = createClientClient();

        const { title, text, data } = project;

        const response = await supabase
            .from("projects")
            .insert([{ title, text, data }])
            .select();

        if (response.error || !response.data || response.data.length !== 1) {
            return undefined;
        }

        await loadProjects();
        return response.data[0].id;
    };

    const updateProject = async (project: ProjectUpdate) => {
        const supabase = createClientClient();

        const { id, title, text, data } = project;

        const response = await supabase
            .from("projects")
            .update({ title, text, data })
            .eq("id", id)
            .select();

        if (response.error || !response.data || response.data.length !== 1) {
            return undefined;
        }

        await loadProjects();
        return response.data[0].id;
    };

    const deleteProject = async (projectId: string) => {
        const supabase = createClientClient();

        const request = await supabase
            .from("projects")
            .delete()
            .eq("id", projectId);

        if (request.error) {
            return false;
        }

        await loadProjects();
        return true;
    };

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        const projectId = searchParams.get("projectId");

        if (projectId) {
            loadProject(projectId);
        } else {
            setProject(undefined);
        }
    }, [searchParams]);

    const values = {
        project,
        projects,
        loadProjects,
        saveProject,
        updateProject,
        deleteProject,
    };

    return (
        <ProjectsContext.Provider value={values}>
            {children}
        </ProjectsContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectsContext);

    if (!context) {
        throw new Error("useProjects must be used within a ProjectsProvider");
    }

    return context;
};
