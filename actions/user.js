"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
    const { userId } = await auth();
    if (!userId) throw Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });

    if (!user) throw new Error("User not found");

    try {
        const result = await db.$transaction(
            async (tx) => {
                //find if the industry exists
                let industryInsights = await tx.industryInsights.findUnique({
                    where: {
                        industry: data.industry,
                    },
                });

                //if industry doesnot exists, create it with default values
                if (!industryInsights) {
                    const insights = await generateAIInsights(data.industry);

                    industryInsights = await tx.industryInsights.create({
                        data: {
                            industry: data.industry,
                            ...insights,
                            lastupdated: new Date(),
                            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        },
                    });
                }
                //update the user
                const updatedUser = await tx.user.update({
                    where: {
                        clerkUserId: userId,
                    },
                    data: {
                        industry: data.industry,
                        experience: data.experience?.toString(),
                        bio: data.bio,
                        skills: data.skills ?? [],
                    },
                });
                return { updatedUser, industryInsights };
            },
            {
                timeout: 30000,  //default : 5000
            }
        );
        return { success: true, ...result };
    } catch (error) {
        console.error("Error updating user and industry:", error);
        throw new Error("Failed to update Profile: " + error.message);
    }
}

export async function getUserOnboardingStatus() {
    const { userId } = await auth();
    if (!userId) throw Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });
    if (!user) throw new Error("User not found");

    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
            select: {
                industry: true,
            },
        });
        return {
            isOnboarded: !!user?.industry,
        };
    } catch (error) {
        console.error("Error checking Onboarding status", error.message);
        throw new Error("Failed to check Onboarding status");
    }
}
