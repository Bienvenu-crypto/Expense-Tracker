import type { Metadata } from "next";
import "./globals.css";
import { ExpenseProvider } from "@/context/ExpenseContext";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
    title: "Expense Tracker - Manage Your Finances",
    description: "Modern expense tracker built with Next.js",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <ExpenseProvider>
                    <Header />
                    <main className="main-content">
                        <div className="container">
                            {children}
                        </div>
                    </main>
                </ExpenseProvider>
            </body>
        </html>
    );
}
