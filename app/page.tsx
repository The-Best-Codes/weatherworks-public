import React, { Suspense } from "react";
import Compile from "@/components/Compile";
import { Loader2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen w-full h-full no-scrollbar">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-32 h-32 animate-spin" />
          </div>
        }
      >
        <Compile />
      </Suspense>
    </main>
  );
}
