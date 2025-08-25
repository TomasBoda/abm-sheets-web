import styled from "styled-components";

interface TextFieldSmallProps {
    id?: string;
    value?: string;
    onChange?: (value: string) => void;
    onKeyDown?: (event: any) => void;
    placeholder?: string;
    disabled?: boolean;
    onBlur?: () => void;
}

export const TextFieldSmall = ({
    id,
    value = "",
    onChange,
    onKeyDown,
    placeholder = "Enter text",
    disabled = false,
    onBlur,
}: TextFieldSmallProps) => {
    return (
        <Input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            onBlur={onBlur}
        />
    );
};

const Input = styled.input`
    color: white;
    font-size: 11px;
    font-weight: 400;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;

    outline: none;
    border: 1px solid var(--color-2);

    padding: 5px 12px;
    border-radius: 5px;

    background-color: var(--color-1);

    width: 100%;
    max-width: 150px;
`;
