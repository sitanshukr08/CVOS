import React from "react";
import { Download, FilePenLine, FileText, Menu, MessageSquareText, Sparkles } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

interface MenuItem {
  title: string;
  url: string;
}

interface Navbar1Props {
  logo?: {
    url: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
}

const defaultMenu: MenuItem[] = [
  {
    title: "Resume Intake",
    url: "/resume-intake"
  },
  {
    title: "AI Assistant",
    url: "/assistant"
  },
  {
    title: "Resume Review",
    url: "/resume-review"
  },
  {
    title: "Final Output",
    url: "/download"
  }
];

const mobileItems = [
  {
    title: "Resume Intake",
    url: "/resume-intake",
    description: "Capture profile, links, and work history before writing begins.",
    icon: <FileText className="size-5 shrink-0" />
  },
  {
    title: "AI Assistant",
    url: "/assistant",
    description: "Ask for missing context and strengthen the draft.",
    icon: <MessageSquareText className="size-5 shrink-0" />
  },
  {
    title: "Resume Review",
    url: "/resume-review",
    description: "Refine the generated draft before export.",
    icon: <FilePenLine className="size-5 shrink-0" />
  },
  {
    title: "Final Output",
    url: "/download",
    description: "Watch generation, inspect quality, and download the resume.",
    icon: <Download className="size-5 shrink-0" />
  }
];

export function Navbar1({
  logo = {
    url: "/",
    alt: "CVOS",
    title: "CVOS"
  },
  menu = defaultMenu
}: Navbar1Props) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";

  return (
    <section className="sticky top-0 z-50 border-b border-white/10 bg-[#0d1014]/84 py-4 backdrop-blur-xl">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-10">
            <a href={logo.url} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dfc497] text-[#101216]">
                <Sparkles className="size-5" />
              </div>
              <span className="text-2xl font-semibold tracking-tight text-white">{logo.title}</span>
            </a>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5">
              {menu.map((item) => (
                <a
                  key={item.title}
                  href={item.url}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActivePath(pathname, item.url)
                      ? "bg-white/[0.08] text-white"
                      : "text-[#cfc8bc] hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {item.title}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#b7b1a4]">
            Resume Flow
          </div>
        </nav>

        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <a href={logo.url} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#dfc497] text-[#101216]">
                <Sparkles className="size-4" />
              </div>
              <span className="text-lg font-semibold text-white">{logo.title}</span>
            </a>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#dfc497] text-[#101216]">
                        <Sparkles className="size-4" />
                      </div>
                      <span className="text-lg font-semibold text-white">{logo.title}</span>
                    </a>
                  </SheetTitle>
                </SheetHeader>

                <div className="my-6 flex flex-col gap-5">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="resume-flow" className="border-b-0">
                      <AccordionTrigger className="py-0 font-semibold hover:no-underline">
                        Resume Flow
                      </AccordionTrigger>
                      <AccordionContent className="mt-3">
                        <div className="space-y-2">
                          {mobileItems.map((item) => (
                            <a
                              key={item.title}
                              href={item.url}
                              className={`flex gap-4 rounded-2xl px-4 py-4 transition-colors ${
                                isActivePath(pathname, item.url)
                                  ? "bg-white/[0.08] text-white"
                                  : "bg-transparent text-[#d8d2c6] hover:bg-white/[0.05] hover:text-white"
                              }`}
                            >
                              <div className="mt-0.5 text-[#dfc497]">{item.icon}</div>
                              <div>
                                <div className="text-sm font-semibold">{item.title}</div>
                                <p className="mt-1 text-sm leading-6 text-[#b7b1a4]">
                                  {item.description}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href;
}
