"use client";
import { profile } from "@/data/content";
import { scrollToId } from "@/lib/scroll";

export default function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <div className="container-x sans flex flex-col gap-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <button type="button" onClick={() => scrollToId("top")} className="link-u self-start text-ink">Back to top</button>
      </div>
    </footer>
  );
}
