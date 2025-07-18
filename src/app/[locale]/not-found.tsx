export default function NotFound() {
  return (
    <main className="w-full h-[calc(100dvh-4rem)] flex flex-col items-center justify-center m-auto">
      <h2 className="text-2xl font-bold">Not Found</h2>
      <p className="text-xl">Could not find requested page</p>
      {/* eslint-disable-next-line */}
      <a href="/">
        <button className="btn btn-outline btn-error mt-2">Return Home</button>
      </a>
    </main>
  );
}
