"use client";

import { ProjectsSidebar } from "@/components/projects-sidebar";
import { Tab, Tabs } from "@/components/tabs/tabs.component";
import { useModal } from "@/hooks/useModal";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { OnboardingModal } from "@/modals/onboarding.modal";
import { SaveProjectModal } from "@/modals/save-project.modal";
import { createClientClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { useSidebar } from "../../hooks/useSidebar";
import { GraphSidebar } from "../graph-sidebar";
import { HomeTab } from "./home.tab";
import { ImportExportTab } from "./import-export.tab";
import { SimulationTab } from "./simulation.tab";

interface ToolbarProps {
    user?: User;
}

export const Toolbar = ({ user }: ToolbarProps) => {
    const router = useRouter();
    const sidebar = useSidebar();
    const modal = useModal();
    const spreadsheet = useSpreadsheet();
    const onboarding = useOnboarding();

    const searchParams = useSearchParams();

    const signIn = () => {
        router.push("/auth/sign-in");
    };

    const signOut = async () => {
        const supabase = createClientClient();
        await supabase.auth.signOut();
        router.push("/auth/sign-in");
    };

    const onSaveProjectClick = async () => {
        modal.showModal(({ hideModal }) => (
            <SaveProjectModal hideModal={hideModal} />
        ));
    };

    const clearAll = () => {
        const params = new URLSearchParams(searchParams);
        params.delete("projectId");

        router.replace(`/spreadsheet?${params.toString()}`);
        spreadsheet.clear();
    };

    const openGraphSidebar = () => {
        sidebar.toggle("graph", <GraphSidebar />);
    };

    const openProjectsSidebar = () => {
        sidebar.toggle("projects", <ProjectsSidebar />);
    };

    const onLearnClick = () => {
        onboarding.setActive(true);
        modal.showModal(({ hideModal }) => (
            <OnboardingModal
                hideModal={hideModal}
                setActive={onboarding.setActive}
            />
        ));
    };

    const tabs: Tab[] = [
        {
            label: "Home",
            component: <HomeTab />,
        },
        {
            label: "Simulation",
            component: <SimulationTab />,
        },
        {
            label: "Graph",
            onClick: openGraphSidebar,
        },
        ...(user
            ? [
                  {
                      label: "Projects",
                      onClick: openProjectsSidebar,
                  },
              ]
            : []),
        {
            label: "Import & Export",
            component: <ImportExportTab />,
        },
    ];

    return (
        <TabsContainer>
            <Tabs
                tabs={tabs}
                defaultTab={1}
                rightContent={
                    <RightContent>
                        <ToolbarButton onClick={clearAll}>Clear</ToolbarButton>

                        <ToolbarButton onClick={onLearnClick}>
                            Learn
                        </ToolbarButton>

                        <ToolbarDivider />

                        {user && (
                            <ToolbarButton onClick={onSaveProjectClick}>
                                Save project
                            </ToolbarButton>
                        )}

                        {user ? (
                            <ToolbarButton onClick={signOut}>
                                Sign out
                            </ToolbarButton>
                        ) : (
                            <ToolbarButton onClick={signIn}>
                                Sign in
                            </ToolbarButton>
                        )}

                        <a
                            href="https://github.com/tomasBoda/abm-sheets-web"
                            target="_blank"
                        >
                            <GithubLogo src="/logo-github.svg" />
                        </a>
                    </RightContent>
                }
            />
        </TabsContainer>
    );
};

export const TabsContainer = styled.div`
    width: 100%;

    background-color: var(--color-0);
`;

export const TabContainer = styled.div`
    width: 100%;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;

    padding: 6px;
`;

export const ToolbarDivider = styled.div`
    width: 2px;
    height: 20px;
    border-radius: 100px;
    background-color: var(--color-1);
`;

export const ToolbarButton = styled.div`
    color: white;
    font-size: 11px;
    font-weight: 400;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;

    cursor: pointer;

    padding: 5px 12px;
    border-radius: 5px;

    border: 1px solid var(--color-2);

    background-color: var(--color-1);

    transition: all 100ms;

    &:hover {
        background-color: var(--color-2);
    }
`;

const GithubLogo = styled.img`
    width: 22px;
    color: white;
`;

const RightContent = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 15px;
`;
