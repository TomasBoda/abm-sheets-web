# ABM Sheets - Spreadsheet with Built-in Time

## Abstract

Some simulation modeling approaches, such as agent-based models, inherently require multiple dimensions. In these models, a list of agents is maintained, each with a set of attributes that evolve over discrete time steps. At each time step, an agent’s attributes are recalculated based on the model’s current state. This structure introduces three key dimensions: agents, their attributes, and time. However, traditional spreadsheet interfaces are limited to a two-dimensional grid, making it challenging to represent such models effectively. Mapping a three-dimensional agent-based model onto a two-dimensional spreadsheet requires duplicating the agent and attribute dimensions for every time step, resulting in redundancy and reduced clarity.

ABM Sheets aims to address this limitation by integrating the dimension of time directly into the spreadsheet environment. This approach enables users to represent and manage discrete time steps natively within the spreadsheet, significantly extending its utility for more complex, time-evolving simulations.

## Introduction

Spreadsheets are among the most widely used tools for data analysis, planning, and modeling due to their flexibility, accessibility, and low barrier to entry. They offer a familiar interface based on a two-dimensional grid of cells, which makes them ideal for a broad range of applications — from financial modeling to project management and scientific calculations. However, their core structural simplicity also introduces limitations, particularly when representing models that extend beyond two dimensions.

Agent-based modeling (ABM) is one such domain that challenges the traditional spreadsheet paradigm. ABMs simulate the behavior of individual entities — agents, over time, often requiring the tracking of multiple attributes per agent across discrete time steps. This naturally introduces three essential dimensions: the population of agents, their attributes, and time. Attempting to represent this tri-dimensional structure within a conventional spreadsheet often results in workarounds, such as duplicating agent-attribute matrices for each time step across separate sheets or blocks of cells. These approaches quickly become error-prone and difficult to interpret or maintain, especially as the model complexity grows.

Despite these challenges, there is strong motivation to bring agent-based simulations into the spreadsheet environment. Spreadsheets offer a transparent, interactive, and user-friendly platform that encourages experimentation and rapid prototyping. Making them more compliat with complex modeling would significantly lower the barriers to entry for users without formal programming experience, while still supporting powerful and expressive simulations. By embedding time into the core data structure, ABM Sheets provides a seamless way to model state changes over time, making it a powerful tool for agent-based modeling and other time-sensitive simulations.

## Formative Interviews

Prior to implementing the system, a series of formative interviews was conducted to discover limitations of the traditional spreadsheet software, such as Microsoft Excel or Google Sheets, when applied to agent-based modeling tasks. Participants were given a simple agent-based modeling scenario and asked to implement it in Microsoft Excel using whatever approach they found most appropriate.

### Participants

The study included four participants. Two had extensive experience with Microsoft Excel and used it regularly in either professional or personal contexts. The other two were university students studying computer science, with limited prior exposure to spreadsheet tools, but with solid foundation in programming concepts.

### Assignment

The modeling assignment involved simulating a footrace between agents. Each agent had an individual speed and advanced through a one-dimensional space based on that speed. The simulation required agents to update their positions over discrete time steps, and to halt once any agent crossed the finish line — a classic example of an agent-based system with evolving state and conditional behavior over time.

### Findings

Interestingly, one participant chose to avoid the time-stepped approach altogether, instead calculating agents’ final positions using direct formulas. When asked why they opted to bypass modeling with time steps, they explained:

_"I guess because once you set the rows to time steps, you have lost a dimension of your spreadsheet and so now everything is one-dimensional and everything about the dynamics has to be embedded in a single formula and that can get really complicated, so I was trying to get away from not having to do that for as long as possible. You've only got two dimensions, and if you use one for time, everything else becomes miserable."_

This feedback directly supports the core hypothesis behind ABM Sheets - that embedding time as a native dimension in spreadsheet environments could alleviate major usability and expressiveness issues in modeling dynamic systems.

Another participant offered a valuable reflection on the enduring appeal of spreadsheet software:

_"One of the benefits of Excel, as you probably know, is just the whip attitude of it, you know, this kind of interactive, reactive programming environment. The ability to mix data and formulas/programming in the same environment is extremely attractive."_

This insight underscores the power of spreadsheets as hybrid tools for both data manipulation and lightweight programming. ABM Sheets aims to build on this foundation by preserving the interactivity and flexibility of traditional spreadsheets while extending their capabilities to support time-evolving simulations in a more intuitive and maintainable way.

Both of these insights gave us valuable information that strenghtens the idea of ABM Sheets.

## System Overview

ABM Sheets is designed to closely resemble traditional spreadsheet software, particularly Microsoft Excel, in order to minimize the learning curve for existing users. The user interface, formula syntax, and user interaction patterns are intentionally modeled after familiar spreadsheet conventions. This ensures that users can quickly adapt to the system while benefiting from its extended capabilities.

### Built-in Discrete Time

The core innovation in ABM Sheets is the integration of discrete time as a native feature of the spreadsheet environment. This addition introduces several fundamental changes to how cells behave and how formulas are interpreted.

Most notably, cells in ABM Sheets are allowed to reference themselves within their own formulas. When a cell references itself, the value retrieved corresponds to the previous time step. To enable this behavior, each time-dependent cell must be initialized with a starting value — referred to as the default formula — from which the simulation can evolve over time.

Each cell in ABM Sheets can therefore have two formulas:

- **default formula** - defines the cell's value at the initial time step (t = 1)
- **primary formula** - defines the cell's value in all subsequent time steps (t > 1), potentially referencing its own prior state or the states of other cells

If a cell attempts to reference itself without a defined default formula, the evaluation results in an error due to the absence of an initial state.

To define both formulas within a single cell, ABM Sheets uses a dual-assignment syntax - the first `=` introduces the default formula, and the second `=` introduces the primary formula. If only one formula is provided, it is treated as the primary formula and applies uniformly across all time steps without referencing prior state.

To define a simple counter that starts at `1` and increments by `1` at each time step, the formula in cell `A1` would be `= 1 = A1 + 1`:

- at time step `1`, `A1` evaluates to `1` (the default formula)
- at time step `2`, `A1` evaluates to `1 + 1 = 2` (the primary formula)
- at time step `3`, `A1` evaluates to `2 + 1 = 3`, and so on

### Cell References

In a spreadsheet model where cells reference themselves arbitrarily, a mechanism to ensure that all cells are evaluated in correct and consistent order must be enforced. For instance, if `A1` references `B1`, the system must make sure to evaluate `B1` prior to `A1` in order for `A1` to have the most up-to-date value of `B1`.

To enforce this ordering, ABM Sheets employs a topological sorting algorithm that analyzes cell dependencies and determines a valid evaluation sequence. This guarantees that each cell is computed only after all the cells it depends on have been evaluated.

However, this approach can encounter issues when cyclic dependencies exist — when two or more cells depend on each other either directly or indirectly. For instance:

- cell `A1` with formula `= B1`
- cell `B1` with formula `= A1`

This configuration creates a circular dependency, which prevents topological sorting and leads to an evaluation error. ABM Sheets addresses this problem by leveraging default formulas to break dependency cycles across time steps. By providing an initial value through a default formula, a cell can be evaluated independently at the first time step, allowing dependent cells to reference its value without forming an immediate cycle. For instance:

- `A1` formula is `= 1 = B1`
- `B1` formula is `= A1`

In this revised version, `A1` is initialized to `1` at the first time step. As a result, `B1` can safely reference `A1`, and both cells can be evaluated without creating a circular dependency in the current time step. In subsequent time steps, values propagate forward using the established evaluation order, maintaining consistency and correctness.

This mechanism allows ABM Sheets to support recursive and interdependent cell logic while preserving the integrity of the simulation across discrete time steps.

## Example

The following video demonstrates a simple model in ABM Sheets representing a footrace between agents.

- `speed` is initially set to random integer between `1` and `5` and retained throghout the steps by self-referencing its value
- `position` is initially set to `0` and in each new time step, it takes its value and increments it by speed

As we step through the simulation, the agent positions are updated, simulating their movement forward.

<video style="width: 100%;" controls>
  <source src="/public/abm-sheets-showcase-01.mp4" type="video/mp4">
</video>
