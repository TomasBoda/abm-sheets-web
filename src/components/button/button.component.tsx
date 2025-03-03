import styled from "styled-components";

export interface ButtonProps {
    children: any;
    onClick?: () => void;
}

export const Button = ({ children, onClick }: ButtonProps) => {

    return (
        <Container onClick={onClick}>
            {children}
        </Container>
    )
}

const Container = styled.div`
    min-width: 70px;

    color: var(--bg-1);
    font-size: 12px;
    font-weight: 400;
    line-height: 100%;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 6px;

    padding: 8px;

    border: 2px solid var(--text-1);
    border-radius: 7px;

    transition: all 100ms;
    cursor: pointer;

    background-color: var(--text-1);

    &:hover {
        background-color: var(--text-2);
        border-color: var(--text-2);
    }
`;