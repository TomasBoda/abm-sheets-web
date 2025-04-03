import { Button } from "@/components/button/button.component";
import { variables } from "@/components/spreadsheet/spreadsheet.component";
import { TextField } from "@/components/text-field/text-field.component";
import { Parser } from "@/parser/parser";
import { Runtime } from "@/parser/runtime";
import { useState } from "react";
import styled from "styled-components";

export const AddVariableModal = ({ hideModal }: { hideModal: () => void }) => {

    const [identifier, setIdentifier] = useState<string>("");
    const [formula, setFormula] = useState<string>("");

    const define = () => {
        if (identifier.trim() === "" || formula.trim() === "") {
            return;
        }

        const expression = new Parser().parse(formula.substring(1));
        const result = new Runtime().runExpression(expression);
        variables.set(identifier.trim(), result);
        hideModal();
    }

    return (
        <Container>
            <Heading>
                Add variable
            </Heading>

            <div style={{ height: 15 }} />

            <Text>
                Define custom constant variables that you can use within your spreadsheet as global variables.
            </Text>

            <div style={{ height: 15 }} />

            <TextField
                value={identifier}
                onChange={setIdentifier}
                placeholder="Enter identifier"
            />

            <div style={{ height: 10 }} />

            <TextField
                value={formula}
                onChange={setFormula}
                placeholder="Enter formula"
            />

            <div style={{ height: 25 }} />

            <Button onClick={define}>
                Save variable
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