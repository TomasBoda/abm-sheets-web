# Technical Documentation

**Project**: ABM Sheets \
**Author**: Bc. Tomáš Boďa \
**Supervisor**: Mgr. Tomáš Petříček, Ph.D.

## Abstract

Spreadsheets are powerful tools for data analysis and modeling, but they are inherently limited to two dimensions - rows and columns, making it difficult to represent systems that evolve over time. This limitation poses challenges for domains like agent-based modeling, physics simulations, or financial market analysis, where the concept of time is fundamental. In particular, agent-based models require tracking multiple agents, each with evolving attributes, across discrete time steps - something traditional spreadsheets struggle to express without resorting to duplication and convoluted formulas. We address this limitation by extending the spreadsheet paradigm with a built-in support for discrete time, allowing cells to reference their own values from previous time steps directly. This extension preserves the familiar spreadsheet paradigm while adding a powerful new dimension of time. With this approach, users can build and explore dynamic models, such as agent-based simulations with the same ease as traditional spreadsheet calculations.

## Introduction

- purpose of the software
- scope of the system
- target audience

### Purpose of the Software

Spreadsheets are among the most widely used tools for data analysis, planning, and modeling due to their flexibility, accessibility, and low barrier to entry. They offer a familiar interface based on a two-dimensional grid of cells, which makes them ideal for a broad range of applications, from financial modeling to project management and scientific calculations. However, their core structural simplicity also introduces limitations, particularly when representing models that extend beyond two dimensions.

ABM Sheets focuses on extending the traditional spreadsheet paradigm with discrete time. There are multiple domains where discrete time simulations are ubiquitous. Those include physics simulations, agent-based models or financial market analyses. The typical way of modeling time in spreadsheets is to reserve one of the available dimensions (e.g. rows) for modeling time steps. However, this approach leaves the spreadsheet with only one dimension for other aspects of the model, eventually making it difficult to model more complex domains.

ABM Sheets addresses this problem by extending the spreadsheet paradigm with built-in support for discrete time. In ABM Sheets, cells can reference themselves, calculating their new values from values in the previous steps. Moreover, the user can step through time steps and see the cell contents recalculate and change in time. This simple extension introduces a new dimension to the spreadsheet, extending its expressive power and opening doors to new kinds of simulations, which are difficult to model in traditional spreadsheet interfaces.

### Scope of the System

ABM Sheets aims to resemble traditional spreadsheet interfaces, such as Micorosft Excel or Google Sheets. However, it does not aim to fully replace all functionality offered by current spreadsheet software. It offers a core subset of features of traditional spreadsheet systems and an essential subset of functions offered by their formula languages. However, some advanced features might not be available. Furthermore, due to the built-in support for discrete time, several additions in terms of features and language functions are introduced to fully support the integration of time in ABM Sheets.

### Target Audience

ABM Sheets is aimed primarily for scientists with at least some background in spreadsheets, simulations, modeling, prototyping, mathematics, computer science, economics or physics. It is not aimed at users with no technical background, since it might be overwhelming to understand the notion of time and its behaviour in spreadsheets without understanding spreadsheets or other form of interactive programming systems.

## System Overview

### High-level Architecture

ABM Sheets is a web-based application written in [TypeScript](https://www.typescriptlang.org/). It is composed of three main components:

- front-end - spreadsheet interface, toolbar, user interaction
- engine - parses and evaluates cell formulas (lexer, parser, runtime, evaluator)
- database - used for authentication, logging and storing user-created projects

### Main Features

ABM Sheets is designed to resemble traditional spreadsheet interfaces such as Microsoft Excel or Google Sheets as closely as possible. It attempts to follow the same GUI layout, interaction patterns, formula language syntax and supported functions.

The main feature of ABM Sheets is the built-in support for discrete time, resulting in the following features:

- ability to self-reference a cell without evaluation errors
- cell values change in time due to their self-referencing nature
- ability to step through time steps and see changes in the spreadsheet
- use cell ranges and time ranges interchangeably

Some of the minor features include:

- the user can create an account and sign in using their credentials
- the user can create, update, clone and delete projects
- the user can share their projects

#### Discrete Time

The core innovation in ABM Sheets is the integration of discrete time as a native feature of the spreadsheet environment. This addition introduces several fundamental changes to how cells behave and how formulas are interpreted.

Most notably, cells in ABM Sheets are allowed to reference themselves within their own formulas. When a cell references itself, the value retrieved corresponds to the cell's value in the previous time step. To enable this behavior, each self-dependent cell must be initialized with a starting value (referred to as the default formula) from which the simulation can evolve over time.

Each cell in ABM Sheets can therefore have one or two formulas:

- **default formula** (optional) - defines the cell's value at the initial time step (t = 1)
- **primary formula** (mandatory) - defines the cell's value in all subsequent time steps (t > 1), potentially referencing its own prior state or the states of other cells

If a cell attempts to reference itself without the default formula defined, the evaluation results in an error due to the absence of an initial state.

To define both formulas within a single cell, ABM Sheets uses a dual-assignment syntax - the first `=` introduces the default formula, and the second `=` introduces the primary formula. If only one formula is provided, it is treated as the primary formula and applies uniformly across all time steps without referencing prior state.

To define a simple counter that starts at `1` and increments by `1` at each time step, the formula in cell `A1` could be `= 1 = A1 + 1`:

- at time step `1`, `A1` evaluates to `1` (the default formula)
- at time step `2`, `A1` evaluates to `1 + 1 = 2` (the primary formula)
- at time step `3`, `A1` evaluates to `2 + 1 = 3`, and so on

#### Cell References

In a spreadsheet model where cells reference themselves arbitrarily, a mechanism to ensure that all cells are evaluated in correct and consistent order must be enforced. For instance, if `A1` references `B1`, the system must make sure to evaluate `B1` prior to `A1` in order for `A1` to have the most up-to-date value of `B1`.

To enforce this ordering, ABM Sheets employs a topological sorting algorithm that analyzes cell dependencies and determines a valid evaluation sequence. This guarantees that each cell is computed only after all the cells it depends on have been evaluated.

However, this approach can encounter issues when cyclic dependencies exist — when two or more cells depend on each other either directly or indirectly. For instance:

- cell `A1` with formula `= B1`
- cell `B1` with formula `= A1`

This configuration creates a circular dependency, which prevents topological sorting and leads to an evaluation error. ABM Sheets addresses this problem by leveraging default formulas to break dependency cycles across time steps. By providing an initial value through a default formula, a cell can be evaluated independently at the first time step, allowing dependent cells to reference its value without forming an immediate cycle. For instance:

- `A1` formula is `= 1 = B1`
- `B1` formula is `= A1`

In this revised configuration, `A1` is initialized to `1` at the first time step. As a result, `B1` can safely reference `A1`, and both cells can be evaluated without creating a circular dependency in the current time step. In subsequent time steps, values propagate forward using the established evaluation order, maintaining consistency and correctness.

This mechanism allows ABM Sheets to support recursive and interdependent cell logic while preserving the integrity of the simulation across discrete time steps.

#### Cell & Time Ranges

In traditional spreadsheet interfaces, some functions accept cell ranges as arguments. These are usually defined using the syntax `<CELL_ID>:<CELL_ID>`, e.g. `A5:A15`. ABM Sheets builds on this idea and further extends ranges to support time ranges as well.

A cell range typically evaluates to an array of cell references that are within the cell range bounds. For instance, cell range `A5:A10` evaluates to a list of cells `A5`, `A6`, `A7`, `A8`, `A9` and `A10`. These cell references are then evaluated to values that these cells hold, eventually resulting in an array of values. Since the core inovation in ABM Sheets is built-in time, we have explored the idea of generalizing ranges in spreadsheets to time ranges as well, meaning an array of historical values of a given cell.

ABM Sheets provides a new language function `TIMERANGE`, which accepts in a cell reference and a number of time steps to reference. This produces an array of values, same as the traditional cell range literal and these values correspond to a subset of historical values of the given cell, spanning from the current time step to the time step of the second argument. Thanks to this, ABM Sheets can work with ranges as general objects, either as results of cell range literals or timelapse objects. As a result, all functions that take cell range arguments, such as `SUM`, `AVERAGE`, `MIN`, etc. now accept these generalized range values, which they are now able to evaluate without any differences.

For instance, imagine a cell that represents a value of a trading asset (e.g. a stock or a cryptocurrency) and changes in time thanks to the ABM Sheets' built-in time support. Using time ranges, we can calculate the average value of the given asset in the last 10 time steps using the `AVERAGE` function as follows:

- `B1` holds the asset value
- `B2` calculates the average asset value in the last 10 time steps - `= AVERAGE(TIMERANGE(B1, 10))`

We see the introduction of time ranges as a natural addition to ABM Sheets to intergate and work with time as a built-in feature of the spreadsheet interface directly using the well-know spreadsheet language formulas.

### Technology Stack

ABM Sheets is built primarily in TypeScript using the following tools and frameworks:

- [Next.js](https://nextjs.org/) for front-end
- [Styled Components](https://styled-components.com/) for styling
- [Supabase](https://supabase.com/) for database and authentication

## System Requirements

- hardware & software requirements
- dependencies (framework version, APIs, etc.)

## Architecture & Design

- UML diagrams (class diagram, sequence diagram, component diagram, etc.)
- data model (ER diagrams, database schema)
- key design decisions & rationale

## Implementation Details

- module descriptions (what each does)
- important algorithms or workflows
- API documentation (if relevant)
- configuration files / environment setup

### Main Components

ABM Sheets is composed of the following modules:

- front-end - spreadsheet interface, toolbar, graphs, user interactions
- engine - parses and evaluates cell formulas (lexer, parser, runtime, evaluator)

#### Spreadsheet

The spreadsheet interface is the most important part of the front-end module. It renders a grid of cells which the user can interact with. The spreadsheet grid consists of rows and columns, labeled by numbers and letters respectivelly.

Currently, ABM Sheets supports up to `1,000` rows and `1,000` columns, resulting in the total of `1,000,000` cells. This large amount of cells is difficult for browsers to render without any performance issues. In fact, during the development of ABM Sheets, it took about `10` seconds to render these cells. Further interactions with the rendered cells resulted in an unusable product and it needed vast optimizations to make it work.

Due to these issues, an algorithm that effectively selects which cells to render is employed to ensure smooth user experience. First and foremost, the number of cells that are rendered on the user's screen is limited by the size of their computer screen (not taking into account browser zooming). This implies that the browser only needs to render cells that are visible. One option is to track cells that are visible and only render these cells, omitting all other cells that are out of the viewport. However, listening to website scroll changes for each cell, or using complex calculations for the cell boundaries would be inefficient. Therefore, the spreadsheet is divided into smaller panels, each representing a subgrid of cells in the spreadsheet. Each panel tracks its intersection with the viewport and is rendered onto the DOM only if it becomes visible. The size of one panels corresponds roughly to the size of the viewport. This implies that in one particular moment, a maximum of `4` panels is rendered by the browser. In this way, only a small portion of the spreadsheet cells is handled by the browser's rendering engine, no matter the size of the spreadsheet, optimizing its performance and making the spreadsheet usable.

The spreadsheet module consists of two primary components:

- `SpreadsheetComponent` - generic spreadsheet rendered
- `SpreadsheetWrapper` - application-specific interaction logic

`SpreadsheetComponent` is a generic component that is responsible for handling the rendering of the cells together with the above mentioned optimizations. It takes in a parameter of type `ReactNode` corresponding to the cell component to render onto the spreadsheet. Inside this component's logic there is a React hook called `useRenderedPanels` that is subscribed to scrolling events and returns an array of visible panels that the spreadsheet should render. The `SpreadsheetComponent` then iterates over all panels, renders only panels that are visible to the user and for each panel renders an array of cells, substituting the rendered DOM element by the user-defined cell element.

`SpreadsheetWrapper` is an application-specific component that uses the `SpreadsheetComponent` to render the spreadsheet. It defines all user interaction handles, such as cell clicks, double clicks, cell selection, cell styling, etc. This is the primary component of the front-end module where most of the interaction logic lies.

#### Engine

The evaluation engine is a module that is responsible for parsing and evaluating cell formulas. It takes in an array of cell IDs and the number of steps of the simulation and evaluates each cell for each time step. Its output is a `History` object, which is a map of cell IDs and their calculated values for each time step. This object is then passed to the spreadsheet interface and rendered in the corresponding cells.

```ts
export type History = Map<CellId, Value[]>;
```

The engine module's entry point is the `Evaluator` which is a pipeline of three primary processors:

- `Lexer` - performs lexical analysis of a cell's formula
- `Parser` - validates and recursively builds the abstract syntax tree (AST) of a cell's formula
- `Runtime` = recursively traverses a cell's formula's AST and evaluates it

##### Lexer

`Lexer` is a processor responsible for the lexical analysis of a cell's formula. It accepts a cell's formula in a plain `string` format and produces an array of tokens of the formula language. A token is a single, non-dividable unit of the formula language, such as a numeric literal, identifier, comma, etc.

```ts
export enum TokenType {
    Identifier = "Identifier",
    Number = "Number",
    Boolean = "Boolean",
    String = "String",
    OpenParen = "OpenParen",
    CloseParen = "CloseParen",
    ...
}

export type Token = {
    type: TokenType;
    value: string;
};
```

If the lexer comes across a value that is not recognized by the formula language, it produces a syntax error. If no syntax errors are found, the `Lexer` returns an array of tokens and delegates them to the following processors for further analysis and transformations.

##### Parser

`Parser` is a processor responsible for the semantical analysis of a cell's formula. It is fed an array of tokens from the `Lexer`, iterates over these tokens and validates them agains the grammar rules of the formula language. If it finds a sequence of tokens that does not correspond to any grammar rule, it produces a syntax error.

As the `Parser` matches and validates the stream of tokens agains the formula language grammar, it recursively builds a so called Abstract Syntax Tree (AST) of the formula. AST is a tree structure that holds a semantic representation of the cell's formula. Its shape is determined by the meaning of the formula and holds relevant information about how the formula should be evaluated. Each node in the AST stores information about the action to perform and additional arguments or metadata used by the action.

```ts
export enum NodeType {
    NumericLiteral = "NumericLiteral",
    BinaryExpression = "BinaryExpression",
    CallExpression = "CallExpression",
    ...
}

export interface Expression {
    type: NodeType;
}

export interface NumericLiteral extends Expression {
    type: NodeType.NumericLiteral;
    value: number;
}

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

For instance, image a cell with formula `= 10 + 2 * 3`. We know that the `*` operator has precedence over the `+` operator and must be evaluated first. Since the evaluation is performed as recursive traversal of the AST, the `*` action must be in a layer below the `+` action. Therefore, the root node of the AST is a `BinaryExpression` node with the `+` operator. Its left operand is a `NumericLiteral` node with the value `10` and its right node is a `BinaryExpression` with the `*` operator. The left operand of the `*` node is a `NumericLiteral` node with the value of `2` and its right operand is a `NumericLiteral` node with the value of `3`. The whole AST of this formula has the following structure:

```json
{
    "type": "BinaryExpression",
    "operator": "+",
    "left": {
        "type": "NumericLiteral",
        "value": 10
    },
    "right": {
        "type": "BinaryExpression",
        "operator": "*",
        "left": {
            "type": "NumericLiteral",
            "value": 2
        },
        "right": {
            "type": "NumericLiteral",
            "value": 3
        }
    }
}
```

In this way, the multiplication is evaluated first, resulting in `2 * 3 = 6` and only after this the addition is performed, resulting in `10 + 6 = 16`. The `Parser` is responsible for building a correct AST for the given formula, which is later fed into the `Runtime` processor.

The `Parser` is implemented as a recursive-descent parser. Each grammar rule is implemented as a TypeScript function that parses the stream of tokens and produces a valid AST node, which is then inserted into the AST of the whole formula.

```ts
...

private parseAdditiveExpression(): Expression {
    let left: Expression = this.parseMultiplicativeExpression();

    while (this.at().type === TokenType.BinOp && ["+", "-"].includes(this.at().value)) {
        const operator = this.next().value;
        const right = this.parseMultiplicativeExpression();

        left = {
            type: NodeType.BinaryExpression,
            left,
            right,
            operator,
        } as BinaryExpression;
    }

    return left;
}

private parseMultiplicativeExpression(): Expression {
    let left: Expression = this.parseCallExpression();

    while (this.at().type === TokenType.BinOp && ["*", "/", "%"].includes(this.at().value)) {
        const operator = this.next().value;
        const right = this.parseCallExpression();

        left = {
            type: NodeType.BinaryExpression,
            left,
            right,
            operator,
        } as BinaryExpression;
    }

    return left;
}

...
```

As depicted in the code snippet above, the `parseAdditiveExpression` first calls the `parseMultiplicativeExpression` for both its left and right operands. This ensures that in case of multiplicative binary expression, it always sits in the lower layers of the AST than the additive binary expression, being eventually evaluated first.

##### Runtime

`Runtime` is a processor responsible for evaluating the AST of a cell's formula. It takes in a valid AST, traverses it in a recursive way and evaluates its nodes one by one. Since each node in the AST corresponds to an expression that is evaluated to a value, it produces a single value of the formula, that is later displayed in the corresponding cell in the spreadsheet interface.

There are many datatypes supported by ABM Sheets, but the most prominent ones are depicted below:

```ts
export enum ValueType {
    Number = "Number",
    Boolean = "Boolean",
    String = "String",
    ...
}

export type NumberType = number;
export type BooleanType = boolean;
export type StringType = string;
...

export interface Value {
    type: ValueType;
    value:
        | NumberType
        | BooleanType
        | StringType
        | ...
}

export interface NumberValue extends Value {
    type: ValueType.Number;
    value: NumberType;
}

export interface BooleanValue extends Value {
    type: ValueType.Boolean;
    value: BooleanType;
}

export interface StringValue extends Value {
    type: ValueType.String;
    value: StringType;
}

...
```

The `Runtime` processor traverses the AST recursively using a Depth First Search algorithm, starting from the root, progressing towards the leaf nodes. Each TypeScript function in the `Runtime` module corresponds to the processor of one AST node type, resulting in a runtime value being generated. For instace, evaluating a binary expression looks like this:

```ts
private runBinaryExpression(expression: BinaryExpression): NumberValue {
    const { left, right, operator } = expression;

    const leftValue = this.runExpression(left);
    const rightValue = this.runExpression(right);

    if (
        leftValue.type !== ValueType.Number ||
        rightValue.type !== ValueType.Number
    ) {
        throw new Error("LHS and RHS of binary expression must be numbers");
    }

    const { value: lhs } = leftValue as NumberValue;
    const { value: rhs } = rightValue as NumberValue;

    const operators = {
        "+": (lhs: number, rhs: number) => lhs + rhs,
        "-": (lhs: number, rhs: number) => lhs - rhs,
        "*": (lhs: number, rhs: number) => lhs * rhs,
        "/": (lhs: number, rhs: number) => lhs / rhs,
        "%": (lhs: number, rhs: number) => lhs % rhs,
    };

    const func = operators[operator];

    if (!func) {
        throw new Error(`Unsupported binary operator '${operator}'`);
    }

    const result: number = func(lhs, rhs);

    return { type: ValueType.Number, value: result };
}
```

##### Evaluator

`Evaluator` is the entry point of the evaluation engine module and serves as a wrapper of the above processors. Each of the processors described above (`Lexer`, `Parser`, `Runtime`) work together to evaluate a formula of a single cell. The `Runtime` processor accepts a single cell's formula as a raw `string`, calls the `Parser` processor to generate an AST, which calls the `Lexer` processor to produce tokens. Once the tokens are produced, they are passed back to the `Parser` which validates them and generates the AST and then passes the AST upwards to the `Runtime` processor, which evaluates the `AST` and produces a single runtime value.

The `Evaluator` module, on the other hand, accepts an array of cell IDs and the total number of steps. It extracts cell formulas from the cell IDs, loops over all cells and all time steps and for each cell and time step calls the `Runtime` processor to evaluate the cells formula for the specific time step. Upon evaluating all cells and time steps, it produces a `History` object which is a data structure holding the state of the entire simulation.

```ts
export type History = Map<CellId, Value[]>;

const evaluateCells = (cells: CellId[], steps: number) => {
    const history: History = new Map();

    for (let step = 0; step < steps; step++) {
        for (const cellId of cells) {
            const formula = this.getCellFormula(cellId);
            const result = new Runtime.run(cellId, formula, step, steps);
            history.set(cellId, [...history.get(cellId), result]);
        }
    }

    return history;
};
```

This `History` object is then passed to the spreadsheet interface to propagate the evaluated values to the corresponding cells.

#### Topological Sorting

Before the cell formulas are passed from the spreadsheet to the engine for evaluation, there is one more step that needs to be done to ensure correct evaluation of the cells. In spreadsheets, cells can reference each other's values arbitrarily. For instance, cell `A1` can reference cell `B2` and `C3` and `B2` can reference `D4`. These cells, however, cannot be evaluated in any order. If the engine evaluates `A1` first and `B2` second, then `A1` does not have the most up to date value of `B2`, since `B2` depends on `D4`. The engine first needs to evaluate `D4` since `B2` depends on it, then it needs to evaluate `C3` since `A1` depends on both `B2` and `C3` and finnaly it can evaluate `A1` since there are no more dependencies on `A1` that have not yet been evaluated.

For this problem, ABM Sheets uses a topological sorting algorithm that takes in an array of cell IDs and produces a sorted array of the same cell IDs in the order they need to be evaluated in to ensure correct results.

The topological sorting algorithm first builds a dependency graph. The dependency graph is an oriented graph where nodes represent cells and edges represent dependencies. If an edge is directed from `A1` to `B2` it means that `A1` is referencing `B2`. After the dependency graph is created, the topological sorting algorithm traverses this graph and builds a sorted array of cells. As it builds this array, it also checks for cycles in the graph. If a cycle has been found, there exist no topological sorting that can be used, because cells depend on themselves in a cyclical manner with no origin to start with. In that way, the cells cannot be evaluated and the algorithm produces an error.

After a topological ordering has been found, the sorted cells are passed to the `Evaluator` module for evaluation.

## Installation & Deployment Guide

- step-by-step installation
- how to configure and run the system
- deployment instructions (e.g. Docker, cloud setup)

ABM Sheets is a web-based application built using TypeScript and the Next.js framework. It uses Node.js as a runtime and Webpack for bundling.

### Deployed Version

ABM Sheets is deployed on the [this link](https://abm-sheets-web.vercel.app/).

### Running Locally

To run ABM Sheets locally, following requirements must be met

- Node.js version `20` or higher must be installed on the computer
- clone the project `git clone https://github.com/TomasBoda/abm-sheets-web.git`
- navigate to the project folder `cd abm-sheets-web`
- install dependencies `npm install`
- run the web application `npm run dev`

ABM Sheets uses Supabase for database and authentication. The credentials for Supabase are stored in the `.env` file in the project's root directory. In order to run ABM Sheets locally, the user needs to have a running local Supabase instance on their computer and the following fields set in the `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Testing & Quality Assurance

- test strategy (unit tests, integration tests, user testing)
- tools/frameworks used
- test cases & results

## Limitations & Future Work

- known issues
- possible improvements

## References & Appendices

- bibliography, technical references
- full source code (if required)
