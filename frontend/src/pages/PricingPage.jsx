import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PricingPage() {
  const { isSubscribed } = useAuth();

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "£9.99",
      desc: "Flexible plan, cancel anytime",
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: "yearly",
      name: "Yearly",
      price: "£89.99",
      desc: "Best value — save more",
      color: "from-emerald-400 to-teal-500",
      badge: "Best Value",
    },
  ];

const handlePlanSelect = async (planId) => {
  const token = localStorage.getItem("token");

  // ❌ Not logged in → go signup
  if (!token) {
    window.location.href = `/signup`;
    return;
  }
  // alert(planId)

  window.location.href = planId === "monthly"? 'https://buy.stripe.com/test_cNi4gAg6s5pqeMrbDW87K00' : "https://buy.stripe.com/test_7sY00kg6sf00dInfUc87K01"
};
  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-24">

      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-indigo-400 text-xs uppercase tracking-widest mb-2">
          Pricing
        </p>
        <h1 className="text-4xl font-bold mb-3">
          Simple, transparent pricing
        </h1>
        <p className="text-white/60 text-sm">
          One subscription. Real impact.
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

        {plans.map(plan => (
          <div className="relative bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl hover:scale-[1.02] transition">

            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 bg-emerald-400 text-black rounded-full">
                {plan.badge}
              </span>
            )}

            <h2 className="text-xl font-semibold mb-2">
              {plan.name}
            </h2>

            <p className="text-white/60 text-sm mb-6">
              {plan.desc}
            </p>

            <div className={`text-4xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent mb-6`}>
              {plan.price}
            </div>

           <button
  onClick={() => handlePlanSelect(plan.id)}
  className="block w-full text-center py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition"
>
              {isSubscribed ? "Current Plan" : "Choose Plan"}
            </button>

            {/* Features */}
            <div className="mt-6 space-y-2 text-sm text-white/70">
              <p>✔ Full platform access</p>
              <p>✔ Monthly draw entry</p>
              <p>✔ Charity contribution</p>
              <p>✔ Score tracking</p>
            </div>

          </div>
        ))}
      </div>

      {/* Where your subscription goes */}
      <div className="max-w-4xl mx-auto mt-10 mb-10">

        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">
            Where your subscription goes
          </h2>
          <p className="text-white/50 text-sm">
            Based on £9.99/month subscription
          </p>
        </div>

        <div className="space-y-6">

          {[
            {
              label: "Prize Pool",
              desc: "Jackpot, 4-match, 3-match tiers",
              amount: 4.99,
              pct: 50,
              color: "bg-indigo-500",
              text: "text-indigo-400"
            },
            {
              label: "Charity Contribution",
              desc: "Minimum 10% to your chosen charity",
              amount: 1.0,
              pct: 10,
              color: "bg-emerald-400",
              text: "text-emerald-400"
            },
            {
              label: "Platform & Operations",
              desc: "Infrastructure, support, development",
              amount: 4.0,
              pct: 40,
              color: "bg-amber-400",
              text: "text-amber-400"
            }
          ].map((item) => (
            <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-md">

              {/* Top row */}
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-semibold">{item.label}</h3>
                  <p className="text-xs text-white/50">{item.desc}</p>
                </div>

                <div className="text-right">
                  <span className={`font-bold ${item.text}`}>
                    £{item.amount.toFixed(2)}
                  </span>
                  <span className="text-xs text-white/50 ml-2">
                    {item.pct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`${item.color} h-full rounded-full transition-all duration-700`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>

            </div>
          ))}

        </div>
      </div>

    </div>
  );
}