import React from "react";
import { Link } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaLocationArrow,
  FaMobileAlt,
  FaArrowUp,
} from "react-icons/fa";

const Footer = ({ theme }) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="bg-primary dark:bg-gray-950 dark:text-white text-black">
      <section className="container">
        <div className="grid md:grid-cols-3 py-5">
          <div className="py-8 px-4 md:px-8">
            <h1 className="sm:text-3xl text-xl font-bold sm:text-left text-justify mb-3 flex items-center gap-3 font-serif">
              Charge IT
            </h1>
            <p className="text-sm">
            Stay in charge. Plan your day, and Charge IT your way!{" "}
            </p>
            <br />
            <div className="flex items-center gap-3">
              <FaLocationArrow />
              <p>Mangalagiri, Andhra Pradesh</p>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <FaMobileAlt />
              <p>+91 XXXXXXXXXX</p>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <a href="https://www.instagram.com/">
                <FaInstagram className="text-3xl hover:text-green-500 duration-300" />
              </a>
              <a href="https://www.facebook.com">
                <FaFacebook className="text-3xl hover:text-green-500 duration-300" />
              </a>
              <a href="https://www.linkedin.com">
                <FaLinkedin className="text-3xl hover:text-green-500 duration-300" />
              </a>
            </div>
          </div>

          <div className="py-8 px-4 md:px-8 mx-12 col-span-2">
            <h1 className="sm:text-xl text-xl font-bold text-center sm:text-left mb-3">
              Important Links
            </h1>
            <ul className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              <li>
                <RouterLink to="/">
                  <button className="inline-block py-1 hover:text-green-700 hover:border-green-700 transition-colors-duration-500 text-lg font-small">Home</button>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/services">
                  <button className="inline-block py-1 hover:text-green-700 hover:border-green-700 transition-colors-duration-500 text-lg font-small">Services</button>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/about">
                  <button className="inline-block py-1 hover:text-green-700 hover:border-green-700 transition-colors-duration-500 text-lg font-small">About</button>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/account">
                  <button className="inline-block py-1 hover:text-green-700 hover:border-green-700 transition-colors-duration-500 text-lg font-small">Account</button>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/book-slot">
                  <button className="inline-block py-1 hover:text-green-700 hover:border-green-700 transition-colors-duration-500 text-lg font-small">Book a Slot</button>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/battery-swap">
                  <button className="inline-block py-1 hover:text-green-700 hover:border-green-700 transition-colors-duration-500 text-lg font-small">Swap Batteries</button>
                </RouterLink>
              </li>
              <li>
                <button 
                  onClick={scrollToTop}
                  className="inline-block py-1 hover:text-green-700 hover:border-green-700 transition-colors-duration-500 text-lg font-small flex items-center gap-1"
                >
                  <FaArrowUp className="text-sm" /> Back to Top
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Footer;