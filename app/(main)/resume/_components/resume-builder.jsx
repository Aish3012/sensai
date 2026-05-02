"use client";

import { saveResume } from '@/actions/resume';
import { resumeSchema } from '@/app/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import useFetch from '@/hooks/use-fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Download, Edit, Loader2, Monitor, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import EntryForm from './entry-form';
import { entriesToMarkdown } from '@/app/lib/helper';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { marked } from 'marked';


const ResumeBuilder = ({ initialContent }) => {
    const [activeTab, setActiveTab] = useState("edit");
    const [resumeMode, setResumeMode] = useState("preview");
    const [previewCotent, setPreviewContent] = useState(initialContent);
    const { user } = useUser();
    const [isGenerating, setIsGenerating] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState(null);

    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(resumeSchema),
        defaultValues: {
            contactInfo: {},
            summary: "",
            skills: "",
            experience: [],
            education: [],
            projects: [],
        },
    });

    const {
        loading: isSaving,
        fn: saveResumeFn,
        data: saveResult,
        error: saveError,
    } = useFetch(saveResume);

    const formValues = watch();


    useEffect(() => {
        if (initialContent) setActiveTab("preview");
    }, [initialContent]);

    useEffect(() => {
        if (activeTab === "edit") {
            const newContent = getCombinedContent();
            setPreviewContent(newContent ? newContent : initialContent);
        }
    }, [formValues, activeTab]);

    const getContactMarkdown = () => {
        const { contactInfo } = formValues;
        const parts = [];
        if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
        if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
        if (contactInfo.linkedin)
            parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
        if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

        return parts.length > 0
            ? `## <div align="center">${user.fullName}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
            : "";
    };

    const getCombinedContent = () => {
        const { summary, skills, experience, education, projects } = formValues;
        return [
            getContactMarkdown(),
            summary && `## Professional Summary\n\n${summary}`,
            skills && `## Skills\n\n${skills}`,
            entriesToMarkdown(experience, "Work Experience"),
            entriesToMarkdown(education, "Education"),
            entriesToMarkdown(projects, "Projects"),
        ]
            .filter(Boolean)
            .join("\n\n");
    }

    useEffect(() => {
        if (saveResult && !isSaving) {
            toast.success("Resume saved successfully!");
        }
        if (saveError) {
            toast.error(saveError.message || "Failed to save resume");
        }
    }, [saveResult, saveError, isSaving]);

    const onSubmit = async (data) => {
        try {
            await saveResumeFn(previewCotent);
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });



    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            const html2canvas = (await import("html2canvas")).default;
            const { jsPDF } = await import("jspdf");

            const element = document.getElementById("resume-pdf");
            const content = element.innerHTML;

            const iframe = document.createElement("iframe");
            iframe.style.position = "fixed";
            iframe.style.top = "-9999px";
            iframe.style.left = "-9999px";
            iframe.style.width = "794px";
            iframe.style.height = "1123px";
            iframe.style.border = "none";
            document.body.appendChild(iframe);

            // Wait for iframe to fully load before capturing
            await new Promise((resolve) => {
                iframe.onload = resolve;

                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(`
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                color: #000000;
                                background: #ffffff;
                                margin: 0;
                                padding: 20px;
                                font-size: 14px;
                                line-height: 1.6;
                            }
                            h1, h2, h3, h4 { margin: 8px 0; }
                            p { margin: 4px 0; }
                            ul { padding-left: 20px; }
                        </style>
                    </head>
                    <body>${content}</body>
                </html>
            `);
                iframeDoc.close();
            });

            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            // Confirm content is actually there
            console.log("iframe body HTML:", iframeDoc.body.innerHTML.slice(0, 200));

            const canvas = await html2canvas(iframeDoc.body, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                width: 794,
                windowWidth: 794,
            });

            document.body.removeChild(iframe);

            const imgData = canvas.toDataURL("image/jpeg", 0.98);
            const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "JPEG", 15, 15, pdfWidth - 30, pdfHeight - 30);
            pdf.save("resume.pdf");
        } catch (error) {
            console.error("PDF generation error:", error);
        } finally {
            setIsGenerating(false);
        }
    };


    return (
        <div className='space-y-4'>
            <div className='flex flex-col md:flex-row justify-between items-center gap-2'>
                <h1 className='font-bold gradient-title text-5xl md:text-6xl'>
                    ResumeBuilder</h1>

                <div className='space-x-2'>
                    <Button
                        variant="destructive"
                        onClick={onSubmit}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save
                            </>
                        )}
                    </Button>
                    <Button onClick={generatePDF} disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="edit">Form</TabsTrigger>
                    <TabsTrigger value="preview">Markdown</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                    <form className='space-y-8'>
                        <div className='space-y-4'>
                            <h3 className='text-lg font-medium'>Contact Information</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border
                           rounded-lg bg-muted/50'>
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium'>Email</label>
                                    <Input
                                        {...register("contactInfo.email")}
                                        type="email"
                                        placeholder="your@email.com"
                                        error={errors.contactInfo?.email}
                                    />

                                    {errors.contactInfo?.email && (
                                        <p className='text-sm text-red-500'>
                                            {errors.contactInfo.email.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium'>Mobile Number</label>
                                    <Input
                                        {...register("contactInfo.mobile")}
                                        type="tel"
                                        placeholder="+1 234 567 8900"

                                    />

                                    {errors.contactInfo?.mobile && (
                                        <p className='text-sm text-red-500'>
                                            {errors.contactInfo.mobile.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium'>LinkedIn URL</label>
                                    <Input
                                        {...register("contactInfo.linkedin")}
                                        type="email"
                                        placeholder="https://linkedin.com/in/your-profile"
                                        error={errors.contactInfo?.linkedin.message}
                                    />

                                    {errors.contactInfo?.linkedin && (
                                        <p className='text-sm text-red-500'>
                                            {errors.contactInfo.linkedin.message}
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium'>Twitter/X Profile</label>
                                    <Input
                                        {...register("contactInfo.twitter")}
                                        type="url"
                                        placeholder="https://twitter.com/your-handle"
                                    />

                                    {errors.contactInfo?.twitter && (
                                        <p className='text-sm text-red-500'>
                                            {errors.contactInfo.twitter.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                           
                        </div>

                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Professional Summary</label>
                            <Controller
                                name='summary'
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className={"h-32"}
                                        placeholder="write a compelling professional summery..."
                                        error={errors.summary}
                                    />
                                )}
                            />
                            {errors.summary && (
                                <p className='text-sm text-red-500'>
                                    {errors.summary.message}
                                </p>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Skills</label>
                            <Controller
                                name='skills'
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className={"h-32"}
                                        placeholder="List your key skills..."
                                        error={errors.skills}
                                    />
                                )}
                            />
                            {errors.skills && (
                                <p className='text-sm text-red-500'>
                                    {errors.skills.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Work Experience</h3>
                            <Controller
                                name="experience"
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="Experience"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.experience && (
                                <p className="text-sm text-red-500">
                                    {errors.experience.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Education</h3>
                            <Controller
                                name="education"
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="Education"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.education && (
                                <p className="text-sm text-red-500">
                                    {errors.education.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Projects</h3>
                            <Controller
                                name="projects"
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="Project"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.projects && (
                                <p className="text-sm text-red-500">
                                    {errors.projects.message}
                                </p>
                            )}
                        </div>
                    </form>
                </TabsContent>
                <TabsContent value="preview">
                    <Button
                        variant='link'
                        type="button"
                        className={"mb-2"}
                        onClick={() =>
                            setResumeMode(resumeMode === "preview" ? "edit" : "preview")
                        }>
                        {resumeMode === "preview" ? (
                            <>
                                <Edit className="h-4 w-4" />
                                Edit Resume
                            </>
                        ) : (
                            <>
                                <Monitor className="h-4 w-4" />
                                Show Preview
                            </>
                        )}
                    </Button>

                    {resumeMode !== "preview" && (
                        <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="text-sm">
                                You will lose editied markdown if you update the form data.
                            </span>
                        </div>
                    )}

                    <div>
                        <MDEditor
                            value={previewCotent}
                            onChange={setPreviewContent}
                            height={800}
                            preview={resumeMode} />
                    </div>

                </TabsContent>
            </Tabs>

            <div
                id="resume-pdf"
                className="fixed"
                style={{ top: "-9999px", left: "-9999px", width: "794px", background: "white", color: "black", padding: "20px" }}
                dangerouslySetInnerHTML={{ __html: marked(previewCotent || "") }}
            />

        </div>

    )
};

export default ResumeBuilder;