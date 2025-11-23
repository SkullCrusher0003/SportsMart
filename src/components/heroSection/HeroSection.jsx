import React from 'react'

function HeroSection() {
  return (
    <div className="w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[380px] overflow-hidden">
      <img
        src="../../../heroImage.png"
        className="w-full h-full object-cover object-center"
      />
    </div>
  )
}

export default HeroSection