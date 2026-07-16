import { useMemo } from "react";
import previousQueries from "../mockMemory";

export function findMatchingQuery(queryText) {
  if (!queryText || !queryText.trim()) return null;

  const lower = queryText.toLowerCase();

  for (const entry of previousQueries) {
    const originMatch = lower.includes(entry.origin.toLowerCase());
    const destMatch = lower.includes(entry.destination.toLowerCase());

    if (originMatch && destMatch) return entry;
  }

  return null;
}

export default function useMemoryRecall(queryText) {
  return useMemo(() => findMatchingQuery(queryText), [queryText]);
}
