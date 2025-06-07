
# Technical Specification

| Project    | Author         | Supervisor                 | Date          | Version |
| ---------- | -------------- | -------------------------- | ------------- | ------- |
| ABM Sheets | Bc. Tomáš Boďa | Mgr. Tomáš Petříček, Ph.D. | May 11, 2025  | 1.0     |

## 1. Introduction

This document serves as technical specification for the ABM Sheets research project.

ABM Sheets is a web-based application that enables users to create simulation models using a spreadsheet interface similar to Microsoft Excel or Google Sheets. In comparison to other known spreadsheet interfaces, the main benefit of ABM Sheets is that it extends the spreadsheet model with built-in support for discrete time, which enables a step-wise execution of the model. Cells can reference themselves inside their formulas and their new values are calculated based on values in the previous steps. This adds a new dimension of time to the models and may be beneficial for many types of simulations which are difficult to model using traditional spreadsheet software systems.

ABM Sheets does not aim to be a complete, production-ready solution. It rather serves as a proof-of-concept of using discrete time in spreadsheet interfaces to handle more complex simulations. It is intended for scientists, researchers and students specializing in simulation modeling and spreadsheet software with the purpose of evaluating the idea of adding time to spreadsheet interfaces.

## 2. Background & Motivation

Some types of models and simulations require multiple dimensions. One example is agent-based models, where there is a need for a list of agents, a set of attributes for each agent, and time, through which the model evolves. In an agent-based model, each agent's attributes are recalculated in each time step based on the current state of the model. This paradigm introduces three dimensions to the model - the dimension of agents, agent attributes and discrete time. This is, however, difficult to model in current spreadsheet interfaces, since spreadsheets provide only a two-dimensional grid of cells. If we wanted to map an agent-based model to a two-dimensional grid, we would need to duplicate the first two dimensions for each entity of the third dimension. For instance, if we choose to represent rows as agents and columns as their attributes, each time step needs be represented by a replicated table of agents and their attributes with new, updated values. This is very inconvenient for larger and more complex models.

This is where the idea of ABM Sheets come into play. It introduces built-in discrete time, which hides the third dimension of time into the spreadsheet itself. In this way, cells can reference themselves in their formulas, taking their value from the previous step and calculating their new values based on their previous values. This adds the possibility of modeling three-dimensional simulations inside a two-dimensional spreadseet, opening new possibilities of robust modeling. The goal of ABM Sheets is to simplify modeling complex simulations using a well-known spreadsheet interface, familiar to many non-programmers working with Microsoft Excel or similar spreadsheet interfaces on daily basis.

## 3. System Overview

ABM Sheets will be a web-based application built purely in TypeScript. It's front-end will be built in the Next.js framework, which is an extension of the React.js library. The computational engine of the spreadsheet will be a part of the project and will run purely in the browser. Its performance should be sufficient for simpler simulations that are used to validate this proof-of-concept.

## 4. Functional Requirements

Below is a list of functional requirements of the software system:

1. the system provides a two-dimensional grid of cells to the user

2. the system allows the user to input a static, plain text value to a cell
3. the system allows the user to input a formula to a cell, which is automatically calculated
    - a formula always starts with the `=` symbol
    - a formula with two `=` symbols is interpreted as follows:
        - formula after the first `=` symbol is the initial, default value of the cell which is used in step `1`
        - formula after the second `=` symbol is the formula which is used in steps `2...n`
    - the formulas can be written using Excel-like formula language specified in the next section

4. the system allows the user to step through the steps of the simulation
    - in each step, newly calculated values are displayed in the corresponding cells
5. the system allows the user to set the maximum number of steps of the simulation
6. the system allows the user to reset the current step to step `1` (the first step)

7. the system allows the user to export the current model to a local `.json` file
8. the system allows the user to import a model in `.json` format

9. the system allows the user to import a `.csv` file to a specific cell as static data
    - the user specifies the name of the column to be used from the `.csv` file
    - as the user steps through the simulation, the values change based on the data of the `.csv` file columns

10. the system allows the user to make a multi-cell selection
    - cells in the selection will be highlighted
11. the system allows the user to copy all values/formulas of cells in the selection
12. the system allows the user to paste all copies values/formulas of cells in the selection to the current selected cell/cells
    - all cell references in the cell formulas are shifted based on the offset from the copied cells to the pasted cells
13. the system allows the user to remove all values/formulas from cells in the selection

14. the system allows the user to drag a selection of cells to either bottom or right to copy and paste cell contents to other cells
    - all cell references in the cell formulas are shifted based on the offset from the copied cells to the pasted cells

15. the system allows the user to change the background color of cells in the selection to one of the provided colors
16. the system allows the user to change the font type of cells in the selection to one of - `bold`/`italic`/`normal`
17. the system allows the user to clear all styling of cells in the selection

18. the system re-evaluates the cells on each change
    - on each cell formula change
    - on each cell value change

## 5. Formula Language

The formula language in ABM Sheets directly copies the formula language of Microsoft Excel to make the transition to ABM Sheets easier for Microsoft Excel users.

### 5.1 Formulas

To define a cell formula, the user needs to type in the `=` symbol followed by the actual formula expression. In ABM Sheets, there are two types of formulas:

1. default formula
2. primary formula

If the cell input contains only one `=` symbol, it is treated as a primary formula only. This formula is used in all steps of the simulation. If the cell input contains two `=` symbols, the formula after the first `=` symbol is treated as the default formula, whereas the formula after the second `=` symbol is treated as the primary formula.

The main difference is that the default formula, if specified, is used in the first simulation step only. After the first step, all consequetive steps use the primary formula. The reason behind introducing default formula's is the possibility to self-reference a cell. If cell `A1` references itself in its formula, the cell's value from the previous step needs to be used in the evaluation of the current step. Therefore, all cells that reference themselves in their primary formulas need to have the default formula provided.

For instance, suppose cell `A1` with the input formula being `= 1 = A1 + 1`.
    - in the first step, `A1` has value `1`
    - in the second step, it takes its previous value and adds `1` to it, so it becomes `2`
    - in the third step, it takes the previous value `2` and adds `1` to it, so it becomes `3`

If the default formula was not provided, `A1` could not take the previous value of `A1` in the first step, since it would not exist, resulting in an error.

Moreover, if there is a cyclic dependency, for instance:
    - `A1` formula is `= B1`
    - `B1` formula is `= A1`

This situation cannot be sorted topologically, resulting in an error. However, if one of these cells had a default formula provided, it would break the cycle in the topological sort and could be evaluated. For instance:
    - `A1` formula is `= 0 = B1`
    - `B1` formula is `= A1`

In this situation, `A1` is evaluated first, holding the value of `0`, then `B1` is evaluated, taking the value `0` from `A1`.

If a cell references itself, the reference always takes the cell's previous value. If a cell references some other cell, the reference always takes the current value of the referenced cell. This is made possible thanks to the built-in topological sorting algorithm, which sorts the cells in a topological ordering in which they should be evaluated. If there is no topological ordering possible, an error is shown to the user and the user must first fix the formulas in order to run the simulation. Moreover, there is a built-in `prev` function in the formula language, making it possible to explicitely take the previous value of the referenced cell. If the user wants to take a value further from history, there is the `history` function which can be used. These functions are introduced later in the specification.

### 5.2 Cell References

A cell can reference another cell in its formula by using its identifier (row and column), for instance `C6`.

Cell references can also be fixed. The user can fix either the column or the row of the reference. If any of these is fixed, it will not shift the reference when copying or dragging the cell. To fix a column or a row, use the `$` sign before the column or the row. For instance:
    - `$C6` fixes the column `C`
    - `C$6` fixes the row `6`
    - `$C$6` fixes both the row and the column

### 5.3 Operators

#### 5.3.1 Binary Operators

The formula language supports the following binary operators:

- `+` - numeric addition
- `-` - numeric substraction
- `*` - numeric multiplication
- `/` - numeric division
- `%` - numeric modulo

#### 5.3.2 Relational Operators

The formula language supports the following relational operators:

- `==` - equality
- `!=` - inequality
- `>` - greated than
- `>=` - greater or equal than
- `<` - less than
- `<=` - less or equal than

#### 5.3.3 Unary Operators

The formula language supports the following unary operators:

- `!` - boolean negation
- `-` - numeric negation

### 5.4 Functions

ABM Sheets provides a subset of Microsoft Excel built-in functions.

#### 5.4.1 Logical Functions

The list of logical functions includes `IF`, `AND`, `OR`.

- `IF` - takes in a boolean value (condition), a consequetive value (condition is true) and an alternate value (condition is false)
- `AND` - takes any number of boolean arguments and returns the result of their conjunction
- `OR` - takes any number of boolean arguments and returns the result of their disjunction

#### 5.4.2 Cell Functions

The list of cell functions includes `INDEX`, `MATCH`, `MIN`, `MAX`, `SUM`, `AVERAGE`, `COUNT`, `COUNTIF`.

- `INDEX` - takes a cell range as the first argument and number `n` as the second argument and returns the value of `n`-th cell in the cell range
- `MATCH` - takes any value as the first argument and a cell range as the second argument and returns the offset of the cell in the cell range that holds the given value (if none is found, `-1` is returned)
- `MIN` - takes a cell range and returns the minimum numeric value from the cell range
- `MAX` - takes a cell range and returns the maximum numeric value from the cell range
- `SUM` - takes a cell range and returns the sum of all numeric values in the cell range
- `AVERAGE` - takes a cell range and returns the average of all numric values in the cell range
- `COUNT` - takes a cell range and returns the total number of cells that hold a value in the cell range
- `COUNTIF` - takes a cell range and any value and returns the total number of cells that hold the provided value in the cell range

#### 5.4.3 Mathematical Functions

The list of mathematical functions includes `ABS`, `FLOOR`, `CEILING`, `POWER`, `MMIN`, `MMAX`, `RAND`, `RANDBETWEEN`, `CHOICE`.

- `ABS` - takes a numeric value and returns its absolute value
- `FLOOR` - takes a numeric value and returns its floor value
- `CEILING` - takes a numeric value and returns its ceiling value
- `POWER` - takes two numeric values and returns the first argument to the power of the second argument
- `MMIN` - takes any number of values and returns the minimum value
- `MMAX` - takes any number of values and returns the maximum value
- `RAND` - returns a random number between `0` and `1`
- `RANDBETWEEN` - takes two integer arguments and returns a random integer in that range
- `CHOICE` - takes any number of values and returns a random value of the provided values

#### 5.4.4 String Functions

The list of string functions includes `CONCAT`.

- `CONCAT` - takes any number of values and returns a concatenated string of the values

#### 5.4.5 Simulation Functions

The list of simulation functions includes `PREV`, `HISTORY`, `SUMHISTORY`, `STEP`.

- `PREV` - takes a cell reference and returns the cell's value from the previous step
- `HISTORY` - takes a cell reference and an offset and returns the cell's value from the step in history based on the offset
- `SUMHISTORY` - takes a cell reference and returns the sum of all numeric historical values of the cell
- `STEP` - returns the current index of the simulation step (zero-based)

## 6. Architecture

### 6.1 User Interface

The user interface of the system will built in the [Next.js](https://nextjs.org/) framework, which is built on top of the [React.js](https://react.dev/) library. It uses React.js components styled using the [Styled Components](https://styled-components.com/) library. For authentication and logging, [Supabase](https://supabase.com/) will be used.

### 6.2 Engine

The evaluation engine is the "back-end" part of the system (although it still runs in the browser). It is responsible for evaluating the cell formulas and returning the calculated values. It receives a set of cells and their formulas, forwards them through a set of processors and returns a list of calculated values for each cell and time step.

There are four processors through which the cell formulas go through before being fully evaluated:

1. **lexer** - provides lexical analysis
2. **parser** - provides semantical analysis
3. **runtime** - evaluates the formulas
4. **evaluator** - wrapper that handles cells and time steps

#### 6.2.1 Lexer

The lexer receives a raw formula in string format as the input. It iterates over the characters of the formula and groups them into tokens. A token represents a single, non-divisible unit of the formula language, such as identifier, numeric literal, parenthesis, comma and so on. Its primary purpose is to provide a clean representation of the cell formula, omitting all whitespaces and non-significant characters that do not have any impact on the result. Its output is an array of tokens generated from the input formula.

A token consists of a specific type and raw, string value:

```ts
export type Token = {
    type: TokenType;
    value: string;
};
```

Below are the possible token types:

```ts
export enum TokenType {
    Identifier, Number, Boolean, String,
    OpenParen, CloseParen,
    BinOp, RelOp,
    Comma, Dot, Colon,
};
```

#### 6.2.2 Parser

The parser receives an array of tokens and analyses it from the semantical point of view. It is a finite automaton which validates the correctness of the input, meaning that the formula conforms the grammar rules of the formula language. For instance, it validates that the `+` binary operators has both left and right operands or that a function call starts with an identifier, followed by an open parenthesis, a list of arguments separated by commas, finally ending with a close parenthesis. As it validates the input, it produces a semantical representation of the formula - an abstract syntax tree (henceforth referred to as the AST). Each node in the AST represents one operation and its children are its operands. If the formula conforms the grammar rules of the formula language, the parser returns a valid AST.

One possible way to implement this finite automaton validating the input formula and producing the AST is a top-down recursive descent pushdown automaton. Each function represents one grammar rule being verified and these functions nest to each other, representing the recursive manner of the formula language grammar.

Below is an example representation of the parser module:

```ts
export class Parser {

    public parse(formula: string): Expression {
        ...
        return this.parseExpression();
    }

    private parseExpression(): Expression {
        return this.parseAdditiveExpression();
    }

    private parseAdditiveExpression(): Expression { ... }

    private parseMultiplicativeExpression(): Expression { ... }

    ...

    private parseCallExpression(): Expression { ... }

    private parsePrimaryExpression(): Expression { ... }
}
```

Each grammar rule returns a node of the AST and combines the results of other grammar rules together to form the whole AST:

```ts
export interface BinaryExpression extends Expression {
    type: NodeType.BinaryExpression;
    left: Expression;
    right: Expression;
    operator: string;
}

export interface CallExpression extends Expression {
    type: NodeType.CallExpression;
    identifier: string;
    args: Expression[];
}

...
```

#### 6.2.3 Runtime

The runtime receives a valid AST as its input. It goes through the nodes of the AST recursively and evaluates them one by one. Its ouput is the final, calculated value of the formula.

Below is an example representation of the runtime module:

```ts
public class Runtime {

    public runFormula(expression: Expression): string {
        const value = this.runExpression(expression);
        ...
        return parsedResult;
    }

    private runExpression(expression: Expression): Value {
        switch (expression.type) {
            case NodeType.BinaryExpression:
                return this.runBinaryExpression(expression as BinaryExpression);
            case NodeType.CallExpression:
                return this.runCallExpression(expression as CallExpression);
            ...
        }
    }

    private runBinaryExpression(expression: BinaryExpression): Value { ... }

    private runCallExpression(expression: CallExpression): Value { ... }

    ...
}
```

#### 6.2.4 Evaluator

The evaluator serves as an entry point of the evaluation engine and a wrapper of the above processors. It receives a set of cells and the number of steps as the input. It iterates over all cells and all steps and for each cell and step, it evaluates its formula given the step and stores it to the result. The output of the evaluator is an object referred to as `History`, which is a map of cell IDs and a list of their calculated values for each time step. This object is then used by the front-end part of the system to render correct values to correct cells in the spreadsheet interface.

```ts
public class Evaluator {

    public evaluateCells(cells: CellId[], steps: number) {
        const history: History = new Map();

        for (let step = 0; step < steps; step++) {
            for (const cellId of cells) {
                const result = this.evaluateCell(cellId, step, history);

                if (!result) {
                    continue;
                }

                history.set(cellId, [...history.get(cellId), result]);
            }
        }

        return history;
    }

    ...
}
```

## 7. Key Algorithms and Logic

### 7.1 Topological Sorting

Before the evaluation of cells begins, the cells will be sorted topologically in the order they are going to be evaluated in. This is due to the fact that when a cell references some other cell, it must be evaluated after the referenced cell in order to have the most up-to-date value of the referenced cell. If the cells were not sorted topologically before the evaluation beings, cells could hold outdated values and the simulation would not provide correct results to the user.

The logic of the topological sorting is illustrated by the following example:

- if cell `A1` references cell `B1`, `B1` is evaluated before `A1`
- if cell `A1` references cell `B1` and cell `B1` references cell `A1`, the system throws an error
- if cell `A1` references cell `B1` and cell `B1` references cell `A1` and `A1` has a default formula provied, `A1` is evaluated before `B1`

To sort the cells topologically, the system will first extract cell references from formulas and create a dependency graph. This dependency graph is then forwarded to the topological sorting algorithm, which either returns an array of cell IDs in the order in which they should be evaluated, or it throws an error. If an error is thrown, no topological ordering has been found.

## 8. Keystrokes

The user will be able to use several keystrokes to control the spreadsheet interface.

### 8.1 Selection

- `Ctrl + A` - selects all cells in the spreadsheet
- `Backspace` - removes cell formulas and contents in the current selection

### 8.2 Copy & Paste

- `Ctrl + C` - copies cell formulas in the current selection
- `Ctrl + V` - pastes copied cell formulas to the current selection

### 8.3 Simulation

- `Ctrl + Arrow Right` - goes to next simulation step
- `Ctrl + Arrow Left` - goes to previous simulation step

### 8.4 Formula

- `Ctrl + Left Mouse Click` - adds the clicked cell ID to the current formula

## 9. Authentication & Logging

The system will feature logging functionality used for evaluating user behaviour, which will be helpful in the data analysis of the system performance. For separating logs for different users, the system will provide user authentication (sign in & sign up) to separate session IDs and corresponding logs.

For both the authentication and the database for logs, [Supabase](https://supabase.com/) will be used, since it offers a JavaScript API library which can be easily integrated to a Next.js project.

### 9.1 Authentication

Authentication will be possible using an e-mail address and a password. After the user created an account, the account will be stored in the database including the login credentials as well as the user ID. The user IDs will be used to map logs to sessions.

### 9.2 Logging

The system will asynchronously store logs from user interaction with the spreadsheet interface into the database. Some of the types of logs that will be stored are:

- clicking on a cell
- inputting text to a cell
- clicking on toolbar or simulation buttons

## 10. Limitations & Future Improvements

The following sections specify limitations of the resulting system that may be considered to be implemented/improved in potential future releases.

### 10.1 Evaluation

For any change to any cell formula, the evaluation engine will evaluate all used cells (cells with formulas) and all steps at once. This has the benefit that the simulation does not need to reset to step 1 after each change and the values in subsequent steps will be displayed to the user instantly. Although this implementation will not be very performant for large spreadsheet with hundreds of cells and steps, it will be sufficient for smaller spreadsheets used in conceptual evaluation of the software system.

### 10.2 Formula styling

The system is not expected to support syntax highlighting of the formula language. The system is also not expected to provide code suggestions to the user.

### 10.3 Error reporting

The system will not feature sophisticated error reporting. If there is a syntactical or semantical issue with a formula, which results in the cell not being able to be calculated, the cell will show a generic `ERROR` message.
