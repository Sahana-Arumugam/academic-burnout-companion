## Project Structure

The project is organized into different folders, each handling a specific part of the system:

- **frontend/**  
  This contains the React application. It handles everything the user interacts with, like the dashboard, assessment form, and insights.

- **backend/**  
  This is the Flask server where all the core logic happens. It processes user inputs, calculates burnout scores, and triggers automation.

- **salt/**  
  This folder contains SaltStack automation scripts. These scripts define what actions should be taken based on the burnout level (high, moderate, low).

- **logs/**  
  All system activity is recorded here. It includes log files and alert files generated during automation.

- **README.md**  
  This file provides an overview of the project, setup instructions, and other important details.
