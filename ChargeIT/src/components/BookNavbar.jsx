import React, { useState } from 'react';
import { Link } from 'react-scroll';
import { FaBars, FaTimes } from 'react-icons/fa';
import Logo from "../logo.png"
import { Link as RouterLink } from 'react-router-dom';

const BookNavbar = () => {
  const [nav, setNav] = useState(false);

  const handleClick = () => setNav(!nav);
  const closeMobileMenu = () => setNav(false);

  return (
    <nav className='fixed w-full h-[70px] flex justify-between items-center px-4 bg-gradient-to-r from-green-50 to-green-100 text-green-800 z-50 shadow-sm'>
      <div className='container md:py-0'>
        <div className='flex justify-between items-center'>
          {/* Logo and Brand */}
          <div className='flex items-center'>
            <span>
              <img src={Logo} alt="logo" style={{width: '40px'}} />
            </span>
            <RouterLink to="/" onClick={closeMobileMenu}>
              <button className='flex items-center'> 
                <h1 className='text-3xl ml-2 font-bold font-serif text-green-800'>Charge IT</h1>
              </button>
            </RouterLink>          
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4 ml-auto items-center">
            <ul className='flex items-center gap-6 py-4'>
              <li>
                <Link 
                  className='inline-block py-2 hover:border-b-2 hover:text-green-600 hover:border-green-600 transition-all duration-300 text-lg font-medium' 
                  to="BookHero" 
                  smooth={true} 
                  duration={500} 
                  onClick={closeMobileMenu}
                >
                  HOME
                </Link>
              </li>
              <li>
                <Link 
                  className='inline-block py-2 hover:border-b-2 hover:text-green-600 hover:border-green-600 transition-all duration-300 text-lg font-medium' 
                  to="stations" 
                  smooth={true} 
                  duration={500} 
                  onClick={closeMobileMenu}
                >
                  CHARGING STATIONS
                </Link>
              </li>
            </ul>
          </div>
                
          {/* Mobile Menu Button */}
          <div className='md:hidden' onClick={handleClick}>
            {!nav ? <FaBars className='text-2xl' /> : <FaTimes className='text-2xl' />}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <ul className={!nav ? 'hidden' : 'absolute top-[70px] left-0 w-full bg-gradient-to-b from-green-50 to-green-100 text-green-800 md:hidden'}>
        <li className='border-b border-green-200'>
          <Link 
            className='block py-4 px-4 hover:bg-green-100 transition-colors duration-300' 
            to="BookHero" 
            smooth={true} 
            duration={500} 
            onClick={closeMobileMenu}
          >
            HOME
          </Link>
        </li>
        <li className='border-b border-green-200'>
          <Link 
            className='block py-4 px-4 hover:bg-green-100 transition-colors duration-300' 
            to="stations" 
            smooth={true} 
            duration={500} 
            onClick={closeMobileMenu}
          >
            CHARGING STATIONS
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default BookNavbar;