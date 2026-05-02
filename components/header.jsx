import { Show, SignInButton, UserButton } from '@clerk/nextjs'
import React from 'react'
import { Button } from './ui/button'
import { checkUser } from '@/lib/checkUser';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, GraduationCap, LayoutDashboard, PenBox, StarIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const Header = async () => {
    await checkUser();
    return (
        <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 
        supports-backdrop-blur:bg-background/60'>
            <nav className='container mx-auto px-4 h-16 flex items-center justify-between'>
                <Link href='/'>
                    <Image src="/logo.png" alt="Sensai Logo" width={200} height={60}
                        className='h-12 py-1 w-auto object-contain'
                    />
                </Link>

                <div className='ml-auto flex items-center gap-3' >
                    <Show when="signed-in">
                        <Link href='/dashboard'>
                            <Button variant='outline'>
                                <LayoutDashboard className="h-4 w-4" />
                                <span className='hidden md:block'>Industry Insights</span>

                            </Button>
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    <StarIcon className="h-4 w-4" />
                                    <span className='hidden md:block'>Growth Tools</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <Link href={"/resume"} className='flex items-center gap-2'>
                                            <FileText className="h-4 w-4" />
                                            Build Resume
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Link href={"/ai-cover-letter"} className='flex items-center gap-2'>
                                            <PenBox className="h-4 w-4" />
                                            Cover Letter
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Link href={"/interview"} className='flex items-center gap-2'>
                                            <GraduationCap className="h-4 w-4" />
                                            Interview Prep
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10",
                                    userButtonPopoverCard: "shadow-xl",
                                    userPreviewMainIdentifier: "font-semibold",
                                },
                            }}
                            afterSignOutUrl="/"
                        />
                    </Show>

                    <Show when="signed-out">
                        <SignInButton>
                            <Button variant='outline'>
                                sign in
                            </Button>
                        </SignInButton>
                    </Show>
                </div>
            </nav>
        </header>
    )
}

export default Header
