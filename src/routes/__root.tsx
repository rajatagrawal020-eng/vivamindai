import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass rounded-2xl p-10 text-center max-w-md">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <p className="mt-3 text-muted-foreground">This page doesn't exist.</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-gradient-brand px-5 py-2.5 text-sm font-medium text-white">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass rounded-2xl p-10 text-center max-w-md">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-lg bg-gradient-brand px-5 py-2.5 text-sm font-medium text-white">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VivaMind AI — AI-powered viva & interview practice" },
      { name: "description", content: "Generate examiner-grade viva questions, rapid-fire mock interviews and bilingual explanations for engineering, medical, UPSC, commerce and coding interviews." },
      { property: "og:title", content: "VivaMind AI — AI-powered viva & interview practice" },
      { property: "og:description", content: "Generate examiner-grade viva questions, rapid-fire mock interviews and bilingual explanations for engineering, medical, UPSC, commerce and coding interviews." },
      { name: "google-site-verification", content: "u5I8O77kztv6yGTmLsvK-HqFrQVa5XtuU2sR5Tx_dOg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "VivaMind AI — AI-powered viva & interview practice" },
      { name: "twitter:description", content: "Generate examiner-grade viva questions, rapid-fire mock interviews and bilingual explanations for engineering, medical, UPSC, commerce and coding interviews." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/99403d9a-292e-4e5d-ba92-81170c84aa81/id-preview-7cd4434b--4afc1c09-9fe5-4bd2-879e-a7f03ebc0c9f.lovable.app-1779020416411.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/99403d9a-292e-4e5d-ba92-81170c84aa81/id-preview-7cd4434b--4afc1c09-9fe5-4bd2-879e-a7f03ebc0c9f.lovable.app-1779020416411.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/__l5e/assets-v1/68377241-3887-4c98-8bce-e8b36a71c0f1/favicon.png" },
      { rel: "apple-touch-icon", type: "image/png", href: "/__l5e/assets-v1/68377241-3887-4c98-8bce-e8b36a71c0f1/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => router.invalidate());
    return () => subscription.unsubscribe();
  }, [router]);
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <Outlet />
          <Toaster theme="dark" />
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
