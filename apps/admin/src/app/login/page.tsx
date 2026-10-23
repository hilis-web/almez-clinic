"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      if (!data.token || !data.user) {
        setError("The server returned an invalid response.");
        return;
      }

      sessionStorage.setItem("almez_admin_token", data.token);
      sessionStorage.setItem("almez_admin_user", JSON.stringify(data.user));

      router.push("/");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      lang="es"
      dir="ltr"
      className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-5 py-10"
    >
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[#e3e8e3] bg-white shadow-xl md:grid-cols-2">
        <section className="flex flex-col justify-between bg-[#1b3b36] p-8 text-white md:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9fd3af]">
              ALMEZ CLINIC
            </p>

            <div className="mt-16">
              <p className="text-sm text-[#c8d8cf]">Administration portal</p>

              <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight md:text-5xl">
                Care begins with better management.
              </h1>

              <p className="mt-6 max-w-sm text-base leading-7 text-[#d5e0d9]">
                Manage consultations and keep your clinic running smoothly from
                one secure workspace.
              </p>
            </div>
          </div>

          <p className="mt-16 text-sm text-[#c8d8cf]">
            Secure access for authorized clinic staff.
          </p>
        </section>

        <section className="p-8 md:p-12">
          <div className="mb-10">
            <p className="text-sm font-medium text-[#496e5a]">Welcome back</p>

            <h2 className="mt-2 font-heading text-3xl font-semibold text-[#1b3b36]">
              Sign in
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#758078]">
              Enter your staff credentials to access the admin dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#1b3b36]"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@yourclinic.com"
                className="w-full rounded-xl border border-[#e3e8e3] bg-white px-4 py-3 text-base text-[#1b3b36] outline-none transition placeholder:text-[#a0a9a2] focus:border-[#496e5a] focus:ring-4 focus:ring-[#496e5a]/10"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#1b3b36]"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#e3e8e3] bg-white px-4 py-3 pr-20 text-base text-[#1b3b36] outline-none transition placeholder:text-[#a0a9a2] focus:border-[#496e5a] focus:ring-4 focus:ring-[#496e5a]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-3 text-sm font-semibold text-[#496e5a] hover:text-[#1b3b36]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#1b3b36] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#17312d] focus:outline-none focus:ring-4 focus:ring-[#496e5a]/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-5 text-[#758078]">
            Authorized personnel only. Your access is protected.
          </p>
        </section>
      </div>
    </main>
  );
}
