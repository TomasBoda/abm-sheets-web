# Technical Specification

**Project:** ABM Sheets \
**Author:** Bc. Tomáš Boďa \
**Supervisor:** Mgr. Tomáš Petříček, Ph.D.

This document serves as technical specification for the ABM Sheets research project.

## 1. Introduction

ABM Sheets is a web-based application that extends the traditional spreadsheet interface, such as Microsoft Excel, with native support for discrete time steps. It follows the conventions and formula language of traditional spreadsheet interfaces, but introduces a built-in dimension of time. This makes it particularly well-suited for simulations that require state updates over time, especially agent-based simulations, where a population of agents evolves in time based on a set of defined rules.

ABM Sheets does not aim to be a complete, production-ready solution, but rather a proof-of-concept to explore the feasibility of using time semantics in a spreadsheet interface. It targets mainly scientists, researchers and students who work with simulation models and are familiar with spreadsheet tools but may not have extensive programming experience. The objective is to lower the barrier to entry for building dynamic, time-based models using an interface that is both accessible and expressive.

## 2. Background & Motivation

Spreadsheets are among the most widely used tools for data analysis and modeling due to their flexibility and accessibility. They offer a familiar interface based on a two-dimensional grid of cells, which makes them ideal for a broad range of applications. However, their core structural simplicity also introduces limitations, particularly for modeling tasks that extend beyond two dimensions.

Agent-based modeling (ABM) is one such domain that challenges the traditional spreadsheet paradigm. Agent-based models simulate the behavior of individual entities — agents, over time, often requiring to update multiple attributes per agent across discrete time steps. This naturally introduces three dimensions - the population of agents, their attributes, and time. Attempting to represent this three-dimensional structure using traditional spreadsheet systems often results in workarounds, such as duplicating agent-attribute matrices for each individual time step across separate spreadsheets or blocks of cells. These approaches may quickly become difficult to maintain and interpret when the complexity of the model grows.

Since spreadsheets offer an interactive and user-friendly way of modeling simulations, there is a strong motivation to bring agent-based simulations into spreadsheet systems. Therefore, making these systems more compliant with more complex modeling possibilities would significantly lower the barriers to entry for users without programming experience while still supporting powerful and expressive simulation models.

## 3. Core Concepts

### 3.1 Built-in Discrete Time

The core innovation in ABM Sheets is the integration of discrete time as a native feature of the spreadsheet system itself. This addition introduces several fundamental changes to how cells behave and how formulas are interpreted.

First and foremost, cells in ABM Sheets are allowed to reference themselves within their own formulas. When a cell references itself, the retrieved value corresponds to the previous time step. To enable this behavior, each time-dependent cell must be initialized with a starting value, also referred to as the default formula, from which the simulation can evolve over time.

Each cell in ABM Sheets can therefore have two formulas:

- **default formula** - defines the cell's value at the initial time step (t = 1)
- **primary formula** - defines the cell's value in all subsequent time steps (t > 1), potentially referencing its own prior state

If a cell attempts to reference itself without the default formula provided, the evaluation results in an error due to the absence of the initial state.

To define both formulas within a single cell, ABM Sheets uses a dual-assignment syntax - the first `=` represents the default formula, and the second `=` represents the primary formula. If only one formula is provided, it is treated as the primary formula and applies uniformly across all time steps without referencing prior state.

As an example, to define a simple counter that starts at `1` and increments by `1` at each time step, the formula in cell `A1` would be `= 1 = A1 + 1`:

- at time step `1`, `A1` evaluates to `1` (the default formula)
- at time step `2`, `A1` evaluates to `1 + 1 = 2` (the primary formula)
- at time step `3`, `A1` evaluates to `2 + 1 = 3`, and so on

### 3.2 Cell References

In a general spreadsheet model where cells reference themselves arbitrarily, a mechanism to ensure that all cells are evaluated in correct and consistent order must be enforced. For instance, if `A1` references `B1`, the system must make sure to evaluate `B1` prior to `A1` in order for `A1` to have the most up-to-date value of `B1`.

To enforce this ordering, ABM Sheets will employ a topological sorting algorithm that analyzes cell dependencies and determines a valid order of cell evaluation. This guarantees that each cell is evaluated only after all the cells it depends on have been evaluated.

However, this approach may encounter issues when cyclic dependencies exist, e.g. when two or more cells depend on each other in a cyclic manner. For instance:

- cell `A1` with formula `= B1`
- cell `B1` with formula `= A1`

This situation creates a circular dependency, which cannot be sorted topologically and leads to an evaluation error. ABM Sheets will address this issue by using default formulas to break dependency cycles across time steps. By providing the default formula, a cell can be evaluated independently at the first time step, allowing dependent cells to reference their value without forming a dependency loop. For instance:

- `A1` formula is `= 1 = B1`
- `B1` formula is `= A1`

In this situation, `A1` is initialized to `1` at the first time step. As a result, `B1` can safely reference `A1`, and both cells can be evaluated without creating a circular dependency in the current time step. In subsequent time steps, values propagate forward using the topological evaluation order, maintaining consistency and correctness.

## 4. System Overview

ABM Sheets will be a web-based application built purely in TypeScript. The front-end will be built using the [Next.js](https://nextjs.org/) framework, which is an extension of the [React.js](https://react.dev/) library. The spreadsheet's computational engine will be integrated into the client-side application and will execute entirely in the browser. While this limits the computational power of the spreadsheet's engine, it will be designed to be sufficient for small to medium scale models that will be enough for validating the proof-of-concept of ABM Sheets.

## 5. Functional Requirements

Below is a list of functional requirements of the ABM Sheets project:

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

## 6. Non-functional Requirements

- **performance** - the system will be able to handle a grid of 35x35 cells and 100 time steps without significant performance degradation
- **security** - user authentication and the database will be secured using database row-level security measures
- **compatibility** - the system will be compatible with modern web browsers, such as Chrome, Firefox, Edge and Safari

## 7. Formula Language

The formula language in ABM Sheets is designed to closely resemble traditional spreadsheet software, particularly Microsoft Excel, in order to minimize the learning curve for existing users. This ensures that users accustomed to traditional spreadsheet interfaces can quickly adapt to the system while benefiting from the extended capabilities of using discrete time in the models.

### 7.1 Data Types

ABM Sheets recognizes the following data types:

- **number** - a numeric value, either integer or decimal
- **boolean** - a boolean value of either `TRUE` or `FALSE`
- **string** - a string value enclosed in `"..."`
- **cell reference** - a reference to a value of the specified cell (e.g. `A1`)
- **cell range** - a reference to a range of cells (e.g. `A1:A5`)

### 7.2 Cell Reference

To reference a cell, we use its column and row, e.g. `B5`. To fix a column or row, we use the `$` symbol before the column or row, e.g. `$B5`, `B$5` or `$B$5`.

### 7.3 Cell Range

To specify a cell range, we use two cell references delimited by the `:` symbol, e.g. `A1:A5`. This cell range references cells `A1`, `A2`, `A3`, `A4`, `A5`.

### 7.4 Operators

#### 7.4.1 Binary Operators

The formula language supports the following binary operators:

- `+` - numeric addition
- `-` - numeric substraction
- `*` - numeric multiplication
- `/` - numeric division
- `%` - numeric modulo

#### 7.4.2 Relational Operators

The formula language supports the following relational operators:

- `==` - equality
- `!=` - inequality
- `>` - greated than
- `>=` - greater or equal than
- `<` - less than
- `<=` - less or equal than

#### 7.4.3 Unary Operators

The formula language supports the following unary operators:

- `!` - boolean negation
- `-` - numeric negation

### 7.5 Functions

ABM Sheets provides a subset of Microsoft Excel built-in functions.

#### 7.5.1 Logical Functions

The list of logical functions includes `IF`, `AND`, `OR`.

- `IF` - accepts a boolean value (condition), a consequetive value (evaluates if the condition is true) and an alternate value (evaluates if the condition is false)
- `AND` - accepts any number of boolean arguments and returns the result of their conjunction
- `OR` - accepts any number of boolean arguments and returns the result of their disjunction

#### 7.5.2 Cell Functions

The list of cell functions includes `INDEX`, `MATCH`, `MIN`, `MAX`, `SUM`, `AVERAGE`, `COUNT`, `COUNTIF`.

- `INDEX` - accepts a cell range as the first argument and number `n` as the second argument and returns the value of `n`-th cell in the cell range
- `MATCH` - accepts any value as the first argument and a cell range as the second argument and returns the offset of the cell in the cell range that holds the given value (if none is found, `-1` is returned)
- `MIN` - accepts a cell range and returns the minimum numeric value from the cell range
- `MAX` - accepts a cell range and returns the maximum numeric value from the cell range
- `SUM` - accepts a cell range and returns the sum of all numeric values in the cell range
- `AVERAGE` - accepts a cell range and returns the average of all numric values in the cell range
- `COUNT` - accepts a cell range and returns the total number of cells that hold a value in the cell range
- `COUNTIF` - accepts a cell range and any value and returns the total number of cells that hold the provided value in the cell range

#### 7.5.3 Mathematical Functions

The list of mathematical functions includes `ABS`, `FLOOR`, `CEILING`, `POWER`, `MMIN`, `MMAX`, `RAND`, `RANDBETWEEN`, `CHOICE`.

- `ABS` - accepts a numeric value and returns its absolute value
- `FLOOR` - accepts a numeric value and returns its floor value
- `CEILING` - accepts a numeric value and returns its ceiling value
- `POWER` - accepts two numeric values and returns the first argument to the power of the second argument
- `MMIN` - accepts any number of values and returns the minimum value
- `MMAX` - accepts any number of values and returns the maximum value
- `RAND` - returns a random number between `0` and `1`
- `RANDBETWEEN` - accepts two integer arguments and returns a random integer in that range
- `CHOICE` - accepts any number of values and returns a random value of the provided values

#### 7.5.4 String Functions

The list of string functions includes `CONCAT`.

- `CONCAT` - accepts any number of values and returns a concatenated string of the values

#### 7.5.5 Simulation Functions

The list of simulation functions includes `PREV`, `HISTORY`, `SUMHISTORY`, `STEP`.

- `PREV` - accepts a cell reference and returns the cell's value from the previous step
- `HISTORY` - accepts a cell reference and an offset and returns the cell's value from the step in history based on the offset
- `SUMHISTORY` - accepts a cell reference and returns the sum of all numeric historical values of the cell
- `STEP` - accepts the current index of the simulation step (zero-based)

## 8. Architecture

### 8.1 User Interface

The user interface of ABM Sheets will built in the [Next.js](https://nextjs.org/) framework, which is built on top of the [React.js](https://react.dev/) library. For component styling, the [Styled Components](https://styled-components.com/) library will be used.

### 8.2 Engine

The evaluation engine is the "back-end" part of the system (although it still runs in the browser). It is responsible for evaluating cell formulas and returning the computed values. It receives a set of cells and their formulas, forwards them through a set of processors and returns a list of computed values for each cell and time step.

There are four processors through which the cell formulas go through before being fully computed:

1. **lexer** - provides lexical analysis
2. **parser** - provides semantical analysis
3. **runtime** - evaluates the processed formulas
4. **evaluator** - wrapper that manages the processors and handles communication with the spreadsheet interface

#### 8.2.1 Lexer

The lexer receives a raw formula in string format as the input. It iterates over individual characters in the formula and groups them into tokens. A token represents a fundamental, non-divisible unit of the formula language, such as identifier, numeric literal, parenthesis or comma. The lexer's primary purpose is to provide a clean representation of the cell formula, omitting all whitespaces and ommitable characters that do not have any impact on the result. As output, the lexer provides an array of tokens generated from the input formula.

A token has a type and value:

```
export type Token = {
    type: TokenType;
    value: string;
};
```

There are several token types:

```
export enum TokenType {
    Identifier, Number, Boolean, String,
    OpenParen, CloseParen,
    BinOp, RelOp,
    Comma, Dot, Colon,
};
```

#### 8.2.2 Parser

The parser receives an array of tokens and analyses them from the semantical point of view. It can be represented as a finite automaton which validates the correctness of the input, meaning that the formula conforms the grammar rules of the formula language. For instance, it validates that the `+` binary operators has both left and right operands or that a function call starts with an identifier, followed by an open parenthesis, a list of arguments separated by commas, ending with a close parenthesis. As it validates the input, it produces a semantical representation of the formula - an abstract syntax tree (henceforth referred to as the AST). Each node in the AST represents one operation and its children are its operands. If the input formula conforms the grammar rules of the formula language, the parser returns a valid AST.

One possible way to implement this finite automaton of the parser is a top-down recursive descent pushdown automaton. Each function represents one grammar rule being verified and validated and these functions nest to each other, representing the recursive manner of the formula language grammar.

Below is a sample representation of the parser module:

```
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

Each grammar rule returns a node of the AST and combines the results of other grammar rules together to form parts of the AST:

```
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

#### 8.2.3 Runtime

The runtime receives a valid AST as the input. It processes the nodes of the AST recursively and evaluates them one by one. Its ouput is the final computed value of the formula.

Below is a sample representation of the runtime module:

```
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

#### 8.2.4 Evaluator

The evaluator serves as an entry point of the evaluation engine and a wrapper of the above processors. It receives a set of cell formulas and the number of steps as the input. It iterates over the cell formulas and all steps and for each cell and step, it evaluates its formula given the step and stores the computed value to the result object. The output of the evaluator is an object referred to as `History`, which is a map of cell IDs and a list of their computed values for each time step. This object is then used by the spreadsheet interface to render correct values for corresponding cells.

## 9. User Interface

ABM Sheets aims to resemble current spreadsheet interfaces such as Microsoft Excel or Google Sheets as closely as possible. The main part of the user interface is the spreadsheet itself (a grid of cells organized into rows and columns) with a toolbar offering several options to the user.

The `Home` tab will provide several cell styling options, such as changing the cell background colors, font styles as well as clearing cell styles.

![Showcase01](https://raw.githubusercontent.com/TomasBoda/abm-sheets-web/refs/heads/main/public/showcase-01.png)

The `Simulation` tab will provide simulation and stepping controls. The user will be able to navigate through the steps of the simulation and see the cell values change in time.

![Showcase02](https://raw.githubusercontent.com/TomasBoda/abm-sheets-web/refs/heads/main/public/showcase-02.png)

The `Import & Export` tab will provide a possibility to export the current spreadsheet model to a local file as well as import a saved spreadsheet model to ABM Sheets.

![Showcase03](https://raw.githubusercontent.com/TomasBoda/abm-sheets-web/refs/heads/main/public/showcase-03.png)

Apart from the main `/spreadsheet` page, ABM Sheets provides authentication to the users using the sign-in and sign-up pages.

![Showcase04](https://raw.githubusercontent.com/TomasBoda/abm-sheets-web/refs/heads/main/public/showcase-04.png)

![Showcase05](https://raw.githubusercontent.com/TomasBoda/abm-sheets-web/refs/heads/main/public/showcase-05.png)

## 10. Keystrokes

ABM Sheets provides a set of keystrokes that can be used to interact with the system.

### 10.1 Selection

- `Ctrl + A` - selects all cells in the spreadsheet
- `Backspace` - removes cell formulas and cell contents in the current selection

### 10.2 Copy & Paste

- `Ctrl + C` - copies cell formulas and contents from the current selection
- `Ctrl + V` - pastes copied cell formulas and contents into the current selection

### 10.3 Simulation

- `Ctrl + Arrow Right` - increments the simulation step
- `Ctrl + Arrow Left` - decrements the simulation step

### 10.4 Formula

- `Ctrl + Left Mouse Click` - adds the clicked cell ID to the current cell formula

## 11. Authentication & Logging

The system provides a logging functionality used for tracking user behaviour, which will be analysed for the purposes of evaluating the system's performance. The system will also provide user authentication (sign in & sign up) to track session IDs and correctly assign them to system logs.

For both the authentication and the database for logs, [Supabase](https://supabase.com/) will be used, since it offers a JavaScript API library which can be easily integrated to a Next.js project.

### 11.1 Authentication

Authentication will be possible using an e-mail address and a password. After the user creates an account, the account will be stored in the database including the login credentials as well as the user ID. The user IDs will be used to map system logs to sessions.

### 11.2 Logging

The system will asynchronously store logs from user interaction with the spreadsheet interface into the database. Some of the types of logs that will be stored are:

- cell clicks
- cell formula inputs
- button clicks
- keystroke usage

## 12. Limitations & Future Improvements

The following sections specify limitations of the resulting system that may be considered to be implemented/improved in potential future releases.

### 12.1 Evaluation

During each change to a cell formula or value, the spreadsheet is re-evaluated and re-rendered. This may cause performance issues with large spreadsheets, where each evaluation of a time step could take more than 1000 milliseconds. For the purposes of this project, the project will be implemented in a way to be capable of handling spreadsheets of up to 1000x1000 cells.

### 12.2 Formula styling

The system is not expected to support syntax highlighting of the formula language. The system is also not expected to provide code suggestions to the user.

### 12.3 Error reporting

The system will not feature sophisticated error reporting. If there is a syntactical or semantical issue within a cell formula, which results in the cell not being able to be computed, the cell will display a generic `ERROR` message.

## 13. Schedule

The ABM Sheets research project has started in March 2025 and is expected to be finished in September 2025. The individual phases of its development, study and testing are as follows:

- **March 2025** - formative interviews, evaluation of the interviews (~ 10 mandays)
- **April 2025** - prototype preparation and development (~ 12 mandays)
- **May 2025** - prototype development (~ 12 mandays)
- **June 2025** - logging infrastructure, usability study preparation (~ 12 mandays)
- **July 2025** - usability study, further system refinement (~ 25 mandays)
- **August 2025** - usability study, further system refinement (~ 25 mandays)
- **September 2025** - case study development, project write up (~ 25 mandays)

## 14. Team & Collaboration

### 14.1 Team Members

The core team consists of:

- **Tomáš Petříček** - the project's supervisor
- **Tomáš Boďa** - the student (assignee)

The usability study of the research project's resulting software system will be conducted in collaboration with a professor and two students from the University of Regensburg, namely:

- **Raphael Wimmer** - usability study supervisor
- **Tobias Wittl** - student conducting the study
- **Jakob Haimerl** - student conducting the study

The project will be further supported by a Matfyz Summer of Code participant - **Vít Ungermann**, who will help the team with integrating a graphing library into ABM Sheets to better visualize the spreadsheet data.

The project is further supported by **James Geddes** from the Alan Turing Institute in the United Kingdom and **Clemens Klokmose** from the Aarhaus University in Denmark through feedback and consultations about the project's direction and possible improvements.

### 14.2 Organization

The project's development is conducted by Tomáš Boďa and supervised by Tomáš Petříček. The project's progress and further direction is discussed and refined at regular weekly/bi-weekly meetings.

The usability study co-conducted by Raphael Wimmer, Tobias Wittl and Jakob Haimerl is discussed at regular online meetings together with Tomáš Petříček and Tomáš Boďa.

The supporting development of the graphing library by Vít Ungermann is supervised by Tomáš Petříček with the help of Tomáš Boďa. Its direction and progress will be discussed non-regularly based on the current state and needs of the project.
