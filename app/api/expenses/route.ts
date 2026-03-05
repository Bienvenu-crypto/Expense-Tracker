import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { amount, category, description, date, timestamp } = await req.json();
        const expense = await prisma.expense.create({
            data: {
                amount,
                category,
                description,
                date: new Date(date),
                timestamp,
                userId: session.user.id as string
            }
        });
        return NextResponse.json(expense);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, amount, category, description, date, timestamp } = await req.json();
        const expense = await prisma.expense.update({
            where: { id, userId: session.user.id as string },
            data: {
                amount,
                category,
                description,
                date: new Date(date),
                timestamp
            }
        });
        return NextResponse.json(expense);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await req.json();
        await prisma.expense.delete({
            where: { id, userId: session.user.id as string }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
    }
}
