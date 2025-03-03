import { Button } from "@/components/button/button.component";
import { variables } from "@/components/spreadsheet/spreadsheet.component";
import { useModal } from "@/hooks/useModal";
import { Value } from "@/parser/runtime";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { AddVariableModal } from "./add-variable-modal";

// TODO: save variables to JSON export and load them on JSON load

export const VariablesModal = ({ hideModal }: { hideModal: () => void }) => {

    const { showModal } = useModal();

    const [vars, setVars] = useState<{ identifier: string; value: Value; }[]>([]);

    const loadVariables = () => {
        const vars: { identifier: string; value: Value; }[] = [];

        for (const [identifier, value] of variables.entries()) {
            vars.push({ identifier, value });
        }

        setVars(vars);
    }

    const addVariable = () => {
        showModal(({ hideModal }) => (
            <AddVariableModal hideModal={hideModal} />
        ))
    }

    const removeVariable = (identifier: string) => {
        variables.delete(identifier);
        loadVariables();
    }

    useEffect(() => {
        loadVariables();
    }, []);

    return (
        <Container>
            <Heading>
                Variables
            </Heading>

            <div style={{ height: 15 }} />

            <Text>
                Define custom constant variables that you can use within your spreadsheet as global variables.
            </Text>

            <div style={{ height: 15 }} />

            <Items>
                {vars.map(variable => (
                    <Item>
                        <Identifier>{variable.identifier}</Identifier>
                        <Result>{variable.value.value}</Result>
                        <Trash2
                            size={12}
                            color="white"
                            style={{ cursor: "pointer" }}
                            onClick={() => removeVariable(variable.identifier)}
                        />
                    </Item>
                ))}
            </Items>

            <div style={{ height: 25 }} />

            <Button onClick={addVariable}>
                New variable
            </Button>
        </Container>
    )
}

const Container = styled.div`
    width: 100%;

    padding: 20px;
    border-radius: 10px;
    border: 2px solid var(--bg-3);

    background-color: var(--bg-0);
`;

const Heading = styled.div`
    color: white;
    font-size: 20px;
`;

const Text = styled.div`
    color: white;
    font-size: 13px;
    line-height: 150%;

    opacity: 0.5;
`;

const Items = styled.div`
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: 7px;
`;

const Item = styled.div`
    width: 100%;

    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 20px;
    align-items: center;
`;

const Identifier = styled.div`
    color: white;
`;

const Result = styled.div`
    color: white;
`;