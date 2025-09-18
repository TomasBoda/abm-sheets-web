# Technical Documentation

**Project**: ABM Sheets
**Author**: Bc. Tomáš Boďa
**Supervisor**: Mgr. Tomáš Petříček, Ph.D.

## Abstract

Spreadsheets are powerful tools for data analysis and modeling, but they are inherently limited to two dimensions - rows and columns, making it difficult to represent systems that evolve over time. This limitation poses challenges for domains like agent-based modeling, physics simulations, or financial market analysis, where the concept of time is fundamental. In particular, agent-based models require tracking multiple agents, each with evolving attributes, across discrete time steps - something traditional spreadsheets struggle to express without resorting to duplication and convoluted formulas. We address this limitation by extending the spreadsheet paradigm with a built-in support for discrete time, allowing cells to reference their own values from previous time steps directly. This extension preserves the familiar spreadsheet paradigm while adding a powerful new dimension of time. With this approach, users can build and explore dynamic models, such as agent-based simulations with the same ease as traditional spreadsheet calculations.

## Introduction

- purpose of the software
- scope of the system
- target audience

### Purpose of the Software

ABM Sheets is a spreadsheet software extended with the built-in support for discrete time.

Spreadsheets are among the most widely used tools for data analysis, planning, and modeling due to their flexibility, accessibility, and low barrier to entry. They offer a familiar interface based on a two-dimensional grid of cells, which makes them ideal for a broad range of applications, from financial modeling to project management and scientific calculations. However, their core structural simplicity also introduces limitations, particularly when representing models that extend beyond two dimensions.

ABM Sheets focuses on extending the traditional spreadsheet paradigm with discrete time. There are multiple domains where discrete time simulations are ubiquitous. Those include physics simulations, agent-based models or financial market analyses. The typical way of modeling time in spreadsheets is to reserve one of the available dimensions (e.g. rows) for modeling time steps. However, this approach leaves the spreadsheet with only one dimension for other aspects of the model, eventually making it difficult to model more complex domains.

In ABM Sheets, cells can reference themselves, calculating their new values from values in the previous steps. Moreover, the user can step through time steps and see the cell contents recalculate and change in time. This simple extension introduces a new dimension to the spreadsheet, extending its expressive power and opening doors to new kinds of simulations, which are difficult to model in traditional spreadsheet interfaces.

### Scope of the System

ABM Sheets aims to resemble traditional spreadsheet interfaces, such as Microsoft Excel or Google Sheets as closely as possible. It offers a core subset of features of traditional spreadsheet interfaces and an essential subset of functions offered by their formula languages. ABM Sheets does not aim to fully replace the funcionality of existing spreadsheet interfaces, therefore some advanced features might not be available. Furthermore, due to the built-in support for discrete time, several additions in terms of features and language functions are introduced to fully support time in the system.

### Target Audience

ABM Sheets is aimed primarily for scientists with at least some background in spreadsheets, simulations, modeling, prototyping, mathematics, computer science, economics or physics. It is not aimed at users with no technical background, since it might be overwhelming to understand the notion of time and its behaviour in spreadsheets without understanding spreadsheets or other form of programming systems.

## System Overview

### High-level Architecture

ABM Sheets is a web-based application written in TypeScript. It is composed of three main components:

- front-end - built in [TypeScript](https://www.typescriptlang.org/) using the [Next.js](https://nextjs.org/) framework
- engine - built in [TypeScript](https://www.typescriptlang.org/)
- database - remote [Supabase](https://supabase.com/) instance

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

### Main Features

#### Discrete Time

The core innovation in ABM Sheets is the integration of discrete time as a native feature of the spreadsheet environment. This addition introduces several fundamental changes to how cells behave and how formulas are interpreted.

Most notably, cells in ABM Sheets are allowed to reference themselves within their own formulas. When a cell references itself, the value retrieved corresponds to the cell's value in the previous time step. To enable this behavior, each self-dependent cell must be initialized with a starting value — referred to as the default formula — from which the simulation can evolve over time.

Each cell in ABM Sheets can therefore have one or two formulas:

- **default formula** (optional) - defines the cell's value at the initial time step (t = 1)
- **primary formula** (mandatory) - defines the cell's value in all subsequent time steps (t > 1), potentially referencing its own prior state or the states of other cells

If a cell attempts to reference itself without the default formula defined, the evaluation results in an error due to the absence of an initial state.

To define both formulas within a single cell, ABM Sheets uses a dual-assignment syntax - the first `=` introduces the default formula, and the second `=` introduces the primary formula. If only one formula is provided, it is treated as the primary formula and applies uniformly across all time steps without referencing prior state.

To define a simple counter that starts at `1` and increments by `1` at each time step, the formula in cell `A1` would be `= 1 = A1 + 1`:

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

A cell range typically evaluates to an array of cell references that are within the cell range bounds. For instance, the cell range `A5:A10` evaluates to a list of cells `A5`, `A6`, `A7`, `A8`, `A9` and `A10`. These cell references are then evaluated to values that these cells hold, eventually resulting in an array of values. Since the core inovation in ABM Sheets is built-in time, we have explored the idea of generalizing ranges in spreadsheets to time ranges as well, meaning an array of historical values of a given cell.

Therefore, ABM Sheets provides a new function `TIMERANGE`, which takes in a cell reference and a number of time steps to reference. This function produces an array of values, same as the traditional cell range literal. Thanks to this, ABM Sheets can work with ranges as general objects, either as results of cell range literals or timelapse objects. As a result, all functions that take cell range arguments, such as `SUM`, `AVERAGE`, `MIN`, etc. now accept the generalized range values, which they can evaluate naturally.

For instance, imagine a cell in ABM Sheets that represents a value of a trading asset (e.g. a stock or a cryptocurrency) and changes in time thanks to the ABM Sheets' built-in time support. Using time ranges, we can calculate the average value of the given asset in the last 10 time steps using the `AVERAGE` function as follows:

- `B1` holds the asset value
- `B2` calculates the average asset value in the last 10 time steps - `= AVERAGE(TIMERANGE(B1, 10))`

We see the introduction of time ranges as a natural addition to ABM Sheets to intergate and work with time as a built-in feature of the spreadsheet interface.

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

ABM Sheets is composed of two main components

- front-end - spreadsheet, user interactions, graphs, authentication
- engine - evaluation of cell formulas

#### Spreadsheet

The spreadsheet interface is the most important part of the front-end module. It renders a grid of cells which the user can interact with. The spreadsheet grid consists of rows and columns, labeled by numbers and letters respectivelly.

Currently, ABM Sheets supports up to `1000` rows and `1000` columns, resulting in the total of `1,000,000` cells. In order for the browser to handle such large number of cells, an algorithm to effectivelly render these cells needs to be employed. Since the number of cells that are visible on the screen in a single moment is limited by the size of the computer screen, cells that are not visible do not need to be rendered in the DOM. Therefore, the whole spreadsheet is divided into smaller panels of cells. The algorithm tracks which panel is visible and renders only the panels that intersect with the viewport. Thanks to this, the spreadsheet renders a maximum of 4 panels in one moment, effectivelly reducing the number of cells that needs to be rendered in one particular moment and optimizing the page's performance.

#### Engine

The evaluation engine is a module that is responsible for parsing and evaluating cell formulas. It takes in an array of cell IDs and the number of steps of the simulation and evaluates each cell for each time step. Its output is a `History` object, which is a map of cell IDs and their calculated values for each time step. This object is then passed to the spreadsheet interface and rendered in the corresponding cells.

The engine is a pipeline of four primary processors:

- lexer - performs the lexical analysis of a single cell formula
- parser - recursively builds the abstract syntax tree (AST) of the cell formula
- runtime = recursively traverses the formula's AST and evaluates it
- evaluator - a wrapper that evaluates all cell formulas using the above processors

##### Lexer

The lexer is a processor that accepts a cell formula in a plain `string` format and produces an array of tokens of the formula language. A token is a single, non-dividable unit of the formula language, such as numeric literal, identifier, comma, etc. The lexer breaks down the formula into individual characters, identifies tokens and transforms the formula into these tokens, which are then easier to process by processors that follow.

##### Parser

The parser is a processor that takes in the raw array of tokens produced by the lexer, validates them agains the grammar rules of the formula language and produces the abstract syntax tree (AST) of the formula - a tree structure that serves as a semantic representation of the formula. The AST consists of nodes and each node represents one expression.

The parser is implemented as a recursive-descent parser. Each grammar rule is implemented as a function that parses the stream of tokens and produces a valid AST node, appended to the AST structure. As it builds the tree, the parser validates the language grammar and in case of an invalid token, it produces a syntax error.

##### Runtime

The runtime is a processor that takes in a valid AST representing a cell formula, traverses it in a recursive manner, evaluating each node on the go. As a result, it produces a single runtime value, e.g. a number, string, boolean, etc. This value corresponds to the value that is later displayed in the appropriate cell in the spreadsheet interface.

##### Evaluator

All of the above modules perform a specific task, but they are inherently understood as one single module that evaluates a single formula. In technical terms, the runtime processor uses the parser under the hood and the parser uses the lexer under the hood. This means that the raw formula in `string` format is passed to the runtime, which passes it to the parser, which passes it to the lexer. Once the lexer produces an array of tokens, the parser processes these tokens and passes them back to the runtime, which finally outputs the evaluated runtime value.

The evaluator on the other hand is a wrapper of these processors and servers as an entry point of the whole engine module. It takes an array of cell IDs and the total number of time steps to evaluate, and for each cell and time step, it evaluates the cell's formula for the given time step using the above processors. Finally, it returns the evaluated values for each cell and time step.

#### Topological Sorting

Before the cell formulas are passed from the spreadsheet to the engine for evaluation, there is one more step that needs to be done to ensure correct evaluation of the cells. In spreadsheets, cells can reference each other's values arbitrarily. For instance, cell `A1` can reference cell `B2` and `C3` and `B2` can reference `D4`. These cells, however, cannot be evaluated in any order. If the engine evaluates `A1` first and `B2` second, then `A1` does not have the most up to date value of `B2`, since `B2` depends on `D4`. The engine first needs to evaluate `D4` since `B2` depends on it, then it needs to evaluate `C3` since `A1` depends on both `B2` and `C3` and finnaly it can evaluate `A1` since there are no more dependencies on `A1` that have not yet been evaluated.

For this problem, ABM Sheets uses a topological sorting algorithm that takes in an array of cell IDs and produces a sorted array of the same cell IDs in the order they need to be evaluated in to ensure correct results.

The topological sorting algorithm first builds a dependency graph. The dependency graph is an oriented graph where nodes represent cells and edges represent dependencies. If an edge is directed from `A1` to `B2` it means that `A1` is referencing `B2`. After the dependency graph is created, the topological sorting algorithm traverses this graph and builds a sorted array of cells. As it builds this array, it also checks for cycles in the graph. If a cycle has been found, there exist no topological sorting that can be used, because cells depend on themselves in a cyclical manner with no origin to start with. In that way, the cells cannot be evaluated and the algorithm produces an error.

After a topological ordering has been found, the sorted cells are passed to the evaluator for evaluation.

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
