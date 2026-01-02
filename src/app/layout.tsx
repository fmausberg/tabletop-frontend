"use client";

import Navbar from "../components/navbar-component/navbar";
import Footer from "../components/footer-component/footer";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";

const queryClient = new QueryClient();

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full">
      <body className="h-full flex flex-col bg-slate-50">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Suspense fallback={<p>Loading...</p>}>
              <Navbar />
              <div className="flex flex-col min-h-screen pt-16">
                <main className="flex-grow py-8 px-4">{children}</main>
                <Footer />
              </div>
              {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
            </Suspense>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
