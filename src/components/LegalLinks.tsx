const policies = [
  { label: "Draft terms", href: "https://digifender.com/legal/labthrift/terms" },
  { label: "Draft privacy policy", href: "https://digifender.com/legal/labthrift/privacy" },
  { label: "Draft cookie notice", href: "https://digifender.com/legal/labthrift/cookies" },
] as const;

export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`text-center text-[11px] leading-relaxed text-muted-foreground ${className}`}>
      <nav aria-label="LabThrift draft policies" className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {policies.map((policy) => (
          <a key={policy.href} href={policy.href} className="underline underline-offset-4 hover:text-foreground">
            {policy.label}
          </a>
        ))}
      </nav>
      <p className="mt-2">
        A <a href="https://digifender.com/" className="underline underline-offset-4 hover:text-foreground">Digifender</a> product
        {" · "}
        <a href="mailto:legal@digifender.com" className="underline underline-offset-4 hover:text-foreground">Legal contact</a>
      </p>
    </div>
  );
}
