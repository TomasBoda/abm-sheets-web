# Research

**Project**: ABM Sheets \
**Author**: Bc. Tomáš Boďa \
**Supervisor**: Mgr. Tomáš Petříček, Ph.D.

## About

This document describes the research methodology used during the inital user study, planning, development and the evaluation study of the ABM Sheets research project and analyses the results gathered from the conducted studies.

## Introduction

ABM Sheets started as an idea that a simple extension such as time could greatly improve the spreadsheet paradigm. The initial hypothesis claims that extending the spreadsheet - a two-dimensional grid of cells, with a third dimension of time could improve the expressive power of spreadsheets and simplify modeling more complex domains, that are otherwise difficult to model in conventional spreadsheets.

## User Study

Prior to designing and developing the ABM Sheets software system, an initial user study was conducted to test this hypothesis. The study consisted of a series of video interviews with people of various technical backgrounds and with different experience with spreadsheets. The format of the interview was to give the participants a simple modeling assignment in Microsoft Excel and observe how they manage to complete this assignmemnt. Although the assignment was rather simple and easy to understand, it was intentionally designed in a way to require cumbersome methods and workarounds to be successfully completed. The primary aim of this study was to test the limits of spreadsheets in terms of multi-dimensional models and to discover main limitations ABM Sheets could address.

### Assignment

The interview assignment was a simple agent-based simulation of a running race. We have a set of runners running in a one-dimensional space (line). All runners start at point `0` and run towards the finish line (e.g. `100`). Each runner is assigned a random initial speed based on which it moves forward (movement could be modeled as `NEW_POISTION = PREV_POSITION + SPEED`). The speed is incremented or decremented by a random small amount in each new time step. If any runner crosses the finish line, all runners stop moving. Furthermore, we want to observe the entire race from start to finish as time passes and runners move and see the state of the race in each time step.

The original assignment is described further in [this document](./user-study.md).

### Participants

The study consisted of four participants. Two had extensive prior experience with Microsoft Excel and had been using it regularly in either professional or personal contexts, both for modeling and analytical tasks. The other two participants were university students of a technical field with limited prior exposure to spreadsheet tools, but with solid foundation in programming concepts.

### Solutions

Interestingly enough, the solutions of all four participants were more or less identical in terms of their conceptual composition.

The first two participants initially chose an analytical method of modeling time, calculating the positions of the runners as `T * SPEED`, where `T` is the current time step. Morover, they modeled `TIME_AT_FINISH` as `FINISH_LINE / SPEED` and the runner with the lowest `TIME_AT_FINISH` value won. However, the assignment stated that we wanted to observe individual time steps, so this approach did not work.

Eventually, all four participants chose an approach where columns represented time steps and rows represented runners. The participants created two such tables, one for the changing `POSITION` attribute and one for the changing `SPEED` attribute. They calculated `SPEED` as `SPEED[T] = SPEED[T - 1] + (RAND - 0.5)` and the `POSITION` as `POSITION[T] = POSITION[T - 1] + SPEED[T]`.

### Takeaways

Based on the approach the participants chose for modeling the running race simulation, we can observe that in order to represent the third dimension of a simulation, the participants chose to copy the first two dimensions for each element of the third dimension. In our case, we had a set of runners, each with a set of attributes (position, speed) and finally a set of time steps. When mapping time steps to the dimension of columns and runners to the dimension of rows, we need to construct two separate tables for the position and speed attributes (elements of the third dimension). Although this approach is feasable in conventional spreadsheets, as the number attributes and therefore dimensions of the model rises, it quickly becomes cumbersome to do maintain the transparency of the model.

When we asked the first participant why they initially chose the analytical approach for constructing the model, they responded that they wanted to avoid time steps altogether, although they later realized it was not possible. When asked why they wanted to avoid time steps, they responded:

_"I guess because once you set the columns to time steps, you have lost a dimension of your spreadsheet and so now everything is one-dimensional and everything about the dynamics has to be embedded in a single formula and that can get really complicated, so I was trying to get away from not having to do that for as long as possible. You've only got two dimensions, and if you use one for time, everything else becomes miserable."_

Moreover, the second participant had an interesting remark about why spreadsheets are so popular nowadays:

_"One of the benefits of Excel, as you probably know, is just the whip attitude of it, you know, this kind of interactive, reactive programming environment. The ability to mix data and formulas/programming in the same environment is extremely attractive."_

Whereas the first quote directly supports our initial hypothesis that embedding time into the spreadsheet environment as a native feature truly simplifies modeling multi-dimensional simulations, the second quote gave us great motivation for the potential popularity of ABM Sheets thanks to the popularity of spreadsheets as such. Therefore we concluded that designing ABM Sheets as closely as possible to conventional spreadsheets would give the project a great advantage in being usable for a wide range of users.

At the end of the interviews, we explained to each participant the purpose of the study and our intention to create a new spreadsheet tool with the native time extension. To this, the first participant responded that it would be a useful addition to embedd the third dimension of discrete time into the software system to enable travelling through the time bi-directionally and enable cell self-referrencing in a more complex and useful manner.

## Evaluation Study

After the design and development of ABM Sheets was completed, an evaluation study was conducted to test whether the system is usable and solves the pain points our hypothesis claimed. The study was conducted in a similar manner than the initial user study and consisted of a series of interviews with people of various technical background and with different experience with spreadsheets. The format of the interviews was to give the participants the same modeling task as in the initial study, however, this time the participants were given ABM Sheets to complete the assignment.

Before diving into the task, we briefly introduced the system to the participants and explained the new features that it offers compared to conventional spreadsheet tools.

### Participants

The study included three participants, all of whom had more than 5 years of experience with programming. One of the participants had prior extensive experience with spreadsheet tools, whereas the other two participants had only limited prior exposure to spreadsheets.

### Solutions

Interestingly enough, with little to no help, all three participants managed to complete the assignment in a way we predicted and hoped for. All three participants eventually used rows for representing runners and columns for their attributes (position, speed), utilizing the built-in dimension of time natively.

One interesting thing we learned was the way that the first participant chose to self-reference a cell. For the `POSITION` column, they tried to model the formula as `A1: = 0 = PREV(A1, STEP() - 1) + A2`, where `A2` represented `SPEED`. The `PREV(A1, STEP() - 1)` evaluates to the value of `A1` in the previous time step, however, a simplified version that ABM Sheets supports would look like `A1: = 0 = A1 + A2` as `A1` is a self-reference and always evaluates to the previous time step. The fact that the participant naturally decided to use the `PREV` function to reference the previous time step pointed us in the direction to omit the simplified short-hand version and require explicit use of `PREV` for self-references - an idea we thought about in the course of the entire development of ABM Sheets.

The second and the third participant also mentioned an interesint thing. Both participants said that this software would have great use in physics simulations, as they often require time in their calculations, making ABM Sheets a great tool to explore this field. Furthermore, the third participant mentioned that this tool, as "technical" as it is, could be a great learning tool for elementary/high school students exploring interactive programming system - a middle step between high school math and university-grade programming.
