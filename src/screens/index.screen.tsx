import styled from "styled-components";
import { Spreadsheet } from "@/components/spreadsheet/spreadsheet.component";

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