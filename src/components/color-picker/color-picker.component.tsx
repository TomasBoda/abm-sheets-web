import styled from "styled-components"

interface Props {
    onChange: (color: string) => void;
}

export const ColorPicker = ({ onChange }: Props) => {

    const colors = ["", "rgb(230, 230, 230)", "rgb(240, 198, 198)", "rgb(201, 201, 240)", "rgb(194, 234, 194)"];

    return (
        <Container>
            {colors.map(color => (
                <ColorItem key={color}>
                    <Color $color={color} onClick={() => onChange(color)} />
                </ColorItem>
            ))}
        </Container>
    )
}

const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
`;

const ColorItem = styled.div`
    cursor: pointer;
    transition: all 150ms;

    border-radius: 5px;

    &:hover {
        background-color: var(--color-1);
    }
`;

const Color = styled.div<{ $color: string; }>`
    width: 15px;
    height: 15px;

    margin: 5px;

    border-radius: 100%;

    background-color: ${({ $color }) => $color === "" ? "var(--bg-3)" : $color};
`;