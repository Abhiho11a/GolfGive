export default function WombAnimationCard() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 p-6">

      {/* Card */}
      <div className="relative w-full max-w-md h-[400px] rounded-3xl 
                      bg-white/40 backdrop-blur-xl border border-white/50 
                      shadow-2xl flex items-center justify-center overflow-hidden">

        {/* Soft glowing womb background */}
        <div className="absolute w-[260px] h-[260px] rounded-full 
                        bg-gradient-to-br from-pink-300 to-rose-400 
                        opacity-40 blur-2xl animate-pulse" />

        {/* Baby shape */}
        <div className="relative flex items-center justify-center">

          {/* Body */}
          <div className="w-28 h-28 bg-gradient-to-br from-pink-400 to-rose-500 
                          rounded-full relative animate-float shadow-xl">

            {/* Head */}
            <div className="absolute -top-6 left-6 w-14 h-14 
                            bg-gradient-to-br from-pink-400 to-rose-500 
                            rounded-full shadow-md" />

            {/* Little arm */}
            <div className="absolute right-2 top-8 w-6 h-3 
                            bg-pink-300 rounded-full rotate-45 opacity-80" />

            {/* Little leg */}
            <div className="absolute left-2 bottom-2 w-6 h-3 
                            bg-pink-300 rounded-full -rotate-45 opacity-80" />
          </div>

        </div>

        {/* Heartbeat ripple */}
        <div className="absolute w-[220px] h-[220px] rounded-full border-2 border-pink-300 opacity-40 animate-ripple" />
        <div className="absolute w-[260px] h-[260px] rounded-full border border-pink-200 opacity-30 animate-ripple delay-200" />

        {/* Text */}
        <div className="absolute bottom-6 text-center">
          <h2 className="text-lg font-semibold text-rose-700">
            Your baby is growing 💖
          </h2>
          <p className="text-sm text-rose-500">
            Every moment matters
          </p>
        </div>
      </div>
    </div>
  );
}