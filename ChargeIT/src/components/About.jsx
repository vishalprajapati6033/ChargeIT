import React from "react";
import BlackCarPng from "../images/car_black2.jpg";
import WhiteCarPng from "../images/car_white2.jpg";

const About = ({ theme }) => {
  return (
    <div className="dark:bg-black bg-white dark:text-white sm:min-h-[600px] h-screen sm:grid sm:place-items-center duration-300">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 place-items-center">
          <div
            data-aos="slide-right"
            data-aos-duration="1500"
            className="relative"
          >
            <img
              src={theme === "light" ? WhiteCarPng : BlackCarPng}
              alt=""
              className={`light:sm:scale-75 dark:sm:scale-100`}
            />
          </div>
          <div>
            <div name="about" className="space-y-5 sm:p-16 pb-6">
              <h1
                data-aos="fade-up"
                className="text-3xl sm:text-4xl font-bold font-serif"
              >
                About us
              </h1>
              <p data-aos="fade-up" className="leading-8 tracking-wide">
                Charge IT optimizes electric vehicle (EV) adoption challenges
                with a user-friendly platform, tackling range anxiety through
                real-time information and reservations for charging stations.
                The platform efficiently manages station traffic, minimizing
                wait times and enhancing the overall EV experience.
                Additionally, Charge IT offers customizable EV rental services,
                providing flexibility for users interested in sustainable
                transportation. The company's comprehensive approach aims to
                accelerate the transition to electric vehicles by addressing
                key aspects of infrastructure and user convenience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
