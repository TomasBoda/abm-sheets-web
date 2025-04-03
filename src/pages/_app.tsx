import { ModalProvider } from "@/hooks/useModal";
import StyledComponentsRegistry from "@/lib/registry";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<StyledComponentsRegistry>
      		<ModalProvider>
       			<Component {...pageProps} />
      		</ModalProvider>
    	</StyledComponentsRegistry>
  	);
}
