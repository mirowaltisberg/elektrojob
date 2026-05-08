"use client";

import { useEffect } from "react";

const DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine)";

export function DesktopRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(DESKTOP_QUERY);
    if (mq.matches) {
      window.location.replace("/");
    }
  }, []);
  return null;
}
