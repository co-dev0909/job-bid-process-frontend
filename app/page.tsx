"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Resumes from "./user/jobs/page";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

  return <Resumes />;
}