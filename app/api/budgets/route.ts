import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { budgets } = await req.json(); // Map of category -> amount

        // Use upsert to update or create budgets for each category
        const userId = session.user.id as string;
        const operations = Object.entries(budgets).map(([category, amount]) =>
            prisma.budget.upsert({
                where: {
                    userId_category: {
                        userId,
                        category
                    }
                },
                update: { amount: amount as number },
                create: {
                    userId,
                    category,
                    amount: amount as number
                }
            })
        );

        await prisma.$transaction(operations);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Budget save error:", error);
        return NextResponse.json({ error: "Failed to update budgets" }, { status: 500 });
    }
}
