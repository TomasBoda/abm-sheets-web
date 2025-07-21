import LineGraph from "react-line-graph";
import styled from "styled-components";

interface Props {
    hideModal: () => void;
    values: number[];
}

export const GraphModal = ({ values }: Props) => {
    return (
        <Container>
            <Heading>Graph</Heading>

            <Text>Display a graph of a certain cell value history.</Text>

            <Graph>
                <LineGraph
                    data={values}
                    accent="black"
                    fillBelow="none"
                    fillAbove="none"
                />
            </Graph>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: 15px;

    padding: 20px;
    border-radius: 10px;
    border: 2px solid var(--bg-3);

    background-color: var(--bg-0);
`;

const Heading = styled.div`
    color: var(--text-1);
    font-size: 20px;
`;

const Text = styled.div`
    color: var(--text-1);
    font-size: 13px;
    line-height: 150%;

    opacity: 0.5;
`;

const Graph = styled.div`
    padding: 20px;

    border-radius: 5px;
    border: 1px solid var(--bg-6);
`;
