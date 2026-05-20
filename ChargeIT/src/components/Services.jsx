import React from "react";
import { FaCar } from "react-icons/fa";
import { GiBattery75, GiCharging } from "react-icons/gi";
import { Link as RouterLink } from 'react-router-dom';

const skillsData = [
  {
    name: "Book a Slot",
    icon: <GiCharging className="text-5xl" />,
    link: "/book-slot",
    description: "Running out of energy? Book a slot of your choice at any charging station.",
    aosDelay: "0",
  },
  {
    name: "Swap Batteries",
    icon: <GiBattery75 className="text-5xl" />,
    link: "/battery-swap",
    description: "Out of batteries? Get them hand to hand by depositing your empty battery at the station.",
    aosDelay: "500",
  },
];

const Services = ({ theme }) => {
  return (
    <>
      <span name="booking" id="about"></span>
      <div className="dark:bg-black dark:text-white py-14 sm:min-h-[600px] sm:grid sm:place-items-center h-screen">
        <div className="container">
          <div className="pb-12">
            <h1
              data-aos="fade-up"
              className="text-3xl font-semibold text-center sm:text-4xl font-serif"
            >
              Services for you
            </h1>
          </div>

          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
              {skillsData.map((skill) => (
                <RouterLink to={skill.link} key={skill.name}>
                  <button
                    className="card text-center group space-y-3 sm:space-y-6 p-6 sm:py-16 bg-primary dark:bg-dark dark:hover:bg-primary hover:bg-dark duration-300 text-black dark:text-white hover:text-white dark:hover:text-black rounded-lg shadow-md transition-all"
                    data-aos="fade-up"
                    data-aos-delay={skill.aosDelay}
                  >
                    <div className="grid place-items-center">{skill.icon}</div>
                    <h1 className="text-2xl font-bold">{skill.name}</h1>
                    <p className="text-sm sm:text-base">{skill.description}</p>
                  </button>
                </RouterLink>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Services;


