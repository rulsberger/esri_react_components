# React Components Project

## Project Overview

This repo contains refactors of widgets with the intension to increase reusability and align with our goal of developing modular React components for Experience Builder and standalone ESRI Maps SDK applications.

The goal of doing development in this manner is to:

- Reduce code duplication across applications.
- Make our components usable outside Experience Builder.
- Future-proof our development as we anticipate potential shifts in ESRI tooling.

## Project Structure

- dist/                      # Built files
- public/                    # Static Files
- node_modules/              # Node.js modules
- src/                       # Source files
  - components/              # React components
  - libs/                    # Utility libraries
  - App.tsx                  # Main application file
  - main.tsx                 # Entry point for the application
- tests/                     # Test files
  - unit/                    # Unit tests
  - integration/             # Integration tests
  - utils/                   # Test utilities
- package.json               # Development package.json
- package.dev.json           # Development package.json (for development branches)
- package.prod.json          # Production package.json (for deployment)
- vite.config.ts             # Vite configuration
- vite.dev.config.ts         # Vite configuration (for development branches)
- vite.prod.config.ts        # Vite configuration (for deployment)
- vite.test.config.ts        # Vite test configuration
- tsconfig.json              # TypeScript configuration
- README.md                  # Project documentation

--- 

## Development Workflow

--- 

## Setting Up the Development Environment

1. **Clone the Repository:**

  ```
  git clone https://github.com/your-repo/react_components.git
  cd react_components
  ```

2. **Copy the Development Package.json:**

  ```
  cp package.dev.json package.json
  ```

3. **Install Dependencies:**

  ```
  npm install
  ```

### Running the Project

To start the development server, run:

  ```
  npm run dev
  ```

This will start the Vite development server and open the application in your default browser.

## Running Tests

To run unit tests and integration tests, use:

  ```
  npm test
  ```

## ESRI Maps SDK Integration

In the development environment, the project includes code for a simple ESRI Maps SDK application to test and use the components being developed. This part of the application is not accessed when deployed, but it is included in the repository, making the bundle slightly larger.

### Using the ESRI Maps SDK

To test the components with the ESRI Maps SDK:

1. **Ensure the Development Environment is Set Up:**

   Follow the steps in the "Setting Up the Development Environment" section.

2. **Start the Development Server:**

  ```
  npm run dev
  ```

3. **Access the Application:**

  Open the application in your browser to interact with the ESRI Maps SDK and test the components.

--- 

## Building the Project

For deployment, switch to the `Deploy` branch and follow these steps:

1. **Copy the Production Package.json:**

  ```
  cp package.prod.json package.json
  ```

2. **Install Dependencies:**

  ```
  npm install
  ```

3. **Build the Project:**

  ```
  npm run build
  ```

4. **Commit the Built Files:**

  ```
  git add dist/
  git commit -m "Build for deployment"
  git push origin Deploy
  ```

