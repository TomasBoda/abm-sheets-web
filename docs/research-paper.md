# Research

**Project**: ABM Sheets \
**Author**: Bc. Tomáš Boďa \
**Supervisor**: Mgr. Tomáš Petříček, Ph.D.

## About

This document describes the research methodology used during the inital study, planning, development and evaluation of the ABM Sheets research project and analyses the results gathered from the conducted studies.

## Introduction

ABM Sheets started as an idea that a simple extension such as time could greatly improve the spreadsheet paradigm. The initial hypothesis claims that extending the spreadsheet - a two-dimensional grid of cells, with a third dimension of time could improve the expressive power of spreadsheets and simplify modeling more complex domains, that are otherwise difficult to model in conventional spreadsheets.

## Initial Study

Prior to designing and developing the ABM Sheets software system, an initial study was conducted to test this hypothesis. The study consisted of a series of video interviews with people of various technical backgrounds and with different experience using spreadsheets. The format of the interview was to give the participants a simple modeling assignment in Microsoft Excel and observe how they manage to complete this assignmemnt. Although the assignment was rather simple and easy to understand, it was intentionally designed in a way to require cumbersome methods and workaround to be successfully completed. The primary aim of this study was to test the limits of spreadsheets in terms of multi-dimensional models and to discover main pain points that ABM Sheets could potentially solve.

### Assignment

The interview assignment was a simple agent-based simulation of a running race. We have a set of runners running in a one-dimensional space (line). All runners start at point `0` and run towards the finish line (e.g. `100`). Each runner is assigned a random initial speed based on which it moves forward (movement could be modeled as `NEW_POISTION = PREV_POSITION + SPEED`). The speed is incremented or decremented by a random small amount in each new time step. If any runner crosses the finish line, all runners stop moving. Furthermore, we want to observe the entire race from start to finish as time passes and runners move and see the state of the race in each time step.

### Participants

The study included four participants. Two had extensive prior experience with Microsoft Excel and had been using it regularly in either professional or personal contexts, both for modeling and analytical tasks. The other two participants were university students of a technical field with limited prior exposure to spreadsheet tools, but with solid foundation in programming concepts.

### Solutions

Interestingly enough, the solutions of all four participants were more or less identical in terms of their conceptual composition.

The first two participants initially chose an analytical method of modeling time, calculating the positions of the runners as `T * SPEED`, where `T` is the current time step. Morover, they modeled `TIME_AT_FINISH` as `FINISH_LINE / SPEED` and the runner with the lowest `TIME_AT_FINISH` value won. However, the assignment stated that we wanted to observe individual time steps, so this approach did not work.

Eventually, all four participants chose an approach where columns represented time steps and rows represented runners. The participants created two such tables, one for the changing `POSITION` attribute and one for the changing `SPEED` attribute. They calculated `SPEED` as `SPEED[T] = SPEED[T - 1] + (RAND - 0.5)` and the `POSITION` as `POSITION[T] = POSITION[T - 1] + SPEED[T]`.

This approach was what we expected and hoped for.

### Takeaways

Based on the approach the participants chose for modeling the running race simulation, we can conclude that in order to represent the third dimension of a simulation, we need to copy the first two dimensions for each element of the third dimension. In our case, we had a set of runners, each with a set of attributes (position, speed) and finally a set of time steps. When mapping time steps to the dimension of columns and runners to the dimension of rows, we need to construct two separate tables for the position and speed attributes (elements of the third dimension). Although this approach is possible to do this way in conventional spreadsheets, as the number attributes and aspects of the model rises, it quickly becomes cumbersome to do in a transparent way.

When asking the first participant why they initially chose the analytical approach for the modeling the assignment, they said that they wanted to avoid time steps altogether, although they later realized it was not possible. When asked why they wanted to avoid time steps, they responded:

_"I guess because once you set the columns to time steps, you have lost a dimension of your spreadsheet and so now everything is one-dimensional and everything about the dynamics has to be embedded in a single formula and that can get really complicated, so I was trying to get away from not having to do that for as long as possible. You've only got two dimensions, and if you use one for time, everything else becomes miserable."_

Moreover, the second participant said an interesting thing about why spreadsheets are so popular nowadays:

_"One of the benefits of Excel, as you probably know, is just the whip attitude of it, you know, this kind of interactive, reactive programming environment. The ability to mix data and formulas/programming in the same environment is extremely attractive."_

The first quote directly supports our hypothesis that embedding time into the spreadsheet environment as a native feature truly simplifies modeling multi-dimensional simulations, whereas the second quote gave us great motivation for the potential popularity of ABM Sheets thanks to the popularity of spreadsheets as such.

At the end of the interview, we explained to each participant the purpose of the interview and our intention to create a new spreadsheet tool with the native time extension. To this, the first participant responded that it would be a useful addition to embedd the third dimension of discrete time into the software system to enable travelling through the time bi-directionally and enable cell self-referrencing in a more complex and useful manner.

## Evaluation Study

After the design and development of ABM Sheets has been finished, an evaluation study was conducted to test whether the system is functional and usable in a way we designed it. The study was conducted in a similar maner than the initial study and consisted of a series of interviews with people of various technical background and with different experience with spreadsheets. The format of the interviews was to give the participants the same modeling task as in the initial study, however, this time the participants were given ABM Sheets to complete the assignment.

Before diving into the task, we briefly introduced the system to the participants and explained the new features that it offers compared to conventional spreadsheet tools.

### Participants

The study included three participants. All three participants had more than 5 years of experience with programming. One participant had prior experience with spreadsheet tools, whereas the other two participants had only limited prior exposure to spreadsheet systems.

### Solutions

With little to no help, all three participants managed to complete the assignment in a way we predicted and hoped for. All three participants eventually used rows for representing runners and columns for their attributes (position, speed), utilizing the built-in dimension of time natively.

One interesting thing we learned was the way that the first participant chose to self-reference a cell. For the `POSITION` column, they tried to model the formula as `A1: = 0 = PREV(A1, STEP() - 1) + A2`, where `A2` was the `SPEED` column. The `PREV(A1, STEP() - 1)` evaluates to the value of `A1` in the previous time step. However, a simplified version that ABM Sheets supports would look like `A1: = 0 = A1 + A2` as `A1` is a self-reference and always evaluates to the previous time step. The fact that the participant instantly decided to use the `PREV` function to reference the previous time step pointed us in the direction to omit the simplified short-hand version and require explicit use of `PREV` for self-references - an idea we thought about in the course of the entire development of ABM Sheets.

The second and the third participant also mentioned an interesint thing. Both participants said that this software would have great use for physics simulations, as they often require time in their calculations, making ABM Sheets a great tool to explore this field. Another thing both participants agreed on was that this tool, as "technical" it is, could be a great learning tool for elementary/high school students exploring interactive programming system - a middle step between high school math and real programming.
