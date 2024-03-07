import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-col w-full min-h-screen items-center justify-center">
      <h2 className="text-2xl font-bold">Not Found</h2>
      <p className="text-xl">Could not find requested page</p>
      <Link href="/">
        <button className="btn btn-outline btn-error mt-2">Return Home</button>
      </Link>
    </main>
  );
}
