import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                expenses: { orderBy: { date: 'desc' } },
                budgets: true,
                categories: true,
                financialGoal: true,
                apiSettings: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            expenses: user.expenses,
            budgets: user.budgets.reduce((acc: Record<string, number>, b) => ({ ...acc, [b.category]: b.amount }), {}),
            categories: user.categories.map(c => c.name),
            financialGoal: user.financialGoal?.goal || "",
            apiKey: user.apiSettings?.key || ""
        });
    } catch (error) {
        console.error("Fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
