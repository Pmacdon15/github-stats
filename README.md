# GitHub Stats Viewer

A Next.js application to display GitHub user statistics and language distribution.

## Description

This project provides a simple web interface to visualize key GitHub statistics for any user, including followers, following, public repositories, and total stars. It also generates a pie chart showing the distribution of programming languages used across their public repositories. Additionally, it offers an API endpoint to generate an image of the stats card for easy embedding in other platforms like GitHub READMEs.

## Features

*   **User Statistics**: View followers, following, public repositories, and total stars for any GitHub user.
*   **Language Distribution Chart**: A dynamic pie chart illustrating the breakdown of languages used across public repositories.
*   **Stats Card Image API**: Generate a shareable image of a user's GitHub stats card.
*   **Responsive Design**: Optimized for various screen sizes.

## How it Works

The application fetches data from the GitHub API. When a username is entered:
1.  It queries the GitHub API for the user's profile information.
2.  It then fetches all public repositories for that user.
3.  For each repository, it retrieves the language usage data.
4.  The collected data is then processed and displayed on the page as a stats card and a language distribution pie chart.

Error handling is implemented to gracefully manage scenarios like invalid usernames or API rate limits.

## Usage

Visit the live application: [gh-stats.patmac.ca](https://gh-stats.patmac.ca)

Enter a GitHub username in the search bar and press Enter or click the search button to view their statistics.

## Stats Card Image API

You can easily embed a dynamic image of a GitHub user's stats card into your own GitHub READMEs, websites, or other Markdown-supported platforms.

### Endpoint

```
https://gh-stats.patmac.ca/api/stats/<username>/image
```

Replace `<username>` with the GitHub username you want to display stats for.

### Example

To display the stats card for the user `octocat`, you would use the following Markdown:

```markdown
![GitHub Stats](https://gh-stats.patmac.ca/api/stats/octocat/image)
```

This will render an image like this:

![GitHub Stats](https://gh-stats.patmac.ca/api/stats/octocat/image)

Feel free to replace `octocat` with your own GitHub username!

## Getting Started (for Developers)

To set up the project locally:

### Prerequisites

*   Node.js (v18 or higher)
*   Bun (or npm/yarn/pnpm)
*   A GitHub Personal Access Token (PAT) with `public_repo` scope (optional, but recommended to avoid rate limits) set as `GITHUB_TOKEN` environment variable.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/<your-repo>/github-stats.git
    cd github-stats
    ```
2.  Install dependencies:
    ```bash
    bun install
    # or npm install
    ```
3.  Install Playwright browser binaries (required for the image API):
    ```bash
    bunx playwright install
    # or npx playwright install
    ```
4.  Create a `.env.local` file in the root directory and add your GitHub Token:
    ```
    GITHUB_TOKEN=your_github_personal_access_token
    ```

### Running the Development Server

```bash
bun dev
# or npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies Used

*   **Next.js**: React framework for building web applications.
*   **TypeScript**: Type-safe JavaScript.
*   **React**: UI library.
*   **Tailwind CSS**: Utility-first CSS framework.
*   **Recharts**: Charting library for React.
*   **Playwright**: Headless browser for image generation (in API routes).
*   **Lucide React**: Icon library.

