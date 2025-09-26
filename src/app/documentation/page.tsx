import { DocumentationScreen } from "@/screens/documentation.screen";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Documentation | ABM Sheets",
};

export default function DocumentationPage() {
    return <DocumentationScreen />;
}
