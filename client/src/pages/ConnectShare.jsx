import React, { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';

const ConnectShare = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Connect Multiple Devices",
      description: "Use your company in multiple devices and on the go by syncing it.",
      image: (
        <div className="relative w-64 h-64">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-16">
                <div className="w-12 h-20 border-2 border-gray-700 rounded-xl bg-white">
                  <div className="flex space-x-1 justify-end p-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-32">
                <div className="w-48 h-32 border-2 border-gray-700 rounded-lg bg-white">
                  <div className="flex space-x-1 justify-end p-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                </div>
                <div className="w-48 h-32 border-2 border-gray-700 rounded-lg bg-white">
                  <div className="flex space-x-1 justify-end p-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Give Access To Your Staff",
      description: "Share your company with your staff in a secure manner by assigning roles.",
      image: (
        <div className="w-64 h-64 relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative flex items-center">
              <div className="w-48 h-48 border-2 border-gray-700 rounded-lg bg-white p-4">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full mb-2"></div>
                    <div className="w-12 h-2 bg-gray-300 rounded mx-auto"></div>
                  </div>
                </div>
              </div>
              <div className="ml-4 space-y-4">
                <div className="w-24 h-12 border-2 border-gray-700 rounded-lg bg-white">
                  <div className="flex items-center p-2 space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div className="w-12 h-2 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="w-24 h-12 border-2 border-gray-700 rounded-lg bg-white">
                  <div className="flex items-center p-2 space-x-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <div className="w-12 h-2 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="w-24 h-12 border-2 border-gray-700 rounded-lg bg-white">
                  <div className="flex items-center p-2 space-x-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <div className="w-12 h-2 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-2 mb-8">
        <h1 className="text-xl font-semibold">Sync & Share</h1>
        <Crown className="w-5 h-5" />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="relative min-h-[400px]">
          <div className="flex flex-col items-center justify-center">
            {slides[currentSlide].image}
            
            <h2 className="text-2xl font-semibold mt-8 mb-2">
              {slides[currentSlide].title}
            </h2>
            
            <p className="text-gray-500 text-center mb-8">
              {slides[currentSlide].description}
            </p>

            <div className="flex items-center space-x-4">
              <button 
                onClick={prevSlide}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300"
              >
                ←
              </button>
              
              <div className="flex space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full ${
                      currentSlide === index ? 'bg-gray-400' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              
              <button 
                onClick={nextSlide}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <button className="w-full bg-red-500 text-white rounded-lg py-3 mt-8">
          Enable Sync
        </button>

        <p className="text-gray-500 text-sm text-center mt-4">
          *You're logged in with 7224098370
        </p>
      </div>
    </div>
  );
};

export default ConnectShare;