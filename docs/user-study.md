# ABM Sheets User Study

**Project**: ABM Sheets \
**Author**: Bc. Tomáš Boďa \
**Supervisor**: Mgr. Tomáš Petříček, Ph.D.

ABM Sheets is a research project that aims to create a new software system that allows the users to model agent-based simulations using a well-know spreadsheet interface resembling popular spreadsheet software systems such as Microsoft Excel or Google Sheets. This allows for the modeling of agent-based simulations without prior programming knowledge, only using a simple spreadsheet interface controlled by click & drag interactions.

This user study aims to find gaps and limitations of current spreadsheet software (Microsoft Excel, Google Sheets) in order to build the most suitable & usable software system interface for this problem. In this study, you will be asked to model four simple agent-based models in Microsoft Excel.

## Assignment

The assignment is to model a very simple agent-based simulation in Microsoft Excel. The simulation represents a race, where individual agents represent runners that run from the starting point to the finish line. These agents move with a certain speed and the first agent to cross the finish line wins. This assignment comes in four steps, each gaining more difficulty.

> [!IMPORTANT]
> We would like to ask you to briefly document your thinking process within these assignments, most importantly what was challenging or too difficult to simulate. These information help us discover the gaps and limitations of the current spreadsheet software that is essential for this research project.

> [!WARNING]
> We ask to spend maximum of 90 minutes on these tasks. If you cannot come up with a solution within this time slot, please document what challenges you faced and on which problem you stumbled.

### Part 1 (Tireless runners)

In the first part, we will simulate agents that move in a one-dimensional space. There is no finish line, the agents can move indefinitely. Each agent starts at point `0` and is assigned a random speed between `1` and `5`. This speed is constant throughout the race. In each new time step, each agent's new position is calculated as its previous position incremented by its speed.

Formula for random initial speed: \
`=RANDBETWEEN(1;5)`

### Part 2 (Being competitive)

In the second part, we introduce the finish line - a constant number of your choosing, for instance `100`. If an agent crosses the finish line, it finishes the race and does not move anymore, it stays at the finish line. Moreover, if an agent's left or right neighbour finishes the race (crosses the finish line), the agent stops moving too. This task simulates the behaviour that an agent loses the race if any of its neighbouring agents win, therefore stops moving.

### Part 3 (Let's change it up)

In the third part, we want the speed of each agent to change in each time step. At the beginning, each agent is assigned a random speed. In each new time step, the speed is incremented or decremented by a random small amount, but not going below `1`. The rules stay the same, so if any agent crosses the finish line, it wins and stops moving and if any of an agent's neighbours win, it stops moving as well. This task introduces a new speed attribute to each agent, which is similarly to the agent's position recalculated in each new time step from the value of the previous time step.

Formula for recalculating the speed: \
`=ROUND(MAX(1;E4+(RAND()-0,5));1)`, where `E4` is the speed in previous step.

### Part 4 (One winner to rule them all)

In the final, fourth part, we want all agents to stop moving if any agent wins the race (crosses the finish line). This task represents a realistic race where we only care about the winner (the first one to cross the finish line) and we do not care about the order of the remaining agents, which lost the race.
