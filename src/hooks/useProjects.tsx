"use client"

import { CellId } from "@/components/spreadsheet/spreadsheet.model";
import { createClientClient } from "@/utils/supabase/client";
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from "react";

export interface Project {
    id: string;
    user_id: string;
    title: string;
    data: string;
    created_at: string;
}

type ProjectsContextType = {
    projects: Project[];
    refresh: () => Promise<void>;
};
  
const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider = ({ children }: { children: ReactNode; }) => {
  
    const [projects, setProjects] = useState<Project[]>([]);

    const refresh = async () => {
        const supabase = createClientClient();

        const user = await supabase.auth.getUser();

        const response = await supabase
            .from("projects")
            .select()
            .eq("user_id", user.data.user.id);

        setProjects(response.data ?? []);
    }

    useEffect(() => {
        refresh();
    }, []);

    const values = { projects, refresh };

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