# Anna Seva Portal: A Digital PDS Platform

The **Anna Seva Portal** is a modern, proof-of-concept web application designed to digitize and streamline a **Public Distribution System (PDS)**. Its goal is to provide a transparent, efficient, and user-friendly platform for both ration card holders and PDS distributors to manage and access essential food entitlements.

This project was built in Firebase Studio.

## ✨ Key Features

The portal is divided into two distinct roles, each with a tailored set of features.

### 👤 For Ration Card Holders (Citizens)

-   **Dashboard**: A personalized dashboard showing monthly grain entitlements, upcoming token dates, and recent activity.
-   **Order Rations**: An e-commerce-like experience to browse available subsidized items (rice, wheat, sugar, etc.), add them to a cart, and place an order.
-   **Simulated Payments**: A simulated UPI QR code checkout process to mimic real-world digital payments.
-   **Book Token**: A calendar-based system to book a time slot for ration collection, helping to reduce queues and wait times at the shop.
-   **Find FPS**: An interactive map to locate nearby Fair Price Shops (FPS).
-   **AI-Powered Suggestions**: A generative AI feature that provides personalized grocery recommendations based on purchase history, seasonal availability, and regional food habits.
-   **Complaints System**: A dedicated section to submit and track the status of complaints or feedback.
-   **Profile Management**: View personal details, ration card number, and linked FPS.

### 🏪 For PDS Distributors (Shop Owners)

-   **Distributor Dashboard**: An overview of key metrics, including stock levels, orders fulfilled, and upcoming distribution cycles, complete with a bar chart for inventory visualization.
-   **Stock Management**: An interface to update inventory levels for all products and announce the start date for the next distribution cycle.
-   **Fulfilled Orders**: A historical log of all completed orders.
-   **Slot Management**: A visual overview of how many tokens have been booked for each available time slot, helping to manage crowd flow.
-   **Profile Management**: View shop details, ID, and other distributor-specific information.

---

## 🚀 Tech Stack

This application is built using a modern, robust, and scalable technology stack:

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **UI Library**: [React](https://react.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Component Library**: [ShadCN/UI](https://ui.shadcn.com/)
-   **Generative AI**: [Google's Genkit](https://firebase.google.com/docs/genkit)
-   **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
-   **Charts**: [Recharts](https://recharts.org/)

---

## 🏁 Getting Started

To run this project locally, follow these steps:

### Prerequisites

-   [Node.js](https://nodejs.org/en) (v18 or later)
-   [npm](https://www.npmjs.com/) (or another package manager like yarn or pnpm)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    This project uses npm to manage packages.
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add any necessary environment variables (e.g., API keys for Genkit).
    ```
    # .env
    GEMINI_API_KEY=your_api_key_here
    ```

### Running the Development Server

Once the dependencies are installed, you can start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:9002` (or another port if 9002 is in use).

---

## 📁 Project Structure

The codebase is organized to be modular and maintainable:

-   `src/app/`: Contains the core application routing and pages, following the Next.js App Router structure.
    -   `src/app/(main)/`: Layout and pages for authenticated users.
    -   `src/app/(main)/dashboard/`: User dashboard.
    -   `src/app/(main)/distributor/`: Pages specific to the distributor role.
    -   `src/app/login/`: The main login page.
-   `src/components/`: Shared React components.
    -   `src/components/ui/`: Auto-generated ShadCN/UI components.
    -   `src/components/shared/`: Custom shared components like the Header and Sidebar.
-   `src/ai/`: Contains the Genkit flows for generative AI features.
-   `src/lib/`: Utility functions, static data, and type definitions.
-   `public/`: Static assets like images and fonts.
-   `tailwind.config.ts`: Configuration for Tailwind CSS.
-   `next.config.ts`: Configuration for Next.js.
