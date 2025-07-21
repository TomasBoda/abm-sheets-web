import { SignInScreen } from "@/screens/sign-in.screen";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Sign in",
};

export default function SignInPage() {
    return <SignInScreen />;
}
