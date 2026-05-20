import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950"></div>
      
      <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
        <div className="flex items-center justify-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            Secure<span className="text-indigo-500">Gate</span>
          </h1>
        </div>
        
        <p className="max-w-md text-lg text-zinc-400">
          Production-grade authentication infrastructure built with zero compromises.
        </p>

        <div className="flex space-x-4 pt-4">
          <Link 
            href="/auth/login" 
            className="rounded-lg bg-zinc-800 px-6 py-3 font-semibold text-white transition-all hover:bg-zinc-700"
          >
            Sign In
          </Link>
          <Link 
            href="/auth/register" 
            className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all hover:bg-indigo-500 hover:shadow-[0_0_25px_rgba(79,70,229,0.6)]"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}
