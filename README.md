# TurnoListo: Playful Queue Management

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/castillocon/turnolisto-playful-queue-management)

TurnoListo is a modern, real-time queue management system designed with a playful and friendly user interface. It replaces traditional paper-ticket systems with a delightful digital experience, ensuring all views are perfectly synchronized in real-time using Cloudflare Durable Objects.

## Key Features

-   **Kiosk View**: A simple interface for customers to enter their name and receive a digital ticket.
-   **Personalized Ticket View**: A unique screen for each customer showing their number, queue position, and real-time updates.
-   **Public Display View**: A large-screen format to display the currently called number, complete with an audible chime.
-   **Admin Panel**: A secure interface for service agents to call the next customer, view the waiting list, and reset the queue.
-   **Real-Time Sync**: All views are kept in perfect sync by a central Cloudflare Durable Object.
-   **Playful UI**: A friendly and engaging design makes the waiting experience more pleasant.

## Technology Stack

-   **Frontend**: React, React Router, TypeScript
-   **Backend**: Hono on Cloudflare Workers
-   **State Management**: Zustand (Client) & Cloudflare Durable Objects (Global)
-   **UI**: shadcn/ui, Tailwind CSS, Framer Motion
-   **Tooling**: Vite, Bun

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
-   Wrangler CLI installed and authenticated: `bun install -g wrangler` then `wrangler login`.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd turnolisto_queue_app
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

## Development

To start the local development server, which includes both the Vite frontend and the Wrangler dev server for the worker, run:

```bash
bun dev
```

This will open the application in your default browser, typically at `http://localhost:3000`. The frontend will hot-reload on changes, and the worker will restart automatically.

## Project Structure

-   `src/`: Contains the frontend React application, including pages, components, and hooks.
-   `worker/`: Contains the Cloudflare Worker backend code, including the Hono API routes (`userRoutes.ts`) and the Durable Object implementation (`durableObject.ts`).
-   `shared/`: Contains shared TypeScript types used by both the frontend and backend to ensure type safety.

## Deployment

This project is configured for seamless deployment to Cloudflare Pages.

1.  **Build the application:**
    ```bash
    bun run build
    ```

2.  **Deploy to Cloudflare:**
    The `deploy` script in `package.json` handles both the build and deployment process.
    ```bash
    bun run deploy
    ```
    Wrangler will guide you through the deployment process, publishing the static assets and the worker function.

Alternatively, deploy directly from your GitHub repository with a single click:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/castillocon/turnolisto-playful-queue-management)

## License

This project is licensed under the MIT License.