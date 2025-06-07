import { ProjectsSidebar } from "@/components/projects-sidebar";
import "./globals.css";
import StyledComponentsRegistry from "@/lib/registry";

export default function RootLayout({ children }: { children: React.ReactNode; }) {
    return (
        <html lang="en">
            <body>
                <StyledComponentsRegistry>
                    <ProjectsSidebar />
                    {children}
                </StyledComponentsRegistry>
            </body>
        </html>
    )
}