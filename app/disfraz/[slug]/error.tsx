"use client";

import { ErrorView } from "@/app/_components/ErrorView";

export default function Error({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <ErrorView title="Se cayó este disfraz" retry={retry} />;
}
