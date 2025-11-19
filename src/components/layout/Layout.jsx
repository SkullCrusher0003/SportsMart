import React from 'react'
import Footer from '../footer/Footer'
import Navbar from '../navbar/Navbar'

function Layout({ children }) {
  return (
    <div>
      {/* Navbar and Footer are Constant */}
      <Navbar />
      <div className="content">
        {/* This keeps changing */}
        {children}
      </div>
      <Footer />
    </div>
  )
}

export default Layout