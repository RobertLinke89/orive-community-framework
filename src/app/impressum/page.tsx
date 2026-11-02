"use client";

import { useEffect } from "react";

export default function ImpressumPage() {
  useEffect(() => {
    window.location.replace("/agb#impressum");
  }, []);

  return null;
}
