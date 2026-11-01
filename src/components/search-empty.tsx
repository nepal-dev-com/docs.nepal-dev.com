/** The search dialog's no-results message, in place of Fumadocs' own (ADR-0029 decision 8). */
export function SearchEmpty() {
  return (
    <div role="status" className="py-12 text-center text-sm text-fd-muted-foreground">
      Nothing in orbit matches. Try another word.
    </div>
  );
}
