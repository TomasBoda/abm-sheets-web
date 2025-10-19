# Research

**Project**: ABM Sheets \
**Author**: Bc. Tomáš Boďa \
**Supervisor**: Mgr. Tomáš Petříček, Ph.D.

## About

This document outlines the research methodology applied during the inital user study, planning, development and the evaluation study of the ABM Sheets research project and presents an analysis of the results gathered through these studies.

## Introduction

ABM Sheets started as an idea that a simple extension such as time could greatly improve the spreadsheet paradigm. The initial hypothesis claims that extending the spreadsheet - a two-dimensional grid of cells, with a third dimension of time could improve the expressive power of spreadsheets and simplify modeling more complex domains, that are otherwise difficult to model in conventional spreadsheets.

## User Study

Prior to designing and developing the ABM Sheets software system, an initial user study was conducted to test this hypothesis. The study consisted of a series of video interviews with people of various technical backgrounds and with different experience with spreadsheets. The format of the interview was to give the participants a simple modeling assignment in Microsoft Excel and observe how they manage to complete this assignmemnt. Although the assignment was rather simple and easy to understand, it was intentionally designed in a way to require cumbersome methods and workarounds to be successfully completed. The primary aim of this study was to test the limits of spreadsheets in terms of multi-dimensional models and to discover main limitations ABM Sheets could address.

### Assignment

The interview assignment was a simple agent-based simulation of a running race. We have a set of runners running in a one-dimensional space (line). All runners start at point `0` and run towards the finish line (e.g. `100`). Each runner is assigned a random initial speed based on which it moves forward (movement could be modeled as `NEW_POISTION = PREV_POSITION + SPEED`). The speed is incremented or decremented by a random small amount in each new time step. If any runner crosses the finish line, all runners stop moving. Furthermore, we want to observe the entire race from start to finish as time passes and runners move and see the state of the race in each time step.

The original assignment is described further in [this document](./user-study.md).

### Participants

The study involved four participants. Two had extensive prior experience with Microsoft Excel and had been using it regularly in either professional or personal contexts, both for modeling and analytical tasks. The other two participants were university students of a technical field with limited prior exposure to spreadsheet tools, but with solid foundation in programming concepts.

### Solutions

Interestingly enough, all four participants approached the problem in similar ways. The first two participants initially chose an analytical method of modeling time, calculating the positions of the runners as `T * SPEED`, where `T` is the current time step. Moreover, they modeled `TIME_AT_FINISH` as `FINISH_LINE / SPEED` and the runner with the lowest `TIME_AT_FINISH` value won. However, this approach was unsuitable since the task required simulating individual time steps.

Eventually, all four participants chose an approach where columns represented time steps and rows represented runners. The participants created two such tables, one for the changing `POSITION` attribute and one for the changing `SPEED` attribute. They calculated `SPEED` as `SPEED[T] = SPEED[T - 1] + (RAND - 0.5)` and the `POSITION` as `POSITION[T] = POSITION[T - 1] + SPEED[T]`.

### Takeaways

Based on the approach the participants chose for modeling the running race simulation, we can observe that in order to represent the third dimension of a simulation, the participants chose to copy the first two dimensions for each element of the third dimension. In our case, we had a set of runners, each with a set of attributes (position, speed) and finally a set of time steps. When mapping time steps to the dimension of columns and runners to the dimension of rows, we need to construct two separate tables for the position and speed attributes (elements of the third dimension). Although this approach is feasable in conventional spreadsheets, as the number attributes and therefore dimensions of the model rises, it quickly becomes cumbersome to do maintain the transparency of the model.

When we asked the first participant why they initially chose the analytical approach for constructing the model, they responded that they wanted to avoid time steps altogether, although they later realized it was not possible. When asked why they wanted to avoid time steps, they responded:

_"I guess because once you set the columns to time steps, you have lost a dimension of your spreadsheet and so now everything is one-dimensional and everything about the dynamics has to be embedded in a single formula and that can get really complicated, so I was trying to get away from not having to do that for as long as possible. You've only got two dimensions, and if you use one for time, everything else becomes miserable."_

Moreover, the second participant had an interesting remark about the popularity of spreadsheets in general:

_"One of the benefits of Excel, as you probably know, is just the whip attitude of it, you know, this kind of interactive, reactive programming environment. The ability to mix data and formulas/programming in the same environment is extremely attractive."_

Whereas the first quote directly supports our initial hypothesis that embedding time into the spreadsheet environment as a native feature truly simplifies modeling multi-dimensional simulations, the second quote gave us great motivation for the potential popularity of ABM Sheets thanks to the popularity of spreadsheets as such. Therefore we concluded that designing ABM Sheets as closely as possible to conventional spreadsheets would give the project a great advantage in being usable for a wide range of users.

At the end of the interviews, we explained to each participant the purpose of the study and our intention to create a new spreadsheet tool with the native time extension. To this, the first participant responded that it would be a useful addition to embedd the third dimension of discrete time into the software system to enable travelling through the time bi-directionally and enable cell self-referrencing in a more complex and useful manner.

## Evaluation Study

After the design and development of ABM Sheets was completed, a follow-up evaluation study was conducted to assess whether the system addressed the limitations observed in the initial user study. The study was conducted in a similar manner than the initial user study and consisted of a series of video interviews with people of various technical background and with different experience with spreadsheets. The format of the interviews was to give the participants the same modeling task as in the initial study, however, this time the participants were given ABM Sheets to complete the assignment.

Before diving into the task, the participants were given a brief introduction to the system and its extended features compared to conventional spreadsheet tools.

### Participants

The evaluation study included four participants, each with more than five years of programming experience. One had substantial prior experience with spreadsheet tools, while the other three had only limited exposure.

### Solutions

With minimal assistance, all four participants successfully completed the assignment in alignment with the intended design of ABM Sheets. They consistently represented runners as rows and attributes (position, speed) as columns, relying on the built-in time dimension to drive the simulation.

One interesting thing we learned was the way that the first participant chose to self-reference a cell. For the `POSITION` column, the participant tried to model the formula as `A1: = 0 = PREV(A1, STEP() - 1) + A2`, where `A2` represented `SPEED`. The `PREV(A1, STEP() - 1)` evaluates to the value of `A1` in the previous time step, however, a simplified version that ABM Sheets supports would look like `A1: = 0 = A1 + A2` as `A1` is a self-reference and always evaluates to the previous time step. The fact that the participant naturally decided to use the `PREV` function to reference the previous time step pointed us in the direction to omit the simplified short-hand version and require explicit use of `PREV` for self-references - an idea we thought about in the course of the entire development of ABM Sheets. However, this idea is not yet implemented and will potentially be added in future releases of ABM Sheets.

The second and the third participant also mentioned an interesint thing. Both participants commented that this software would have great use in physics simulations, as they often require time in their calculations, making ABM Sheets a great tool to explore this field. Furthermore, the third participant mentioned that this tool, as "technical" as it is, could be a great learning tool for elementary/high school students exploring interactive programming system, describing it as an accessible bridge between high school mathematics and university-level programming.

Last but not least, the fourth participant managed to complete the assignment very quickly, despite the fact that they had no prior experience with spreadsheets. Although they had some problems with the naming of the built-in functions and how formulas worked, they described the concept of built-in time as “very natural to understand and use”, directly supporting the ease of use of ABM Sheets.

## Conclusion

The research carried out through both the initial user study and the evaluation study provides strong evidence that supports our initial hypothesis: extending the spreadsheet paradigm with a native notion of discrete time greatly improves its expressive power and significantly simplifies modeling tasks that are otherwise cumbersome or impractical to model in conventional spreadsheet systems.

The user study confirmed that in traditional spreadsheets, participants needed to resort to repetitive and structurally inefficient workarounds to model time. Their chosen strategy of duplicating tables for each attribute across time steps or attempting to compress the model into analytical formulas underscored the difficulty of modeling multi-dimensional models using conventional approach in a two-dimensional grid. More importantly, the feedback from the participants explicitly supported the hypothesis, that using one axis of the spreadsheet to represent time comes at the cost of clarity and quickly makes the model difficult to manage and extend.

In contrast, the evaluation study of ABM Sheets demonstrated that the introduction of built-in time together with self-references allows participants to build dynamic models more directly, intuitively and with less overhead. All participants, regardless of their prior experience with spreadsheets, were able to successfully complete the task in a way that aligned with the design intentions of the system. The participants' solutions were more compact and expressive than those modeled with traditional spreadsheet tools. More importantly, the gathered feedback clearly states that the concept of time as a built-in feature was natural to understand and use. Last but not least, some participants highlighted the potential of ABM Sheets not only for agent-based modeling, but also for physics simulations and educational contexts.

In conclusion, the findings from these studies support the contribution of ABM Sheets as a meaningful extension to the spreadsheet paradigm. The system successfully preserves the strengths that make spreadsheets widely popular, while overcoming one of their significant limitations, making ABM Sheets a solid prototype for building temporal models.

## Future Work

While the conducted studies provide strong evidence that supports the usefulness and intuitiveness of built-in discrete time in spreadsheets, several important questions remain open

While the conducted studies provide strong evidence supporting the usefulness and intuitiveness of built-in discrete time in spreadsheets, several important questions remain open for future research. One of the key next steps is to evaluate whether ABM Sheets can be effectively used by users with no programming backgrounds. Although the system was designed as a minimal and intuitive extension to the conventional spreadsheet paradigm, empirical validation of its accessibility for non-technical users is still needed. Conducting a dedicated user study involving participants with little or no technical experience would help verify this assumption and guide further improvements in usability and feature design.

Another area of further improvement concerns the design of temporal cell references within the system. During the evaluation study, some participants naturally leaned toward using explicit functions such as `PREV` for referencing past values, even though ABM Sheets currently supports a simplified shorthand syntax. This raises an important design question about how to best represent time-based self-references, whether through explicit or implicit mechanisms, to ensure clarity and consistency without sacrificing usability. Future iterations of ABM Sheets will explore these alternatives in more depth, aiming to identify the most comprehensible and intuitive approach for users across different levels of expertise.
