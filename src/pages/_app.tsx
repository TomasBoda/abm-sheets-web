import { ModalProvider } from "@/hooks/useModal";
import StyledComponentsRegistry from "@/lib/registry";
import type { AppProps } from "next/app";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<StyledComponentsRegistry>
      		<ModalProvider>
       			<Component {...pageProps} />
      		</ModalProvider>
    	</StyledComponentsRegistry>
  	);
}
