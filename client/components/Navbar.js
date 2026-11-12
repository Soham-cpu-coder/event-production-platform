"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const canManage = user && (user.role === "organizer" || user.role === "admin");

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          Event<span>Flow</span>
        </Link>
        <Link href="/">Events</Link>
        {canManage && <Link href="/dashboard">Dashboard</Link>}
        <span className="spacer" />
        {loading ? null : user ? (
          <>
            <span className="muted small">
              {user.name} · {user.role}
            </span>
            <button
              className="link"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/register" className="btn">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
