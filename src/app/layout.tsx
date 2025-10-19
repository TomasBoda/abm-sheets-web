import { ReactNode } from "react";
import "@/styles/globals.css";
import { MessageProvider } from "@/hooks/useMessage";
import StyledComponentsRegistry from "./registry";

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <body>
                <StyledComponentsRegistry>
                    <MessageProvider>{children}</MessageProvider>
                </StyledComponentsRegistry>
            </body>
        </html>
    );
}
