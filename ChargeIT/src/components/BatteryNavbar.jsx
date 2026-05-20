import React, { useState } from 'react';
import { Link } from 'react-scroll';
import { FaBars, FaTimes } from 'react-icons/fa';
import Logo from "../logo.png"
import { Link as RouterLink } from 'react-router-dom';


const BatteryNavbar = () => {
  const [nav, setNav] = useState(false);

  const handleClick = () => setNav(!nav);
  const closeMobileMenu = () => setNav(false);

  return (
    <nav className='fixed w-full h-[70px] flex justify-between items-center px-4 bg-gradient-to-r from-green-50 to-green-100 text-green-800 z-50 shadow-sm'>
      <div className='container md:py-0'>
        <div className='flex justify-between items-center'>
          {/* Setting the components for navbar */}
          <div className='flex'>
          <span>
            <img src={Logo} alt="logo" style={{width: '40px'}} />
          </span>
          <RouterLink to="/" onClick={closeMobileMenu}>
            <button> <h1 className='text-3xl ml-2 font-bold font-serif text-green-800'>Charge IT</h1> </button>
          </RouterLink>
          </div>

          <div className="hidden md:flex gap-4 ml-auto items-center">
            <ul className='flex items-center gap-6 py-4'>
              <li>
                <Link className='inline-block py-2 hover:border-b-2 hover:text-green-600 hover:border-green-600 transition-all duration-300 text-lg font-medium' to="BatteryHero" smooth={true} duration={500} onClick={closeMobileMenu}> HOME </Link>
              </li>
              <li>
                <Link className='inline-block py-2 hover:border-b-2 hover:text-green-600 hover:border-green-600 transition-all duration-300 text-lg font-medium' to="BatteryTwo" smooth={true} duration={500} onClick={closeMobileMenu}> BENEFITS </Link>
              </li>
              <li>
                <Link className='inline-block py-2 hover:border-b-2 hover:text-green-600 hover:border-green-600 transition-all duration-300 text-lg font-medium' to="instructions" smooth={true} duration={500} onClick={closeMobileMenu}>  INSTRUCTIONS </Link>
              </li>
            </ul>
          </div>
                
          {/* Hamburger Button for mobile menu*/}
          <div className='md:hidden z-10 ml-auto'>
            {!nav ? <FaBars className='text-2xl' /> : <FaTimes className='text-2xl' />}
          </div>
          
        </div>
      </div>

      {/* Mobile Menu onlick Hamburger*/}
      <div className={`md:hidden ${nav ? 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50' : 'hidden'}`}>
        <div className="bg-gradient-to-b from-green-50 to-green-100 rounded-lg p-4 transform scale-90">
          <ul className='flex flex-col items-center gap-4'>
            <li>
              <Link onClick={closeMobileMenu} to="BatteryHero" smooth={true} duration={500} className='text-green-800 hover:text-green-600 transition-all duration-300'> HOME </Link>
            </li>
            <li>
              <Link onClick={closeMobileMenu} to="BatteryTwo" smooth={true} duration={500} className='text-green-800 hover:text-green-600 transition-all duration-300'> BENEFITS </Link>
            </li>
            <li>
              <Link onClick={closeMobileMenu} to="instructions" smooth={true} duration={500} className='text-green-800 hover:text-green-600 transition-all duration-300'> INSTRUCTIONS </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default BatteryNavbar;