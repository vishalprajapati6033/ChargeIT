import React from "react";
import { Link } from "react-scroll";
import BookImage from "../station_edapally.jpg"
import "aos/dist/aos.css";

const BatteryHero = () => {
  return (
    <div name="BookHero" className="relative overflow-hidden">
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
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
            <div 
              className="order-1 sm:order-2"
              data-aos="fade-right"
              data-aos-duration="1500"
              data-aos-once="false"
            >
              <img
                src={BookImage}
                alt="Charging Station"
                className="w-full md:max-h-[600px] md:scale-100 rounded-xl shadow-lg border border-green-200"
              />
            </div>
            <div className="order-2 md:order-1 md:pr-8 lg:pr-16 xl:pr-24">
              <h1
                data-aos="fade-up"
                data-aos-delay="600"
                className="text-4xl sm:mt-5 text-green-800 lg:text-7xl font-bold animate-fade-in"
              >
                Book Your Slot
              </h1>
              <h2
                data-aos="fade-up"
                data-aos-delay="800"
                className="text-xl sm:mt-5 mt-8 text-green-700 lg:text-2xl font-semibold"
              >
                with
              </h2>
              <p
                data-aos="fade-up"
                data-aos-delay="1000"
                className="text-4xl lg:text-5xl text-green-800 font-semibold font-serif sm:mt-5 mt-8"
              >
                Team Charge IT
              </p>
              <div
                data-aos="fade-up"
                data-aos-delay="1200"
                className="mt-8"
              >
                <Link
                  to="stations"
                  smooth={true}
                  duration={500}
                  className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  BOOK
                </Link>
              </div>
            </div>
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
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BatteryHero;

