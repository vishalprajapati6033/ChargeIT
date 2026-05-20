import React from 'react'
import "aos/dist/aos.css";

const BatteryTwo = () => {
  return (
    <div name="BatteryTwo" className="relative overflow-hidden">
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 py-20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-20 min-h-screen flex items-center relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center w-full">
            <h3
              data-aos="fade-up"
              data-aos-delay="300"
              className="text-3xl lg:text-4xl text-green-800 font-semibold mb-8"
            >
              Why Battery Swapping?
            </h3>
            <ul className="list-disc pl-5">
              <li
                data-aos="fade-up"
                data-aos-delay="400"
                className="text-lg lg:text-xl mb-5 text-green-700"
              >
                <span className="text-green-800 font-bold">Instant Power Boost:</span> Say goodbye to range anxiety! With battery swapping, you can exchange your depleted battery for a fully charged one in minutes, giving you the confidence to embark on longer journeys without any interruptions.
              </li>
              <li
                data-aos="fade-up"
                data-aos-delay="500"
                className="text-lg lg:text-xl mb-5 text-green-700"
              >
                <span className="text-green-800 font-bold">Time Efficiency:</span> Time is precious, and waiting hours for your EV to recharge is a thing of the past. Battery swapping stations are designed for efficiency, ensuring you're back on the road in no time.
              </li>
              <li
                data-aos="fade-up"
                data-aos-delay="600"
                className="text-lg lg:text-xl mb-5 text-green-700"
              >
                <span className="text-green-800 font-bold">Accessibility:</span> Whether you're a city dweller or an adventurer exploring remote areas, battery swapping stations provide accessible charging solutions where traditional charging infrastructure may be limited.
              </li>
              <li
                data-aos="fade-up"
                data-aos-delay="600"
                className="text-lg lg:text-xl mb-5 text-green-700"
              >
                <span className="text-green-800 font-bold">Enhanced Sustainability:</span> By streamlining the charging process, battery swapping reduces the strain on the power grid and promotes renewable energy integration, making your EV experience even more eco-friendly.
              </li>
              <li
                data-aos="fade-up"
                data-aos-delay="600"
                className="text-lg lg:text-xl mb-5 text-green-700"
              >
                <span className="text-green-800 font-bold">Cost-Effective:</span> Forget about investing in expensive home charging units or paying hefty fees for fast charging. Battery swapping offers a cost-effective alternative, allowing you to pay for the energy you use without any additional maintenance costs.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default BatteryTwo