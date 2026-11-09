"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

type LogoutButtonProps = {
  redirectPath?: string;
  label?: string;
};

export function LogoutButton({
  redirectPath = "/",
  label = "Log out",
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      router.push(redirectPath);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button type="button" className="button button--ghost" onClick={handleClick} disabled={isLoading}>
      {isLoading ? "Closing session..." : label}
    </button>
  );
}
