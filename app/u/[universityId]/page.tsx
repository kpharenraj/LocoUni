import Link from 'next/link'

interface UniversityPageProps {
  params: Promise<{
    universityId: string
  }>
}

export default async function UniversityPage({ params }: UniversityPageProps) {
  const { universityId } = await params

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-3">University Campus</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-2 text-sm">
          Campus portal for university ID:
        </p>
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 font-mono text-xs text-zinc-800 dark:text-zinc-200 mb-6 break-all">
          {universityId}
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          ← Back to LocoUni Home
        </Link>
      </div>
    </div>
  )
}
