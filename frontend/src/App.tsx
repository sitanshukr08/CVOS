import React from "react";

import {
  AIChatAssistantPage,
  FinalResumeDownloadPage,
  GitHubImportPage,
  LandingPage,
  ResumeIntakePage,
  ResumeReviewPage
} from "@/pages";
import { ResumeFlowProvider } from "@/lib/resume-flow";

function getPage(pathname: string) {
  switch (pathname) {
    case "/":
      return <LandingPage />;
    case "/resume-intake":
      return <ResumeIntakePage />;
    case "/assistant":
      return <AIChatAssistantPage />;
    case "/github-import":
      return <GitHubImportPage />;
    case "/resume-review":
      return <ResumeReviewPage />;
    case "/quality-score":
    case "/generation":
    case "/download":
      return <FinalResumeDownloadPage />;
    default:
      return <LandingPage />;
  }
}

function AppShell() {
  const [pathname, setPathname] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);

      if (url.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
      setPathname(url.pathname);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleDocumentClick);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  return getPage(pathname);
}

export function App() {
  return (
    <ResumeFlowProvider>
      <AppShell />
    </ResumeFlowProvider>
  );
}
