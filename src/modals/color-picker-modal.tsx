import { SketchPicker } from 'react-color';
import styled from "styled-components";
import { useModal } from '@/hooks/useModal';
import { useState } from 'react';
import { Button } from '@/components/button/button.component';

export const ColorPickerModal = ({ onColorSelected }: { onColorSelected: (color: string) => void }) => {
    const { hideModal } = useModal();
    const [color, setColor] = useState<string>("#fff");

    const onOk = () => {
        onColorSelected(color);
        hideModal();
    }

    return (
        <Container>
            <SketchPicker color={color} onChange={(c) => setColor(c.hex)} />
            <Buttons>
                <Button onClick={onOk}>OK</Button>
                <Button onClick={hideModal}>Cancel</Button>
            </Buttons>
        </Container>
    )
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background-color: var(--bg-1);
    border-radius: 8px;
`;

const Buttons = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
`; 