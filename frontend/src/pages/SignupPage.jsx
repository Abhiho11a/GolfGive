import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SignupPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({});
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [charityPercent, setCharityPercent] = useState(1);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) return setError(error.message);

    const user = data.user;

    await supabase.from("profiles").insert({
      id: user.id,
      full_name: form.fullName,
      email: form.email,
    });

    await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan: selectedPlan,
      status: "active",
    });

    await supabase.from("user_charity").insert({
      user_id: user.id,
      charity_id: selectedCharity,
      percentage: charityPercent,
    });

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">

      <div className="w-full max-w-xl">

        {/* Progress */}
        <div className="mb-8">
          <div className="h-1 bg-white/10 rounded-full">
            <div
              className="h-1 bg-indigo-500 rounded-full transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <p className="text-sm text-white/60 mt-2 text-center">
            Step {step} of 3
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl">

          {error && (
            <div className="mb-4 text-red-400 text-sm">{error}</div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <Input name="fullName" placeholder="Full Name" onChange={handleChange} />
              <Input name="email" placeholder="Email" onChange={handleChange} />
              <Input name="password" type="password" placeholder="Password" onChange={handleChange} />
              <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} />

              <Button onClick={() =>{
                if(!form.fullName)
    {
      setError("Please enter name")
      return;
    }
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
    if(form.password !== form.confirmPassword)
    {
      setError("Password doesn't match")
      return;
    }
    if(form.password.length < 6)
      {
        setError("Password should contain atleast 6 characters")
        return;
      }
              
                setStep(2)
                setError("")}}>Continue →</Button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {["monthly", "yearly"].map((p) => (
                  <div
                    onClick={() => setSelectedPlan(p)}
                    className={`p-5 rounded-xl cursor-pointer transition ${
                      selectedPlan === p
                        ? "bg-indigo-500"
                        : "bg-white/10"
                    }`}
                  >
                    <h3 className="capitalize">{p}</h3>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <GhostBtn onClick={() => setStep(1)}>Back</GhostBtn>
                <Button onClick={() => setStep(3)}>Next</Button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {["Cancer", "Children", "Mental", "Heart"].map((c, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedCharity(i)}
                    className={`p-4 rounded-xl cursor-pointer ${
                      selectedCharity === i
                        ? "bg-indigo-500"
                        : "bg-white/10"
                    }`}
                  >
                    {c}
                  </div>
                ))}
              </div>
              <p>{charityPercent}%</p>
              <input
                type="range"
                min="0"
                max="100"
                value={charityPercent}
                onChange={(e) => setCharityPercent(e.target.value)}
                className="w-full mb-6"
              />

              <div className="flex gap-3">
                <GhostBtn onClick={() => setStep(2)}>Back</GhostBtn>
                <Button onClick={handleSubmit}>Create Account</Button>
              </div>
            </div>
          )}
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-500 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

/* Components */

function Input({ name, ...props }) {
  return (
    <input
      name={name}
      {...props}
      className="w-full px-4 py-2.5 bg-white/10 border border-white/10 rounded-lg text-white"
    />
  );
}

function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-2.5 bg-indigo-500 rounded-lg hover:bg-indigo-600"
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full border border-white/20 rounded-lg py-2.5"
    >
      {children}
    </button>
  );
}