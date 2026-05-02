import { industries } from '@/data/industries';
import React from 'react';
import OnboardingForm from './_components/onboarding-form';
import { getUserOnboardingStatus } from '@/actions/user';
import { redirect } from 'next/navigation';
import ChatWidget from '@/components/grokChat';

export default async function OnboardingPage () {
    //check if user is already onboarded
    const { isOnboarded } = await getUserOnboardingStatus();

    if (isOnboarded)  {
        redirect("/dashboard");
    }

  return (
    <main >
        <OnboardingForm industries={industries}/>
         <ChatWidget /> 
    </main>
  )
}

