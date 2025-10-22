# Case Studies

**Project**: ABM Sheets \
**Author**: Bc. Tomáš Boďa \
**Supervisor**: Mgr. Tomáš Petříček, Ph.D.

## About

This document provides several example models created using ABM Sheets.

## Case Studies

### 1. Running Race

The running race is a simple agent-based simulation, where there is a set of runners racing in a one-dimensional space. Each runner starts at position `0` and races towards the finish line (e.g. `100`). At the beginning of the race, each runner is assigned a random velocity from the interval `[1,5]`. In each new time step, each runner adjusts their velocity by a random small amount, never going below `1` and moves towards the finish line using their velocity. As soon as any of the runners crosses the finish line, the race stops.

We provide two versions of this model. The **legacy version** is modeled using the conventional spreadsheet paradigm (without the built-in time), whereas the **time-based version** is modeled using the built-in time, directly utilising the benefits of ABM Sheets.

In the **legacy version**, since the velocities of the runners need to be updated in each new time step, we cannot model this using an analytical approach. Therefore, we need to reserve one dimension of the spreadsheet for modeling time steps. Then, we need to create two separate tables, one for the positions of the runners, and one for the velocities of the runners. In each new time step (column), the current position is incremented by the current velocity and the current velocity is calculated from the previous velocity. Finally, we create a third table, where we calculate whether the runners crossed the finish line or not.

Live demo of the **legacy version** can be found on [this link](https://abm-sheets-web.vercel.app/spreadsheet?projectId=91c02999-a95c-4e22-8fe3-1ddad695d820).

In the **time-based version**, we create a regular table, where rows represent runners and columns represent their attributes (position, velocity, finished or not, ...). We utilise the time-aware self-references, which model time steps natively. Compared to the legacy version, this model requires only one table, which is easily scalable both in terms of agents as well as their attributes.

Live demo of the **time-based version** can be found on [this link](https://abm-sheets-web.vercel.app/spreadsheet?projectId=685f4029-923d-4c60-a9fe-63a14cc30ac0).

### 2. Cannonball

The cannonball simulation is a simple physics model representing the shooting of cannonballs in a two-dimensional space. Each cannonball calculates their `x` and `y` coordinates based on their velocity, shooting angle and time progression. These cannonballs are then plotted as lines in a line graph.

Live demo of the model can be found on [this link](https://abm-sheets-web.vercel.app/spreadsheet?projectId=85e7b44e-94b5-44c2-81d8-0ed41339363e).

### 3. Wolf-sheep Predation

The wolf-sheep predation model explores the stability of predator-prey ecosystems. It is an agent-based simulation that consists of two types of agents - predators (wolves) and prey (sheep). Wolves attempt to eat the sheep in order to survive. If their energy runs out, they die and respawn only after eating a sheep that crosses their path. On the other hand, if a sheep gets eaten, it dies and respawns after a certain time passes. This simulation aims to observe the changes in the wolf and sheep population over time.

In the plotted graph, we can observe two dynamic lines representing the population of the wolves and the sheep as time progresses.

We can observe that at first, the population of sheep decreases as the wolves eat the sheep. As there is less sheep for the wolves to eat, their energy runs out shortly, resulting in the decrease of the wolf population. With this decrease, the sheep can regenerate and respawn and with less wolves to eat them, they prosper. However, with more sheep in the area, there is a higher probability of an encounter with the wolves, resulting in the increase of the wolf population.

As we can see in the line graph, the lines are being plotted in a sinusoid manner, where the increase of one population results in the decrease of the other population.

Live demo of the model can be found on [this link](https://abm-sheets-web.vercel.app/spreadsheet?projectId=250e4e0f-8ef8-430a-ad4e-491d2abd2349).
