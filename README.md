# VSCodeweb

## Project Description

VSCodeweb is a web-based code editor application built with modern web technologies, aiming to replicate the core functionalities and user experience of a desktop IDE like VS Code in a browser environment. It features a responsive layout, resizable panels, a file explorer, an editor area, a terminal panel, and a command palette, all powered by a robust component library.

## Features

-   **Intuitive User Interface**: Mimics the familiar VS Code layout with an Activity Bar, Sidebar, Editor Area, Panel, and Status Bar.
-   **Resizable Panels**: Dynamically adjust the size of the sidebar and bottom panel for a personalized workspace.
-   **File Management**: Basic file operations within the editor (saving, closing tabs).
-   **Command Palette**: Quick access to various commands via `Ctrl/Cmd + Shift + P`.
-   **Keyboard Shortcuts**: Efficient navigation and control with VS Code-like keybindings:
    -   `Ctrl/Cmd + B`: Toggle Sidebar visibility.
    -   `Ctrl/Cmd + `` `: Toggle Panel visibility.
    -   `Ctrl/Cmd + Shift + P`: Open Command Palette.
    -   `Ctrl/Cmd + S`: Save active file.
    -   `Ctrl/Cmd + W`: Close active tab.
-   **Rich UI Components**: Utilizes a comprehensive set of UI components from Radix UI and Shadcn UI for a consistent and polished look and feel.
-   **Monaco Editor Integration**: Provides a powerful code editing experience with features like syntax highlighting and code completion.

## Technologies Used

This project is built using a modern web development stack:

| Category        | Technology           | Version/Description                                    |
| :-------------- | :------------------- | :----------------------------------------------------- |
| **Framework**   | React                | ^19.2.0                                                |
| **Build Tool**  | Vite                 | ^7.2.4                                                 |
| **Language**    | TypeScript           | ~5.9.3                                                 |
| **Styling**     | Tailwind CSS         | ^3.4.19 (with Shadcn UI theme)                         |
| **State Mgmt.** | Zustand              | ^5.0.14                                                |
| **UI Library**  | Radix UI             | Various components (accordion, dialog, dropdown-menu, etc.) |
| **Editor**      | Monaco Editor        | ^0.55.1, @monaco-editor/react ^4.7.0                   |
| **Routing**     | React Router         | ^7.6.1                                                 |
| **Utilities**   | clsx, tailwind-merge | For conditional styling and merging Tailwind classes   |
| **Date Mgmt.**  | date-fns             | ^4.1.0                                                 |
| **Validation**  | Zod                  | ^4.3.5                                                 |

## Project Structure

The project follows a standard React application structure:

```
VSCodeweb/
├── app/
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components and layout sections
│   │   │   ├── ui/           # Shadcn UI components
│   │   │   └── views/        # Specific view components (e.g., ExplorerView)
│   │   ├── data/             # Initial data or mock data
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   ├── pages/            # Top-level page components
│   │   ├── stores/           # Zustand stores for state management
│   │   ├── types/            # TypeScript type definitions
│   │   ├── App.css           # Application-specific styles
│   │   ├── App.tsx           # Main application component
│   │   ├── index.css         # Global styles
│   │   └── main.tsx          # Entry point for React rendering
│   ├── index.html            # Main HTML file
│   ├── package.json          # Project dependencies and scripts
│   ├── postcss.config.js     # PostCSS configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── tsconfig.json         # TypeScript configuration
│   └── vite.config.ts        # Vite build configuration
└── README.md                 # This file
```

## Installation

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v20 or higher)
-   npm or pnpm

### Steps

1.  Clone the repository (if applicable, otherwise assume project files are already present):
    ```bash
    git clone <repository-url>
    cd VSCodeweb/app
    ```
2.  Install NPM packages:
    ```bash
    npm install
    # or pnpm install
    ```

## Usage

To run the development server:

```bash
npm run dev
# or pnpm run dev
```

This will start the Vite development server, and you can access the application in your browser, usually at `http://localhost:5173`.

To build the project for production:

```bash
npm run build
# or pnpm run build
```

This will compile the project into the `dist` directory.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name/Project Maintainer - [email@example.com](mailto:email@example.com)
Project Link: [https://github.com/your_username/VSCodeweb](https://github.com/your_username/VSCodeweb)
