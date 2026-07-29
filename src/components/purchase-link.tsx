import Link from "next/link";
import type { CommerceLink } from "@/lib/commerce";

type PurchaseLinkProps = {
  link: CommerceLink;
  variant?: "primary" | "secondary";
  className?: string;
};

export function PurchaseLink({
  link,
  variant = "primary",
  className = "",
}: PurchaseLinkProps) {
  const baseClassName =
    variant === "primary"
      ? "inline-flex h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#dce8ff_0%,#9ab8ff_100%)] px-5 text-sm font-semibold text-[#07111f] shadow-[0_20px_50px_rgba(131,168,255,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_24px_56px_rgba(131,168,255,0.4)]"
      : "inline-flex h-12 items-center justify-center rounded-full border border-white/14 bg-white/4 px-5 text-sm font-semibold text-white transition hover:border-white/26 hover:bg-white/8";
  const finalClassName = `${baseClassName} ${className}`.trim();

  return (
    <div className="space-y-3">
      {link.ready ? (
        <a
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className={finalClassName}
        >
          {link.label}
        </a>
      ) : (
        <Link href={link.href} className={finalClassName}>
          {link.label}
        </Link>
      )}
      <p className="text-sm leading-6 text-muted">{link.helper}</p>
    </div>
  );
}
