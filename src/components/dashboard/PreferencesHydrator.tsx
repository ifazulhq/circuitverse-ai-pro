"use client";

import { useEffect } from "react";
import { hydratePreferencesFromServer } from "@/lib/settingsPreferences";

export function PreferencesHydrator() {
  useEffect(() => {
    hydratePreferencesFromServer();
  }, []);

  return null;
}
