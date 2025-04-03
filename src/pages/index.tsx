import Head from "next/head";
import { IndexScreen } from "@/screens/index.screen";

export default function IndexPage() {

	return (
    	<>
      		<Head>
        		<title>ABM Sheets</title>
      		</Head>

      		<IndexScreen />
    	</>
  	)
}