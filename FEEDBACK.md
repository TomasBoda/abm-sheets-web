# LIVE 2025 Feedback

## Reviewer 1

- extending spreadsheets with dedicated support for time is a worthwhile goal to consider
    - because calculation involving time are common
- this motivation is an intuitive starting point
    - but wishes this essay had dug deeper into motivations and details about design
- essay mentions few recurring applications that are difficult, if not infeasable in existing spreadsheets
  it is hard to believe that any of these examples mentioned are infeasable
- it would be more instructive to
    - implement examples in traditional spreadsheets
    - implement examples in ABM Sheets
    - compare and describe drawbacks
    - it is difficult to know specifically what problems are being addressed by the proposed work
- it would be useful to know
    - who the interviewees were
    - the recruitment process
    - the tasks they completed
    - any prior knowledge of the authors and the work
- question: why not only use `PREV`? (confusion)
- case studies were weak
    - did not highlight how the tasks are significantly simpler to implement in the prototype system compared to traditional systems

## Reviewer 2

- strengths
    - well-motivated and novel
    - a working system that readers could easily try out
    - visualisation panel brings liveliness of spreadsheet to the next level with additional benefits of easing comprehension
- weaknesses
    - the formative study feels underwhelming
        - the paper should justify the participant selection
        - how their backgrounds influenced their approaches
        - deeper analysis of the specific challenges
    - the case studies don't explain why conducting these tasks in the proposed system is easier than using traditional spreadsheets
        - having some comparative case studies could help
    - discussion about the tradeoff between the transparency of cells (in traditional spreadsheets) vs. the power of self-referencing
        - core strength of spreadsheets are their transparency
        - self-referencing cells implicitely access previous time steps and almost approximates the idea of loops, but they make it harded to reason about the cell's value at a give moment
        - what could be possible interface enhancements to address this limitation?

## Reviewer 3

- it is interesting to see a fresh take on the topic of spreadsheets
- sees the merit in this idea and hopes to see it explored further
- doesn't see lack of visualisation as a limitation, rather an opportunity for some additional visualisation

- could add the feature to connect your own visualisation to the spreadsheet environment
- would be extremely helpful when working on model development
- could be used for model refinement and parameter tuning where multiple instances of the simulation with different parameters or starting states could be visualised side by side

## Administrator

- provocative question: how serious is the loss of visibility from the addition of time?
    - is this a problem?
    - is it totally fine in practice?
    - are there ways to restore visibility in ABM Sheets?
