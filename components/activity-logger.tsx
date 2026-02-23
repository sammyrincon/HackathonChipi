"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

const LOGIN_LOGGED_KEY = "zeropass-login-logged";

export function ActivityLogger() {
  const { userId } = useAuth();
  const logged = useRef(false);

  useEffect(() => {
    if (!userId || logged.current) return;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(LOGIN_LOGGED_KEY)) {
      logged.current = true;
      return;
    }
    logged.current = true;
    void fetch("/api/activity/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "login" }),
    }).then(() => {
      try {
        sessionStorage.setItem(LOGIN_LOGGED_KEY, "1");
      } catch {
        // ignore
      }
    });
  }, [userId]);

  return null;
}
