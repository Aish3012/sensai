import { getResume } from '@/actions/resume';
import React from 'react'
import ResumeBuilder from './_components/resume-builder';
import ChatWidget from '@/components/grokChat';

const ResumePage = async () => {
    const resume = await getResume()

  return (
    <div className='container mx-auto py-6'>
        <ResumeBuilder initialContent={resume?.content}/>
         <ChatWidget /> 
    </div>
  );
};

export default ResumePage;