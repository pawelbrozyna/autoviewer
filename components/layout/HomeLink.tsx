"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { RESET_LOOKUP_EVENT } from "@/components/vehicle/DvlaLookupContext";

/** Link to the home page that also clears an inline search result when already on it. */
export function HomeLink({
  onClick,
  ...props
}: Omit<ComponentProps<typeof Link>, "href">) {
  const pathname = usePathname();

  return (
    <Link
      {...props}
      href="/"
      onClick={(event) => {
        onClick?.(event);
        if (pathname !== "/") return;
        window.dispatchEvent(new Event(RESET_LOOKUP_EVENT));
        window.scrollTo({ top: 0 });
      }}
    />
  );
}
