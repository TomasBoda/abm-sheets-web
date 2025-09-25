# ABM Sheets

**Project**: ABM Sheets \
**Author**: Bc. Tomáš Boďa \
**Supervisor**: Mgr. Tomáš Petříček, Ph.D.

## Abstract

Spreadsheets are powerful tools for data analysis and modeling, but they are inherently limited to two dimensions - rows and columns, making it difficult to represent systems that evolve over time. This limitation poses challenges for domains like agent-based modeling, physics simulations, or financial market analysis, where the concept of time is fundamental. In particular, agent-based models require tracking multiple agents, each with evolving attributes, across discrete time steps - something traditional spreadsheets struggle to express without resorting to duplication and convoluted formulas.

We address this limitation by extending the spreadsheet paradigm with a built-in support for discrete time, allowing cells to reference their own values from previous time steps directly. This extension preserves the familiar spreadsheet paradigm while adding a powerful new dimension of time. With this approach, users can build and explore dynamic models, such as agent-based simulations with the same ease as traditional spreadsheet calculations. In this paper, we demonstrate how this time-aware spreadsheet enables new kinds of simulations and iterative processes that are impractical or impossible to implement in conventional spreadsheet software like Microsoft Excel or Google Sheets.

## Introduction

Spreadsheets are among the most widely used tools for data analysis, planning, and modeling due to their flexibility, accessibility, and low barrier to entry. They offer a familiar interface based on a two-dimensional grid of cells, which makes them ideal for a broad range of applications, from financial modeling to project management and scientific calculations. However, their core structural simplicity also introduces limitations, particularly when representing models that extend beyond two dimensions.

In recent years, several research efforts have explored ways to expand the capabilities of spreadsheets to address more complex computational needs. [Espalier](https://sdg.csail.mit.edu/project/espalier/), for example, introduces a novel paradigm that combines spreadsheet usability with SQL-like expressiveness, enabling users to build rich organizational applications while editing hierarchical structured data within a visual environment. [Nezt](https://dl.acm.org/doi/10.1145/3191697.3214343) offers a live programming environment inspired by spreadsheets but enhanced with hierarchical cells and reusable custom functions, aiming to support application prototyping and scientific computing with greater expressiveness. Addressing the growing importance of real-time applications, a prototype [spreadsheet model for streaming data](https://dl.acm.org/doi/10.1145/2702123.2702587) demonstrates how users can stream and manipulate web-based data within a spreadsheet using temporal metadata and dynamic formulas. Finally, [this paper](https://ieeexplore.ieee.org/abstract/document/7476773) looks at spreadsheets from a broader perspective and treats them as a programming language, highlighting their liveness, directness, and ease of deployment, while surveying research directions in spreadsheet software engineering such as testing, refactoring, and clone detection.

In this paper, we focus on the problem of extending the traditional spreadsheet paradigm with discrete time. There are multiple domains where discrete time simulations are ubiquitous. Those include physics simulations, agent-based models or financial market analyses. The typical way of modeling time in spreadsheets is to reserve one of the available dimensions (rows or columns) for modeling time steps. For instance, the model may add a new row for each new time step. However, reserving one of the two available dimensions for time leaves the spreadsheet with only one dimension for the other aspects of the model, eventually making it difficult to model more complex models.

Therefore, there is a strong motivation for directly supporting time-aware models in a spreadsheet environment. Spreadsheets offer a transparent, interactive, and user-friendly platform that encourages experimentation and rapid prototyping. Making them more compliant with complex modeling would significantly lower the barriers to entry for users without formal programming experience, while still supporting powerful and expressive simulations. By embedding time into the core data structure, ABM Sheets provides a seamless way to model state changes over time, making it a powerful tool for various time-aware simulation approaches.

## Time-aware Simulations

Discrete time is a fundamental component of many modeling domains, yet it remains difficult to represent effectively within the traditional spreadsheet paradigm, particularly as the model complexity grows.

Agent-based modeling (ABM) is one such domain. ABMs simulate the behavior of individual entities (agents) over time, requiring the tracking of multiple attributes for each agent across discrete time steps. This inherently introduces three-dimensional to the model: a set of agents, a set of attributes for each agent, and time. Traditional spreadsheets, constrained to two dimensions, force users into workarounds, such as encoding time along rows or columns, which quickly become error-prone and difficult to maintain as models scale in size and complexity.

Moreover, physics simulations present similar challenges. While simple physical phenomena can often be modeled analytically, more sophisticated simulations, especially those involving numerical integration of differential equations, require iterative, time-stepped computation. One example is the cannonball simulation presented at the beginning of this paper, as it illustrates the need to track object states over time. Expressing such evolving systems within conventional spreadsheet interfaces quickly becomes difficult, if not infeasible.

Last but not least, financial modeling also heavily relies on temporal data. Whether analyzing historical trends, simulating future market behaviors, or evaluating investment strategies, financial models must track entities whose values evolve over time. Representing these changes accurately and efficiently within traditional spreadsheets often requires duplicating logic or data, increasing the likelihood of errors and limiting the model's extensibility.

## Contributions

This paper makes the following contributions:

- **Identification of a gap in conventional spreadsheet modeling** \
  Through formative user interviews and analysis of common modeling scenarios, we identify a core limitation of traditional spreadsheets in representing systems that evolve over time, particularly in the context of agent-based modeling and dynamic simulations

- **Design and implementation of a time-extended spreadsheet model** \
  We introduce an extension to the traditional spreadsheet paradigm that integrates discrete time as a first-class concept. Our prototype allows cells to reference values from previous time steps directly, enabling natural expression of stateful and time-dependent computations.

- **Demonstration through case studies** \
  We validate the expressiveness and utility of our time-aware spreadsheet model by implementing three case studies: an agent-based model, a physical system simulation, and a financial process. These examples highlight scenarios that are cumbersome or infeasible to construct using conventional spreadsheet tools like Excel or Google Sheets.

## System Overview

ABM Sheets is designed to closely resemble traditional spreadsheet software, particularly Microsoft Excel, in order to minimize the learning curve for existing users. The user interface, formula syntax, and user interaction patterns are intentionally modeled after familiar spreadsheet conventions. This ensures that users can quickly adapt to the system while benefiting from its extended capabilities.

### Built-in Time

The core innovation in ABM Sheets is the integration of discrete time as a native feature of the spreadsheet environment. This addition introduces several fundamental changes to how cells behave and how formulas are interpreted.

Most notably, cells in ABM Sheets are allowed to reference themselves within their own formulas. When a cell references itself, the value retrieved corresponds to the cell's value in the previous time step. To enable this behavior, each self-dependent cell must be initialized with a starting value (referred to as the default formula) from which the simulation can evolve over time.

Each cell in ABM Sheets can therefore have one or two formulas:

- **default formula** (optional) - defines the cell's value at the initial time step (`t = 1`)
- **primary formula** (mandatory) - defines the cell's value in all subsequent time steps (`t > 1`), potentially referencing its own prior state or the states of other cells

If a cell attempts to reference itself without the default formula defined, the evaluation results in an error due to the absence of an initial state.

To define both formulas within a single cell, ABM Sheets uses a dual-assignment syntax - the first `=` introduces the default formula, and the second `=` introduces the primary formula. If only one formula is provided, it is treated as the primary formula and applies uniformly across all time steps without referencing prior state.

To define a simple counter that starts at `0` and increments by `1` at each time step, the formula in cell `A1` could be `= 0 = A1 + 1`:

- at time step `1`, `A1` evaluates to `0` (the default formula)
- at time step `2`, `A1` evaluates to `0 + 1 = 1` (the primary formula)
- at time step `3`, `A1` evaluates to `1 + 1 = 2`, and so on

### Cell References

In a spreadsheet model where cells reference themselves arbitrarily, a mechanism to ensure that all cells are evaluated in correct and consistent order must be enforced. For instance, if `A1` references `B1`, the system must make sure to evaluate `B1` prior to `A1` in order for `A1` to have the most up-to-date value of `B1`.

To enforce this ordering, ABM Sheets employs a **topological sorting algorithm** that analyzes cell dependencies and determines a valid evaluation sequence. This guarantees that each cell is computed only after all the cells it depends on have been evaluated.

However, this approach can encounter issues when cyclic dependencies exist — when two or more cells depend on each other either directly or indirectly. For instance:

- cell `A1` with formula `= B1`
- cell `B1` with formula `= A1`

This configuration creates a circular dependency, which prevents topological sorting and leads to an evaluation error. ABM Sheets addresses this problem by leveraging default formulas to break dependency cycles across time steps. By providing an initial value through a default formula, a cell can be evaluated independently at the first time step, allowing dependent cells to reference its value without forming an immediate cycle. For instance:

- `A1` formula is `= 1 = B1`
- `B1` formula is `= A1`

In this revised configuration, `A1` is initialized to `1` at the first time step. As a result, `B1` can safely reference `A1`, and both cells can be evaluated without creating a circular dependency in the current time step. In subsequent time steps, values propagate forward using the established evaluation order, maintaining consistency and correctness.

This mechanism allows ABM Sheets to support recursive and interdependent cell logic while preserving the integrity of the simulation across discrete time steps.

### Time Ranges

Conventional spreadsheet interfaces usually provide a way to specify cell ranges using the `A5:B10` syntax. These are usually used as arguments to functions that work with cell ranges, such as `MIN`, `MAX`, `SUM`, `AVERAGE`, etc. With the addition of built-in discrete time, this naturally opens the question whether we can utilise these functions for time as well.

A cell range typically evaluates to an array of cell references that are within the cell range bounds. These cell references are then evaluated, resulting in an array of calculated values. ABM Sheets builds on this idea by generalizing the concept of ranges, which results in the ability to use cell ranges and time ranges interchangeably.

ABM Sheets provides a new function `TIMERANGE (CELL, NUMBER)`, which accepts a cell reference and a number of time steps to reference. This function takes a cell range and evaluates returns its values from the last `N` time steps. This naturally results in an array of calculated values, same as with cell ranges. This addition results in a generalized range object for both cell ranges and time ranges, which can be used in all functions that accept cell ranges in traditional spreadsheet interfaces. For instance, to calculate the average value of cell `B5` in the last `10` time steps, we can utilise the following formula: `= AVERAGE(TIMERANGE(B5, 10))`.

We see the introduction of time ranges as a natural addition to ABM Sheets in order to intergate time as a native concept of the spreadsheet interface, making it fully compliant with the spreadsheet paradigm.

### Composable Graphs

ABM Sheets provides a way to create graphs based on the data in the spreadsheet. For this, it integrates a composable data visualisation library [Compost.js](https://compostjs.github.io/compost), which enables users to compose customk graphs directly in the spreadsheet using cells and their formulas.

The primary construct of Compost is `Shape`, which is a general representation of a graph. Compost provides a set of functions, which can be divided into five categories:

1. functions that produce `Shape` objects
2. functions that specify visual properties of `Shape` objects
3. functions that produce or transform `Scale` objects
4. functions that combine graph axes and `Shape` objects
5. functions that render the composed graphs

These functions can be composed together to build custom graphs from data in the spreadsheet. For each Compost function, a corresponding ABM Sheets function is available for use. Let's look at a short example of a line graph in ABM Sheets.

To compose a line graph, we must first generate a set of points to render onto the graph:

- `A1` - `= POINT(1, 5)`
- `A2` - `= POINT(2, 7)`
- `A3` - `= POINT(3, 3)`
- `A4` - `= POINT(4, 2)`
- `A5` - `= POINT(5, 9)`

When we have the points, we can combine them into a line:

- `B1` - `= LINE(A1:A5)`

Then, we create the graph axes and render the line into the graph:

- `B2` - `= AXES("left bottom", B1)`

Finally, we render the resulting graph:

- `B3` - `= RENDER(B2)`

The cell `B3` now holds the composed graph object representing a line graph. Using the ABM Sheets UI, we can open the graph sidebar and observe the rendered graph of cell `B3`.

Note that thanks to time ranges, we can utilise time to render dynamic graphs. Instead of generating a fixed array of points, we can create dynamic line grap:

- `A1` - `= 1 = A1 + 1` (represents the `x` coordinate of the point)
- `A2` - `= RANDBETWEEN(10, 20) = A2 + (RAND() - 0.5) * 5` (represents the `y` coordinate of the point)

Now, we can create a dynamic point object and compose a line from it's time range values:

- `B1` - `= POINT(A1, A2)`
- `B2` - `= LINE(TIMERANGE(B1, STEP()))`

The cell `B2` now contains a line graph shape with dynamic size that changes as we go forward in time.
