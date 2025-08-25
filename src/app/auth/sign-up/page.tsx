import { SignUpScreen } from "@/screens/sign-up.screen";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Sign up | ABM Sheets",
};

export default function SignUpPage() {
    return <SignUpScreen />;
}
