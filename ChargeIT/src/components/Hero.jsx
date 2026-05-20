import React from "react";
import BlackCarPng from "../images/car_black.jpg";
import WhiteCarPng from "../images/car_white.webp";
import { Link } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';

const Hero = ({ theme }) => {
  return (
    <div
      name="home"
      className="relative overflow-hidden dark:bg-black dark:text-white duration-300 h-screen flex items-center justify-center"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400 to-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-green-500 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-75 animation-delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping opacity-75 animation-delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-blue-500 rounded-full animate-ping opacity-75 animation-delay-3000"></div>
      </div>

      {/* Main Content */}
      <div className="container flex items-center justify-center h-full px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 place-items-center w-full">
          {/* Image Section */}
          <div
            data-aos="zoom-in"
            data-aos-duration="1500"
            data-aos-once="false"
            className="order-1 sm:order-2 flex justify-center relative"
          >
            {/* Image Container with Glow Effect */}
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              
              {/* Image */}
              <div className="relative">
                <img
                  src={theme === "dark" ? BlackCarPng : WhiteCarPng}
                  alt="Car"
                  className="sm:scale-100 dark:scale-90 xs:scale-60 relative z-10 max-h-[500px] rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:rotate-1"
                />
                
                {/* Floating Elements around the car */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full animate-bounce opacity-80"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full animate-bounce opacity-80 animation-delay-1000"></div>
                <div className="absolute top-1/2 -right-8 w-4 h-4 bg-green-500 rounded-full animate-pulse opacity-60"></div>
              </div>
            </div>
          </div>

          {/* Text Section */}
          <div className="space-y-6 order-2 sm:order-1 sm:pr-32 text-center sm:text-left relative">
            {/* Background Glow for Text */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-3xl blur-3xl -z-10"></div>
            
            <div className="relative z-10 space-y-6">
              <p
                data-aos="fade-up"
                className="text-green-600 text-xl font-serif bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent font-bold tracking-wide"
              >
                Go Green With
              </p>

              <h1
                data-aos="fade-up"
                data-aos-delay="600"
                className="text-4xl lg:text-7xl font-semibold font-serif bg-gradient-to-r from-gray-800 via-green-600 to-blue-600 dark:from-white dark:via-green-400 dark:to-blue-400 bg-clip-text text-transparent drop-shadow-lg"
              >
                Charge IT
              </h1>

              <p
                data-aos="fade-up"
                data-aos-delay="1000"
                className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
              >
                Stay in charge. Plan your day, and
                <span className="font-serif font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Charge IT </span>
                your way!
              </p>

              {/* Enhanced Button */}
              <div
                data-aos="fade-up"
                data-aos-delay="1600"
                className="relative group"
              >
                <RouterLink 
                  to="/book-slot"
                  className="relative inline-block py-4 px-8 rounded-full cursor-pointer bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-1"
                >
                  <span className="relative z-10">Book a Slot</span>
                  {/* Button Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
                </RouterLink>
                
                {/* Floating Arrow */}
                <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
