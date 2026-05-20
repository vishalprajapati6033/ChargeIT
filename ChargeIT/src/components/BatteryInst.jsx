import React from 'react';
import Location from "../images/vector-location-icon.jpg"
import Park from "../images/parking.png"
import Auth from "../images/authentication-symbol.jpg"
import Battery from "../images/Battery swap.jpg"
import Port from "../images/charging port.jpg"
import Resume from "../images/resume journy.jpg"
import Payment from "../images/payment mode.jpg"
import Screen from "../images/screen.jpeg"

function BatteryInst() {
  return (
    <div name="instructions" className="relative overflow-hidden">
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

        <div className="container mx-auto px-6 relative z-10">
          <h1 className='text-center font-bold mb-8 text-5xl text-green-800'>Instructions for Battery Swap</h1>
          <div className="relative container mx-auto px-6 flex flex-col space-y-8">
            <div className="absolute z-0 w-2 h-full bg-green-200 shadow-md inset-0 left-17 md:mx-auto md:right-0 md:left-0"></div>

            <div className="relative z-10">
              <img src={Location} alt="" className="timeline-img" />
              <div className="timeline-container">
                <div className="timeline-pointer" aria-hidden="true"></div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-md shadow-md border border-green-200"
                data-aos="fade-left" data-aos-duration="800" data-aos-once="false">
                  <div className='font-bold text-green-800'>1. Locate a <span className="font-serif">Charge IT</span> Swap Station:</div>
                  <p className="text-green-700">Use the <span className="font-serif"> Charge IT</span> website to find the nearest Swap Station. Drive to the designated <span className="font-serif"> Charge IT</span> Swap Station location.</p>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <img src={Park} alt="" className="timeline-img" />
              <div className="timeline-container timeline-container-left">
                <div className="timeline-pointer timeline-pointer-left" aria-hidden="true"></div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-md shadow-md border border-green-200"
                data-aos="fade-right" data-aos-duration="800" data-aos-once="false">
                  <div className='font-bold text-green-800'>2. Park in the Designated Area:</div>
                  <p className="text-green-700">Once at the Swap Station, park your electric vehicle in the designated area.</p>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <img src={Auth} alt="" className="timeline-img" />
              <div className="timeline-container">
                <div className="timeline-pointer" aria-hidden="true"></div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-md shadow-md border border-green-200"
                data-aos="fade-left" data-aos-duration="800" data-aos-once="false">
                  <div className='font-bold text-green-800'>3. Authentication:</div>
                  <p className="text-green-700">Authenticate the battery swap process using the <span className="font-serif"> Charge IT</span> app or any provided authentication method.</p>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <img src={Screen} alt="" className="timeline-img" />
              <div className="timeline-container timeline-container-left">
                <div className="timeline-pointer timeline-pointer-left" aria-hidden="true"></div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-md shadow-md border border-green-200"
                data-aos="fade-right" data-aos-duration="800" data-aos-once="false">
                  <div className='font-bold text-green-800'>4. Follow On-Screen Instructions:</div>
                  <p className="text-green-700">The Swap Station will guide you through the process with on-screen instructions. Ensure your vehicle is in park and turn off the ignition.</p>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <img src={Port} alt="" className="timeline-img" />
              <div className="timeline-container">
                <div className="timeline-pointer" aria-hidden="true"></div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-md shadow-md border border-green-200"
                data-aos="fade-left" data-aos-duration="800" data-aos-once="false">
                  <div className='font-bold text-green-800'>5. Open Charging Port:</div>
                  <p className="text-green-700">Open the charging port on your electric vehicle as directed by the on-screen instructions.</p>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <img src={Battery} alt="" className="timeline-img" />
              <div className="timeline-container timeline-container-left">
                <div className="timeline-pointer timeline-pointer-left" aria-hidden="true"></div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-md shadow-md border border-green-200"
                data-aos="fade-right" data-aos-duration="800" data-aos-once="false">
                  <div className='font-bold text-green-800'>6. Wait for Battery Swap:</div>
                  <p className="text-green-700">Remain in your vehicle as the automated system performs the battery swap. The process typically takes a few minutes.</p>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <img src={Payment} alt="" className="timeline-img" />
              <div className="timeline-container">
                <div className="timeline-pointer" aria-hidden="true"></div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-md shadow-md border border-green-200"
                data-aos="fade-left" data-aos-duration="800" data-aos-once="false">
                  <div className='font-bold text-green-800'>7. Payment and Confirmation:</div>
                  <p className="text-green-700">Confirm the battery swap details on the screen. Complete the payment process through the <span className="font-serif"> Charge IT</span> app or payment terminal.</p>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <img src={Port} alt="" className="timeline-img" />
              <div className="timeline-container timeline-container-left">
                <div className="timeline-pointer timeline-pointer-left" aria-hidden="true"></div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-md shadow-md border border-green-200"
                data-aos="fade-right" data-aos-duration="800" data-aos-once="false">
                  <div className='font-bold text-green-800'>8. Close Charging Port:</div>
                  <p className="text-green-700">Close the charging port on your electric vehicle.</p>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <img src={Resume} alt="" className="timeline-img" />
              <div className="timeline-container">
                <div className="timeline-pointer" aria-hidden="true"></div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-md shadow-md border border-green-200"
                data-aos="fade-left" data-aos-duration="800" data-aos-once="false">
                  <div className='font-bold text-green-800'>9. Resume Your Journey:</div>
                  <p className="text-green-700">Once the battery swap is complete and payment is confirmed, you're ready to continue your journey with a fully charged battery.</p>
                </div>
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
      `}</style>
    </div>
  );
}

export default BatteryInst;
