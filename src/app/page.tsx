import { LandingScreen } from "@/screens/landing.screen";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ABM Sheets"
}

export default function LandingPage() {
 
    return (
        <LandingScreen />
    )
}