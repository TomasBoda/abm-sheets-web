import styled from "styled-components";

export const COLOR_PICKER_COLORS = [
    "rgb(245, 245, 245)",
    "#FA9189",
    "#FCAE7C",
    "#FFE699",
    "#F9FFB5",
    "#B3F5BC",
    "#9ae1f5",
    "#E2CBF7",
    "#D1BDFF",
];

interface Props {
    onChange: (color: string) => void;
}

export const ColorPicker = ({ onChange }: Props) => {
    return (
        <Container>
            {COLOR_PICKER_COLORS.map((color) => (
                <ColorItem key={color}>
                    <Color $color={color} onClick={() => onChange(color)} />
                </ColorItem>
            ))}
        </Container>
    );
};

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

const Color = styled.div<{ $color: string }>`
    width: 15px;
    height: 15px;

    margin: 5px;

    border-radius: 100%;

    background-color: ${({ $color }) =>
        $color === "" ? "var(--bg-3)" : $color};
`;
