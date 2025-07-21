import type { MDXComponents } from "mdx/types";
import styled from "styled-components";

const H1 = styled.h1`
    color: var(--text-1);
    font-size: 35px;
    font-weight: 700;

    margin-bottom: 30px;
`;

const H2 = styled.h2`
    color: var(--text-1);
    font-size: 22px;
    font-weight: 700;

    margin: 15px 0px;
`;

const H3 = styled.h3`
    color: var(--text-1);
    font-size: 18px;
    font-weight: 700;

    margin: 15px 0px;
`;

const A = styled.a`
    color: var(--text);
    text-decoration: underline;
`;

const Em = styled.em`
    color: var(--text-1);
    font-size: 14px;
    font-weight: 400;
    line-height: 160%;

    font-style: italic;

    display: inline-block;
    padding: 15px 20px;
    border-radius: 5px;

    background-color: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
`;

const Code = styled.code`
    color: inherit;
    font-size: 12px;
    font-weight: inherit;
    line-height: 100%;

    display: inline-block;
    padding: 3px 5px;
    border-radius: 5px;

    background-color: rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.2);
`;

const P = styled.p`
    color: var(--text-1);
    font-size: 16px;
    font-weight: 400;
    line-height: 160%;

    margin-bottom: 15px;

    text-align: justify;
`;

const Ul = styled.ul`
    margin: 5px 0px;
`;

const Ol = styled.ol`
    margin-bottom: 15px;
`;

const Li = styled.li`
    color: var(--text-1);
    font-size: 16px;
    font-weight: 400;
    line-height: 160%;

    margin-bottom: 5px;
    margin-left: 15px;
`;

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        h1: ({ children }) => <H1>{children}</H1>,
        h2: ({ children, ...props }) => <H2 {...props}>{children}</H2>,
        h3: ({ children }) => <H3>{children}</H3>,
        p: ({ children }) => <P>{children}</P>,
        em: ({ children }) => <Em>{children}</Em>,
        code: ({ children }) => <Code>{children}</Code>,
        ol: ({ children }) => <Ol>{children}</Ol>,
        ul: ({ children }) => <Ul>{children}</Ul>,
        li: ({ children }) => <Li>{children}</Li>,
        a: ({ children, ...props }) => <A {...props}>{children}</A>,
        ...components,
    };
}
