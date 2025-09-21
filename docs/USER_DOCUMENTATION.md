# User Documentation

**Project**: ABM Sheets
**Author**: Bc. Tomáš Boďa
**Supervisor**: Mgr. Tomáš Petříček, Ph.D.

## Abstract

Spreadsheets are powerful tools for data analysis and modeling, but they are inherently limited to two dimensions - rows and columns, making it difficult to represent systems that evolve over time. This limitation poses challenges for domains like agent-based modeling, physics simulations, or financial market analysis, where the concept of time is fundamental. In particular, agent-based models require tracking multiple agents, each with evolving attributes, across discrete time steps - something traditional spreadsheets struggle to express without resorting to duplication and convoluted formulas. We address this limitation by extending the spreadsheet paradigm with a built-in support for discrete time, allowing cells to reference their own values from previous time steps directly. This extension preserves the familiar spreadsheet paradigm while adding a powerful new dimension of time. With this approach, users can build and explore dynamic models, such as agent-based simulations with the same ease as traditional spreadsheet calculations.

## System Requirements

- minimum hardware/software requirements
- supported platforms

## Installation Guide

- step-by-step instructions (with screenshots if possible)
- setup of required accounts, permissions, or external software

## Getting Started

- first steps after installation
- logging in / creating an account (if relevant)
- quick-start tutorial

## User Interface Guide

### Landing Page

Upon navigating to the [ABM Sheets homepage](https://abm-sheets-web.vercel.app), you will see a welcome screen.

![landing_page](/docs/screenshots/landing-page.png)

To navigate to the spreadsheet, click the `Get started` button.

### Spreadsheet Page

Upon navigating to the `/spreadsheet` page, you will see an empty spreadsheet with a toolbar at the top of the screen.

![spreadsheet_page](/docs/screenshots/tab-simulation.png)

#### Toolbar

In the toolbar, you can see a navigation menu with five options:

- `Home` - provides options for styling spreadsheet cells
- `Simulation` - provides simulation controls
- `Graph` - opens a sidebar with the graph view
- `Projects` - opens a sidebar with the user's projects
- `Import & Export` - provides options for exporting a project or importing an existing project

![spreadsheet_page_toolbar](/docs/screenshots/toolbar.png)

##### Home Tab

The `Home` tab provides options for styling spreadsheet cells.

![spreadsheet_page_toolbar_home](/docs/screenshots/toolbar-home.png)

The user can choose from three text style options (`Bold`, `Italic`, `Underline`) or can choose to remove text styling by clicking on the `Normal` option. Moreover, the user can choose a different cell background color from 9 distinct colors. By clicking on the `Clear` button, the background color will be removed.

To change styling of a cell/cells, the user needs to select cells in the spreadsheet and then apply the styling of their choice, which will be applied to all selected cells.

##### Simulation Tab

The `Simulation` tab provides controls for the simulation.

![spreadsheet_page_toolbar_simulation](/docs/screenshots/toolbar-simulation.png)

On the left, there is a small textbox with arrow keys around it. This textbox indicates the current time step and the user can step forwards/backwards in time by clicking on the right/left arrow respectively. The next, wider textbox represents the total number of steps of the simulation. The user can change the number of time steps by editing this value in the textbox. What follows is a `Reset` button which resets the current time step to `1`. Finally, the rightmost `Play` button is used to play the simulation automatically. Upon clicking the `Play` button, the time step will reset to 0 and progressively increment, with a delay between each increment defined in the last textbox (default set to `100ms`).

##### Import & Export Tab

The `Import & Export` tab provides options to export the current spreadsheet state to a local file or import a previous export to the spreadsheet.

![spreadsheet_page_toolbar_import_export](/docs/screenshots/toolbar-import-export.png)

Upon clicking the `Export` button, the system exports the current state of the spreadsheet into a local `.json` file to the user's computer. The user can specify the filename of the exported file in the textbox on the left of the `Export` button. If no filename is provided, a default filename is used. The `Import` button on the left opens a local filesystem explorer, where the user can select a `.json` file and import the spreadsheet data into the system.

##### Projects Tab

The `Projects` tab opens a sidebar with a list of user's saved projects.

![spreadsheet_page_sidebar_projects](/docs/screenshots/sidebar-projects.png)

The `Projects` tab is visible to the user only if they are authenticated. In that case, the panel shows a list of their saved projects. If the user clicks on a project from the sidebar, it automatically loads into the spreadsheet. Morevoer, the user can delete a project by clicking on the `Trash` icon on the right side of the project's row.

To hide the `Projects` sidebar, the user needs to click on the `Projects` item in the toolbar again.

On the right-hand side of the toolbar, there is a `Save project` button.

![spreadsheet_page_toolbar_right](/docs/screenshots/toolbar-right.png)

If there is no existing project opened at the moment, the button opens a modal where the user can name and save the project to the database. After inputting the project name, description and clicking on the `Create project` button, the project will be saved to the database.

![spreadsheet_page_project_create](/docs/screenshots/project-create.png)

If the user has an existing project opened, the `Save project` button opens a modal where the user can update the project's name and description and can save current changes to the spreadsheet. Upon clicking on the `Update project` button, the project will be saved to the database.

![spreadsheet_page_project_update](/docs/screenshots/project-update.png)

##### Graph Tab

The `Graph` tab opens a sidebar with a rendered graph which the user composes in the spreadsheet.

![spreadsheet_page_sidebar_graph](/docs/screenshots/sidebar-graph.png)

On the top of the sidebar panel there is a list of cells which contain composed graph objects. The user can choose which graph to render by clicking on the corresponding cell picker item.

- walkthrough of the UI with annotated screenshots
- explanation of each major screen/menu/button

## Features & How to Use Them

- each feature explainedin clear steps
- examples of typical workflows

## Troubleshooting & FAQs

- common problems and solutions
- error messages explained

## Glossary & Help

- key terms explained
- links to further help (support email, manual, wiki, etc.)
