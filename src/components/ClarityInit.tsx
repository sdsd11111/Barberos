"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

let clarityInitialized = false;

export default function ClarityInit() {
  useEffect(() => {
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
    if (clarityId && !clarityInitialized) {
      Clarity.init(clarityId);
      clarityInitialized = true;
    }
  }, []);

  return null;
}
