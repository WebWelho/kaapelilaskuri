import { CalculatorForm } from "@/components/Calculator/CalculatorForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold tracking-tight">Kaapelimitoitus</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sulake- ja kaapelimitoitus SFS 6000 -standardin mukaan
          </p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <CalculatorForm />
      </main>
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
        TPCore Oy — Kaapelimitoituslaskuri v0.1
      </footer>
    </div>
  );
}
