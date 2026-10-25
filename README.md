# eVoting V2

An upgraded school election voting website built as a learning project, focusing on full-stack development, database design, authentication, and voting privacy.

## About the Project

eVoting V2 is an independent continuation of my original school election voting project (V1). I decided to rebuild and improve the system to deepen my understanding of web development, backend architecture, databases, APIs, and security.

The project aims to provide a structured online voting system with election management, candidate management, voter authentication, vote counting, and an administrative dashboard.

This version is a completed learning prototype, with plans to continue improving the system in V3.

## Features

- **Election Management** — Manage election information and settings.
- **Candidate Management** — Organize and display candidates for elections.
- **Election Scheduling** — Manage election dates and voting periods.
- **Voting System** — Allow eligible students to cast their votes.
- **Vote Counting and Results** — Process votes and display election results.
- **Voting Privacy** — Implement measures to separate voter identity from individual vote choices.
- **User Authentication** — Authenticate students using a five-digit Student ID and password.
- **Admin Dashboard** — Provide administrative functionality for managing elections and related data.
- **Duplicate Voting Prevention** — Implement and test server-side controls to prevent students from voting more than once in an election.

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite

**Backend**
- Node.js
- Express.js
- TypeScript

**Database**
- PostgreSQL

**Development Tools**
- Git and GitHub
- npm
- Visual Studio Code

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- [PostgreSQL](https://www.postgresql.org/)

A PostgreSQL management tool, such as [pgAdmin](https://www.pgadmin.org/), can also be useful.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/paweenwat08/e-voting-website-v2.git
   cd e-voting-website-v2
   ```

2. Install the frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. Install the backend dependencies:

   ```bash
   cd ../backend
   npm install
   ```

4. Configure the database and environment variables according to the backend configuration. Make sure PostgreSQL is running and the database connection settings are correct.

5. Start the backend and frontend using the development scripts defined in their respective `package.json` files. Run them in separate terminals.

**Note:** Database initialization and environment configuration may be required before the application can run successfully.

## Project Structure

```text
e-voting-website-v2/
├── frontend/    # Frontend application
├── backend/            # Backend API and database logic
├── docs/                # Project documentation
└── README.md
```

The structure above provides a high-level overview. Refer to the repository for the actual source files and configuration.

## Security and Privacy

Security and voting privacy were important considerations throughout the development of this project.

The system includes authentication, server-side duplicate-voting prevention, and measures intended to protect the privacy of individual votes. These features have been implemented and tested as part of the learning project.

However, testing does not guarantee that a system is free from vulnerabilities. This project has not been independently security-audited and should not be considered suitable for official or high-stakes elections without further review, testing, and appropriate safeguards.

## Future Development

Although V2 is completed, this project is still part of my learning journey.

I plan to develop **eVoting V3**, where I can apply what I have learned, improve the system architecture, strengthen security, and explore better approaches to database design and voting privacy.

## Repository

GitHub: https://github.com/paweenwat08/e-voting-website-v2

## Not neccesary , you can ignore this

This is an upgraded E-voting election website. I made a version 1 for School senior project, then I decided to improve my project alone. I studied Frontend, Backend, Api, Security, Database, etc. from Youtube, I put much efforts into this project. I am happy that I actually completed the project. I tried to give up many times. Most of code are genereated by AI, I tried to read all lines (css not included) to make sure everything was correct, safe and fixed. It might still be Bugs or the Structure might be broken somewhere inside the project. I created this for Learning purpose. I love when people comment about my work, it improves and motivates me, in a good way. Soo u guys feel free to comment. Many features are removed, plan was changed many times because I couldn't make it. I will learn more until I understand everything and then, I will make a version 3. with love:)