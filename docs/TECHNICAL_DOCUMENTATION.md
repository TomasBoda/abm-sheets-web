# Technical Documentation

**Project**: ABM Sheets
**Author**: Bc. Tomáš Boďa
**Supervisor**: Mgr. Tomáš Petříček, Ph.D.

## Abstract

- short summary of the system

Spreadsheets are powerful tools for data analysis and modeling, but they are inherently limited to two dimensions - rows and columns, making it difficult to represent systems that evolve over time. This limitation poses challenges for domains like agent-based modeling, physics simulations, or financial market analysis, where the concept of time is fundamental. In particular, agent-based models require tracking multiple agents, each with evolving attributes, across discrete time steps - something traditional spreadsheets struggle to express without resorting to duplication and convoluted formulas. We address this limitation by extending the spreadsheet paradigm with a built-in support for discrete time, allowing cells to reference their own values from previous time steps directly. This extension preserves the familiar spreadsheet paradigm while adding a powerful new dimension of time. With this approach, users can build and explore dynamic models, such as agent-based simulations with the same ease as traditional spreadsheet calculations.

## Introduction

- purpose of the software
- scope of the system
- target audience

ABM Sheets is a spreadsheet software extended with the built-in support for discrete time.

Spreadsheets are among the most widely used tools for data analysis, planning, and modeling due to their flexibility, accessibility, and low barrier to entry. They offer a familiar interface based on a two-dimensional grid of cells, which makes them ideal for a broad range of applications, from financial modeling to project management and scientific calculations. However, their core structural simplicity also introduces limitations, particularly when representing models that extend beyond two dimensions.

ABM Sheets focuses on extending the traditional spreadsheet paradigm with discrete time. There are multiple domains where discrete time simulations are ubiquitous. Those include physics simulations, agent-based models or financial market analyses. The typical way of modeling time in spreadsheets is to reserve one of the available dimensions (e.g. rows) for modeling time steps. However, this approach leaves the spreadsheet with only one dimension for other aspects of the model, eventually making it difficult to model more complex domains.

## System Overview

- high-level architecture
- main features & components
- technology stack (programming languages, frameworks, databases, libraries)

### High-level Architecture

ABM Sheets is a web-based application written in TypeScript. It is composed of three main components:

- front-end - built in [TypeScript](https://www.typescriptlang.org/) using the [Next.js](https://nextjs.org/) framework
- engine - built in [TypeScript](https://www.typescriptlang.org/)
- database - remote [Supabase](https://supabase.com/) instance

### Main Features

ABM Sheets is designed to resemble traditional spreadsheet interfaces such as Microsoft Excel or Google Sheets as closely as possible. It attempts to follow the same GUI layout, interaction patterns, formula language syntax and supported functions.

The main feature of ABM Sheets is the built-in support for discrete time, resulting in the following features:

- ability to self-reference a cell without evaluation errors
- ability to step through time steps and see changes in the spreadsheet

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

## Installation & Deployment Guide

- step-by-step installation
- how to configure and run the system
- deployment instructions (e.g. Docker, cloud setup)

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
