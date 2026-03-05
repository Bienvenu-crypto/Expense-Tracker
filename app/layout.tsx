import type { Metadata } from "next";
import "./globals.css";
import { ExpenseProvider } from "@/context/ExpenseContext";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
    title: "Expense Tracker - Manage Your Finances",
    description: "Modern expense tracker built with Next.js",
};

import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <ExpenseProvider>
                        <Header />
                        <main className="main-content">
                            <div className="container">
                                {children}
                            </div>
                        </main>
                    </ExpenseProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
