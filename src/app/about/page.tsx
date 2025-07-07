import { AboutScreen } from "@/screens/about.screen";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About | ABM Sheets"
}

export default function AboutPage() {
 
    return (
        <AboutScreen />
    )
}