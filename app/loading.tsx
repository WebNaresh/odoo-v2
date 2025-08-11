import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#00884d]/5 flex items-center justify-center p-4">
      <div className="text-center">
        {/* QuickCourt Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#00884d] to-[#00a855] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-3xl">QC</span>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="mb-6">
          <Loader2 className="h-12 w-12 text-[#00884d] mx-auto animate-spin" />
        </div>

        {/* Loading Text */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Loading QuickCourt
        </h1>
        <p className="text-lg text-muted-foreground">
          Please wait...
        </p>
      </div>
    </div>
  );
}
