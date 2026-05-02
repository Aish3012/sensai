"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid,  ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const PerformanceChart = ({ assessments }) => {
    const [chartData, setChartData] = useState([]);


    useEffect(() => {
        if (assessments) {
            const formattedData = assessments.map((assessment) => ({
                date: format(new Date(assessment.createdAt), "MMM dd"),
                score: assessment.quizScore,
            }));
            console.log("CHART DATA:", formattedData);
            setChartData(formattedData);
        }
    }, [assessments]);
    return (
        <Card>
            <CardHeader>
                <CardTitle className={"gradient-title text-3xl md:text-4xl"}>
                    Performance Trend
                </CardTitle>
                <CardDescription>Your quiz scores over time</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='h-80'>
                    <ResponsiveContainer width={"100%"} height={300}>
                        <AreaChart
                            data={chartData}
                            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                            onContextMenu={(_, e) => e.preventDefault()}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip content={({ active, payload }) => {
                                if (active && payload?.length) {
                                    return (
                                        <div className='bg-background border rounded-lg p-2 shadow-md'>
                                            <p className='text-sm font-medium'>
                                                score: {payload[0].value}%
                                            </p>
                                            <p className='text-xs text-muted-foreground'>
                                                {payload[0].payload.date}
                                            </p>
                                        </div>
                                    );
                                }
                            }} />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#93c5fd"
                                strokeWidth={2}
                                fill="#93c5fd20"
                                dot={{ r: 4, fill: "hsl(var(--primary))" }}
                                activeDot={{ r: 6 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
