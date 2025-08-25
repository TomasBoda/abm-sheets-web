import Prism from "prismjs";
import { supportedFunctions } from "@/runtime/functions";
import "@/styles/syntax-highlighting.css";

Prism.languages.spreadsheet = {
    string: {
        pattern: /"(?:[^"]|"")*"/g,
        greedy: true,
    },
    function: {
        pattern: new RegExp(`\\b(?:${supportedFunctions.join("|")})\\b`, "i"),
        greedy: true,
    },
    cell: {
        pattern: /\$?([A-Z]+)\$?([0-9]+)/g,
        greedy: true,
    },
    number: {
        pattern: /\b\d+(\.\d+)?\b/g,
    },
    boolean: {
        pattern: /\b(?:TRUE|FALSE)\b/i,
        greedy: true,
    },
    operator: /[+\-*/^&=<>]/g,
    paren: /[()]/g,
    punctuation: /[,;]/g,
};

interface UseSyntaxHighlightingProps {
    value: string;
}

export const useSyntaxHighlighting = ({
    value,
}: UseSyntaxHighlightingProps) => {
    if (!value.trim().startsWith("=")) {
        return { highlighted: value };
    }

    const highlighted = Prism.highlight(
        value,
        Prism.languages.spreadsheet,
        "javascript",
    );

    return { highlighted };
};
