import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { BiSolidSun, BiSolidMoon } from 'react-icons/bi';
import { Link as ScrollLink } from 'react-scroll';
import { FaBars, FaTimes } from 'react-icons/fa';
import Logo from "../logo.png"

const Navbar = ({ theme, setTheme }) => {
  const [nav, setNav] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleClick = () => setNav(!nav);
  const closeMobileMenu = () => setNav(false);

  const handleAccountClick = () => {
    if (auth.currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/logout');
    }
  };

  return (
    <nav className='fixed w-full h-[70px] flex justify-between items-center px-4 bg-primary dark:bg-dark dark:text-white z-50'>
      <div className='container md:py-0'>
        <div className='flex justify-between items-center'>
          {/* Setting the components for navbar */}

          <span>
          <Link to="/" className="text-2xl font-bold text-green-600">
                
                  <button className='py-2 hover:border-b-2 hover:text-green-700 hover:border-green-700 transition-colors-duration-500 hover:cursor-pointer text-lg font-medium flex'><img src={Logo} alt="logo" style={{width: '40px'}} /><h1 className='text-3xl ml-2 font-bold font-serif'>Charge IT</h1></button>
                </Link>
          </span>

          <div className="hidden md:flex gap-4 ml-auto items-center">
            <ul className='flex items-center gap-6 py-4'>
              <li>
                <Link to="/services" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">SERVICES</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">ABOUT</Link>
              </li>
              <li>
                <button
                  onClick={handleAccountClick}
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {auth.currentUser ? 'ACCOUNT' : 'LOGIN'}
                </button>
              </li>

            
            </ul>
          </div>
                
          {/* Hamburger Button for mobile menu*/}
          <div className='md:hidden z-10 ml-auto'>
            {!nav ? <FaBars aria-expanded="false" onClick={handleClick} /> : <FaTimes aria-expanded="true" onClick={handleClick} />}
          </div>

          
        </div>
      </div>

      {/* Mobile Menu onlick Hamburger*/}
      <div className={`md:hidden ${nav ? 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50' : 'hidden'}`}>
        <div className="bg-gray-300 dark:bg-gray-800 rounded-lg p-4 transform scale-90">
          <ul className='flex flex-col items-center gap-4'>
            <li>
              <ScrollLink onClick={closeMobileMenu} to="booking" smooth={true} duration={500}> Services </ScrollLink>
            </li>
            <li>
              <ScrollLink onClick={closeMobileMenu} to="about" smooth={true} duration={500}> About Us </ScrollLink>
            </li>
            <li>
              <button
                onClick={() => {
                  handleAccountClick();
                  closeMobileMenu();
                }}
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {auth.currentUser ? 'ACCOUNT' : 'LOGIN'}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;