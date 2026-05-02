"use client";

import { generateQuiz, saveQuizResult } from "@/actions/interview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useFetch from "@/hooks/use-fetch";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";
import QuizResult from "./quiz-result";

const Quiz = () => {
    const [currentQuestion, setCurrentQuestions] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showExplanation, setshowExplanation] = useState(false);

    const {
        loading: generatingQuiz,
        fn: generateQuizFn,
        data: quizData,
    } = useFetch(generateQuiz);

    const {
        loading: savingResult,
        fn: saveQuizResultFn,
        data: resultData,
        setData: setResultData,
    }=useFetch(saveQuizResult);

    console.log(resultData);

    useEffect(() => {
        if (quizData) {
            setAnswers(new Array(quizData.length).fill(null));
        }
    }, [quizData]);

    const handleAnswer = (answer) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answer;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if(currentQuestion < quizData.length - 1) {
            setCurrentQuestions(currentQuestion + 1);
            setshowExplanation(false);
        }else{
            finishQuiz()
        }
    };

    const calculateScore = () => {
        let correct =0;
        answers.forEach((answer, index) => {
            if(answer == quizData[index].correctAnswer) {
                correct++;
            }
        });
        return correct;
    };

    const finishQuiz = async () => {
        const score = calculateScore();
         const percentage = (score / quizData.length) * 100;
         console.log("DEBUG score:", score, "answers:", answers, "quizData:", quizData);
        try {
            await saveQuizResultFn(quizData, answers, percentage)
            toast.success("Quiz Completed")
        } catch (error) {
            toast.error(error.message || "Failed to save quiz result");
        }
    };

    const startNewQuiz = () => {
        setCurrentQuestions(0);
        setAnswers([]);
        setshowExplanation(false);
        generateQuizFn();
        setResultData(null);
    };


    if (generatingQuiz) {
        return <BarLoader className="mt-4" width={"100%"} color="gray" />;
    }

    //show results if quiz is completed 
    if(resultData) {
        return (
            <div className="mx-2">
                <QuizResult result ={resultData} onStartNew={startNewQuiz} /> 
            </div>
        );
    }

    if (!quizData) {
        return (
            <Card className={"mx-2"}>
                <CardHeader>
                    <CardTitle>Ready to test your Knowledge?</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This quiz contains 10 questions specific to your industry and
                        skills. Take your time and choose the best answer for each question.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={generateQuizFn}>Start Quiz</Button>
                </CardFooter>
            </Card>
        );
    }

    const question = quizData[currentQuestion];

    return (
        <Card className={"mx-2"}>
            <CardHeader>
                <CardTitle>
                    Question {currentQuestion + 1} of {quizData.length}
                </CardTitle>
            </CardHeader>
            <CardContent className={"space-y-4"}>
                <p className="text-lg font-medium">{question.question}</p>

                <RadioGroup defaultValue="space-y-2"
                    onValueChange={handleAnswer}
                    value={answers[currentQuestion]}
                >
                    {question.options.map((option, index) => {
                        return (
                            <div className="flex items-center gap-3" key={index}>
                                <RadioGroupItem value={option} id={`option-${index}`} />
                                <Label htmlFor={`option-${index}`}>{option}</Label>
                            </div>
                        )
                    })}
                </RadioGroup>

                {showExplanation && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="font-medium">Explanation:</p>
                        <p className="text-muted-foreground">{question.explanation}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                {!showExplanation && (
                    <Button
                    onClick={() => setshowExplanation(true)}
                    variant="outline"
                    disabled={!answers[currentQuestion]}
                    >
                        Show Explanation
                    </Button>
                )}

                 <Button
                    onClick={handleNext}
                    className={"ml-auto"}
                    disabled={!answers[currentQuestion] || savingResult}
                    >
                        {savingResult && < Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {currentQuestion < quizData.length - 1
                        ? "Next Question"
                        : "Finish Quiz" }
                    </Button>
            </CardFooter>
        </Card>
    );
};

export default Quiz;