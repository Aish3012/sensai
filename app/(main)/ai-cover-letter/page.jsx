import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CoverLetterList from "./_components/cover-letter-list";
import { getCoverLetters } from "@/actions/cover-letter";
import GrokChat from "../chat/page";
import ChatWidget from "@/components/grokChat";


export default async function CoverLetterPage() {
 const coverLetters = await getCoverLetters();
  return (
   <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">My Cover Letters</h1>
        <Link href="/ai-cover-letter/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

       <CoverLetterList coverLetters={coverLetters} />
        <ChatWidget /> 
    </div>
  );
}