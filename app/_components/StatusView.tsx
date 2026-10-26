type LoadingViewProps = { message: string };

export function LoadingView({ message }: LoadingViewProps) {
  return (
    <main className="gutter flex flex-1 items-center py-20">
      <p role="status" className="display text-h2">
        {message}
      </p>
    </main>
  );
}
