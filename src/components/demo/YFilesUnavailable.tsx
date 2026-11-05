import Link from 'next/link';

// Shown on the demo branch in place of the yFiles-based Flow Map: yFiles for HTML
// is a commercial library and is not part of the repository.
export function YFilesUnavailable() {
  return (
    <div className="max-w-2xl space-y-3 p-8 text-slate-300">
      <h1 className="text-xl font-semibold text-white">Flow Map is not available in this demo</h1>
      <p>
        The Flow Map is built on yFiles for HTML, a commercial library that is not part of the
        repository. To use it, work on the <code>main</code> branch with the yFiles package folder
        placed at the repository root.
      </p>
      <p>
        Continue with the{' '}
        <Link className="text-indigo-300 underline" href="/dashboard/environments/overview">
          Environments overview
        </Link>{' '}
        or the{' '}
        <Link className="text-indigo-300 underline" href="/dashboard/overview">
          Overview
        </Link>
        .
      </p>
    </div>
  );
}
