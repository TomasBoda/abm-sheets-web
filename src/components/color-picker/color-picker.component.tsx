import styled from "styled-components"

interface Props {
    onChange: (color: string) => void;
}

export const ColorPicker = ({ onChange }: Props) => {

    const colors = ["", "rgb(30, 30, 30)", "rgb(52, 45, 45)", "rgb(42, 42, 54)", "rgb(34, 44, 34)"];

    return (
        <Container>
            {colors.map(color => (
                <Color $color={color} onClick={() => onChange(color)} key={color} />)
            )}
        </Container>
    )
}

const Container = styled.div`
    width: 100%;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
`;

const Color = styled.div<{ $color: string; }>`
    width: 15px;
    height: 15px;

    margin: 5px;

    border-radius: 100%;

    background-color: ${({ $color }) => $color === "" ? "var(--bg-3)" : $color};

    cursor: pointer;
`;