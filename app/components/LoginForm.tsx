"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetch("/api/customers").then((res) => {
      if (res.ok) {
        router.push("/dashboard");
      }
    });
  }, []);

  const handleSignup = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong");
      } else {
        setMessage("Signup successful 🎉, you can signin...");

        setTimeout(() => {
          setRightPanelActive(false); // 👈 triggers animation to Sign In
          setEmail("");
          setPassword("");
          setName("");
        }, 1500);
      }
    } catch (err) {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f5f7] px-4 py-10 text-[#333]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="relative flex min-h-[480px] w-full max-w-[768px] overflow-hidden rounded-[10px] bg-white shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)]">
          {/* Sign Up */}
          <div
            className={
              `absolute left-0 top-0 z-[1] flex h-full w-1/2 transition-all duration-[600ms] ease-in-out ` +
              (rightPanelActive
                ? "translate-x-full opacity-100 z-[5] animate-[show_0.6s]"
                : "opacity-0")
            }
          >
            <form
              className="flex h-full w-full flex-col items-center justify-center bg-white px-12 text-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <h1 className="m-0 font-bold text-3xl">Create Account</h1>

              <div className="my-5 flex gap-2.5">
                {[
                  { label: "f", name: "Facebook" },
                  { label: "G+", name: "Google" },
                  { label: "in", name: "LinkedIn" },
                ].map((item) => (
                  <a
                    key={item.name}
                    href="#"
                    aria-label={item.name}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dddddd] text-sm font-semibold text-[#333] transition-transform duration-75 active:scale-95"
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              <span className="text-xs">
                or use your email for registration
              </span>

              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-none border-0 bg-[#eee] px-4 py-3 outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-none border-0 bg-[#eee] px-4 py-3 outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-none border-0 bg-[#eee] px-4 py-3 outline-none"
              />

              {error && (
                <p className="text-sm text-gray-600 mt-3 text-center">
                  {error}
                </p>
              )}

              <button
                onClick={handleSignup}
                disabled={loading}
                className="mt-4 rounded-[20px] border border-[#FF4B2B] bg-[#FF4B2B] px-[45px] py-3 text-xs font-bold uppercase tracking-[1px] text-white transition-transform duration-75 active:scale-95"
              >
                {loading ? "Signing up..." : "Signup"}
              </button>

              {message && (
                <p className="text-center text-sm text-gray-600">{message}</p>
              )}
            </form>
          </div>

          {/* Sign In */}
          <div
            className={
              `absolute left-0 top-0 z-[2] flex h-full w-1/2 transition-all duration-[600ms] ease-in-out ` +
              (rightPanelActive ? "translate-x-full" : "translate-x-0")
            }
          >
            <form
              className="flex h-full w-full flex-col items-center justify-center bg-white px-12 text-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <h1 className="m-0 font-bold text-3xl">Sign in</h1>

              <div className="my-5 flex gap-2.5">
                {[
                  { label: "f", name: "Facebook" },
                  { label: "G+", name: "Google" },
                  { label: "in", name: "LinkedIn" },
                ].map((item) => (
                  <a
                    key={item.name}
                    href="#"
                    aria-label={item.name}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dddddd] text-sm font-semibold text-[#333] transition-transform duration-75 active:scale-95"
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              <span className="text-xs">or use your account</span>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-none border-0 bg-[#eee] px-4 py-3 outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-none border-0 bg-[#eee] px-4 py-3 outline-none"
              />

              <a href="#" className="my-4 text-sm text-[#333] no-underline">
                Forgot your password?
              </a>

              <button
                type="submit"
                onClick={handleLogin}
                disabled={loading}
                className="rounded-[20px] border border-[#FF4B2B] bg-[#FF4B2B] px-[45px] py-3 text-xs font-bold uppercase tracking-[1px] text-white transition-transform duration-75 active:scale-95"
              >
                {loading ? "Signing in..." : "Signin"}
              </button>
            </form>
          </div>

          {/* Overlay */}
          <div
            className={
              `absolute left-1/2 top-0 z-[100] h-full w-1/2 overflow-hidden transition-transform duration-[600ms] ease-in-out ` +
              (rightPanelActive ? "-translate-x-full" : "translate-x-0")
            }
          >
            <div
              className={
                `relative left-[-100%] flex h-full w-[200%] bg-[linear-gradient(to_right,#FF4B2B,#FF416C)] bg-no-repeat text-white transition-transform duration-[600ms] ease-in-out ` +
                (rightPanelActive ? "translate-x-1/2" : "translate-x-0")
              }
            >
              <div
                className={
                  `absolute left-0 top-0 flex h-full w-1/2 flex-col items-center justify-center px-10 text-center transition-transform duration-[600ms] ease-in-out ` +
                  (rightPanelActive ? "translate-x-0" : "-translate-x-[20%]")
                }
              >
                <h1 className="m-0 font-bold text-3xl">Welcome Back!</h1>
                <p className="my-5 text-sm font-light leading-5 tracking-[0.5px]">
                  To keep connected with us please login with your personal info
                </p>
                <button
                  type="button"
                  onClick={() => setRightPanelActive(false)}
                  className="rounded-[20px] border border-white bg-transparent px-[45px] py-3 text-xs font-bold uppercase tracking-[1px] text-white transition-transform duration-75 active:scale-95"
                >
                  Sign In
                </button>
              </div>

              <div
                className={
                  `absolute right-0 top-0 flex h-full w-1/2 flex-col items-center justify-center px-10 text-center transition-transform duration-[600ms] ease-in-out ` +
                  (rightPanelActive ? "translate-x-[20%]" : "translate-x-0")
                }
              >
                <h1 className="m-0 font-bold text-3xl">Hello, Friend!</h1>
                <p className="my-5 text-sm font-light leading-5 tracking-[0.5px]">
                  Enter your personal details and start journey with us
                </p>
                <button
                  type="button"
                  onClick={() => setRightPanelActive(true)}
                  className="rounded-[20px] border border-white bg-transparent px-[45px] py-3 text-xs font-bold uppercase tracking-[1px] text-white transition-transform duration-75 active:scale-95"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css?family=Montserrat:400,800");

        html,
        body {
          height: 100%;
        }

        body {
          font-family: "Montserrat", sans-serif;
        }

        @keyframes show {
          0%,
          49.99% {
            opacity: 0;
            z-index: 1;
          }
          50%,
          100% {
            opacity: 1;
            z-index: 5;
          }
        }
      `}</style>
    </main>
  );
}
