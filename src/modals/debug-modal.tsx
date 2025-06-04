import styled from "styled-components";

interface Props {
    hideModal: () => void;
    values: string[];
}

export const DebugModal = ({ values }: Props) => {

    return (
        <Container>
            <Heading>
                Debug
            </Heading>

            <Text>
                Display history of a given cell.
            </Text>

            <Content>
                <Table>
                    <TableHeader>
                        <TableHeaderCell>Step</TableHeaderCell>
                        <TableHeaderCell>Value</TableHeaderCell>
                    </TableHeader>

                    <TableBody>
                        {values.map((value, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Content>
        </Container>
    )
}

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

const Content = styled.div`
    width: 100%;
    height: 400px;

    overflow: scroll;
`;

const Table = styled.table`
    width: 100%;

    border-collapse: collapse;
`;

const TableHeader = styled.thead`
    background-color: var(--bg-2);
`;

const TableHeaderCell = styled.th`
    padding: 5px;
`;

const TableBody = styled.tbody`
    background-color: var(--bg-1);
`;

const TableRow = styled.tr``;

const TableCell = styled.td`
    padding: 5px;
`;