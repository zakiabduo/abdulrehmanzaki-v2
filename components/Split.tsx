import { createElement, Fragment } from "react";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** mask: words rise out of a clipping line. fade: words light up as you scroll. */
  mode?: "mask" | "fade";
};

/** Splits copy into words on the server so there is no layout shift; GSAP animates the spans. */
export default function Split({ text, as = "p", className = "", mode = "mask" }: Props) {
  const words = text.split(" ");
  return createElement(
    as,
    { className: `split ${className}`, "data-split": mode },
    <span className="sr-only">{text}</span>,
    <span aria-hidden="true">
      {words.map((w, i) => (
        <Fragment key={i}>
          {mode === "mask" ? (
            <span className="sw-mask"><span className="sw-inner">{w}</span></span>
          ) : (
            <span className="sw-fade">{w}</span>
          )}
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </span>,
  );
}
