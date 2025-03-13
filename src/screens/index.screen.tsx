import { Spreadsheet } from "@/components/spreadsheet/spreadsheet.component";
import styled from "styled-components";

export function IndexScreen() {
    
    return (
        <Page>
            <Spreadsheet />
        </Page>
    )
}

const Page = styled.div`
    width: 100vw;
    height: 100vh;

    background-color: var(--bg-0);
`;