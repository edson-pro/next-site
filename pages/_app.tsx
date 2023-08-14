import { AppProps } from "next/app";
import "../styles/globals.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { fontMono, fontSans } from "@/lib/fonts";
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main
      className={cn(
        "font-sans antialiased",
        fontSans.variable,
        fontMono.variable
      )}
    >
      {" "}
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen">
            <main className=" bg-muted/50">
              <Component {...pageProps} />
            </main>
          </div>
        </Providers>
      </QueryClientProvider>
    </main>
  );
}
