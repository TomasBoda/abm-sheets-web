import { CellInfoProvider } from "@/hooks/useCells";
import { CellStyleProvider } from "@/hooks/useCellStyle";
import { ModalProvider } from "@/hooks/useModal";
import { SelectionProvider } from "@/hooks/useSelection.hook";
import { StepperProvider } from "@/hooks/useStepper";
import StyledComponentsRegistry from "@/lib/registry";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<StyledComponentsRegistry>
      		<ModalProvider>
				<CellInfoProvider>
					<SelectionProvider>
						<StepperProvider>
							<CellStyleProvider>
								<Component {...pageProps} />
							</CellStyleProvider>
						</StepperProvider>
					</SelectionProvider>
				</CellInfoProvider>
      		</ModalProvider>
    	</StyledComponentsRegistry>
  	);
}
