import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    
  if(!form.email)
  {
    setError("Please enter email")
    return;
  }
  if(!form.password)
  {
    setError("Please enter password")
    return;
  }

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword(form);

    setLoading(false);

    if (error) return setError(error.message);

    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-6">

      {/* Glow */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/20 blur-3xl rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-emerald-400 rounded-xl flex items-center justify-center text-white font-bold">
              G
            </div>
            <span className="text-white font-bold text-lg">GolfGive</span>
          </div>

          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/60 text-sm">Sign in to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl">

          {error && (
            <div className="mb-4 text-sm bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <Input name="email" placeholder="Email" onChange={handleChange} />
            <Input name="password" type="password" placeholder="Password" onChange={handleChange} />

            <button className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-white/60 mt-6">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-indigo-400">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

function Input({ name, ...props }) {
  return (
    <input
      name={name}
      {...props}
      className="w-full px-4 py-2.5 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-indigo-500 outline-none"
    />
  );
}