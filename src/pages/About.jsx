import React, { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import emailjs from "@emailjs/browser"
import profile from '/images/profile.jpeg';
import github from '/images/github.png';
import linkedin from '/images/linkedin.png';
import arrow from '/images/arrow.png';
import r from '/images/r.png';
import python from '/images/python.png';
import java from '/images/java.png';
import cLogo from '/images/clogo.png';
import jsLogo from '/images/jslogo.png';
import swift from '/images/swift.png';
import php from '/images/php.png';
import sql from '/images/sqllogo.png';
import html from '/images/html.png';
import css from '/images/css.png';
import reactLogo from '/images/react.png';
import threejs from '/images/threejs.png';
import tailwind from '/images/tailwind.png';
import mysql from '/images/mysql.png';
import mongodb from '/images/mongodb.svg';
import firebase from '/images/firebase.png';
import webScreenshot from '/images/webss.png';
import messageScreenshot from '/images/messagess.png';
import weatherScreenshot from '/images/weatherss.png';
import findUrPartyScreenshot from '/images/findurpartyss.jpg';

export default function About() {
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)'})
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })

  const form = useRef()

  const sendEmail = (e) => {
    e.preventDefault();
    console.log(import.meta.env.VITE_PUBLIC_KEY);
    emailjs.sendForm(
        import.meta.env.VITE_SERVICE_ID, 
        import.meta.env.VITE_TEMPLATE_ID, 
        form.current, {
            publicKey: import.meta.env.VITE_PUBLIC_KEY,
        }).then(
        () => {
          console.log('SUCCESS!');
        },
        (error) => {
          console.log('FAILED...', error);
        },
      );
  };

  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleScrollAbout = (e) => {
    e.preventDefault();
    const aboutSection = document.querySelector('#about');
    aboutSection.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollGetInTouch = (e) => {
    e.preventDefault();
    const aboutSection = document.querySelector('#getInTouch');
    aboutSection.scrollIntoView({ behavior: 'smooth' });
  };

  const navWeb = (e) => {
    e.preventDefault();
    const url = 'https://logankm02.github.io/website2.0/';
    window.open(url, '_blank');
  }

  const msgWeb = (e) => {
    e.preventDefault();
    const url = 'https://logankm02.github.io/Message-App/';
    window.open(url, '_blank');
  }

  const trvlWeb = (e) => {
    e.preventDefault();
    const url = 'https://logankm02.github.io/travel-helper/';
    window.open(url, '_blank');
  }

  const findUrPartyAppStore = (e) => {
    e.preventDefault();
    const url = 'https://apps.apple.com/app/id6465749219';
    window.open(url, '_blank');
  }
  

  return (
    <main className="h-auto top-0 left-0">
      <div className={`flex flex-col items-center mx-10 transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div id='home' className='w-screen md:h-screen flex flex-col justify-center items-center mb-20 bg-banner bg-cover bg-center'>
          <div className='grid grid-cols-1 md:grid-cols-2 m-10'>
            <div className='flex flex-col items-center justify-center p-4'>
              <img className='rounded-full border-8 w-4/5 mb-5 md:h-80 md:w-auto' src={profile} alt="profile" />
            </div>
            <div className='w-auto grid grid-cols-1 items-center justify-center text-right p-4 text-white border rounded-lg bg-slate-800 bg-opacity-20 hover:scale-105 transition-transform'>
              <h1 className='mb-5 text-3xl font-bold'>Logan Kinajil-Moran</h1>
              <div className='flex flex-row justify-end mb-2'>
                <a href="https://github.com/logankm02"><img className='h-10 m-2' src={github} alt="git" /></a>
                <a href="https://www.linkedin.com/in/logan-kinajil-moran/"><img className='h-10 m-2' src={linkedin} alt="linkedin" /></a>
              </div>
              <p className='mb-2 text-2xl'>Originally from Wellington, New Zealand, I'm currently pursuing my BA with a double major in Computer Science and Economics, due to graduate in 2025.</p>
              <p className='mb-2 text-2xl'></p>
              <p className='mb-2 text-2xl'>I'm interested in working in AI and machine learning, as well as computer imaging.</p>
              <p className='mb-2 text-2xl'></p>
              <p className='mb-2 text-2xl'>Read on to hear about more of my experiences, and feel free to get in touch, I'd love to hear more about how I can help with your next project!</p>
              <p className='mb-2 text-2xl'></p>
              <div className='grid grid-cols-2 space-x-10'>
                <button type="button" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2">Download Resume</button>
                <button type="button" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2" onClick={handleScrollGetInTouch}>Get in touch</button>
              </div>
            </div>
          </div>
          <div>
            <a href="#about" className='flex justify-center items-start' onClick={handleScrollAbout}><img className='w-14' src={arrow} alt="arrow" /></a>
          </div>
          
        </div>
        <div id='about' className='flex flex-col justify-center h-max'>
          <h1 className='text-center mb-5 text-3xl font-bold'>Education</h1>
          <div className='grid grid-cols-1 place-items-center md:flex md:flex-row md:items-center space-x-4 border p-8 rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform'>
            <img className='h-20 mb-2' src={r} alt="R" />
            <div className='mb-4 text-center md:text-left'>
              <h1>University of Rochester</h1>
              <p>Rochester, New York</p>
              <p>Major in Computer Science</p>
              <p>Major in Economics</p>
              <p>Class of 2025</p>
            </div>
            <div className='mb-4 text-center md:text-left'>
              <p>GPA 3.93</p>
              <p>Dean's Scholar, Provost's Circle Scholar</p>
              <p>Varsity Athlete (Men's Soccer)</p>
              <p>UAA All-Academic Recognition</p>
              <p>Dean's List in every semester</p>
            </div>
          </div>
        </div>
        <div className='flex flex-col justify-center w-4/5 md:w-3/5'>
          <h1 className='text-center mb-5 text-3xl font-bold'>Projects</h1>
          <div className='grid grid-cols-1 h-auto md:flex md:flex-row justify-between space-x-4 border rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform'>
            <div className='left-0 text-left p-4 flex flex-col justifty-between h-full'>
              <h1>Personal Website</h1>
              <p className='flex flex-row mb-5'>Made with: <img className='project' src={reactLogo} alt="react" /><img className='project' src={threejs} alt="threejs" /><img className='project' src={tailwind} alt="tailwind" /></p>
              <button type="button" className="w-3/4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2" onClick={navWeb}>View Website</button>
            </div>
            {isDesktop && (
              <div className='w-4/5 md:w-1/2 h-auto md:flex md:items-center md:justify-center justify-items-center p-4'>
                <img className='w-4/5 h-auto md:h-40 md:w-auto' src={webScreenshot} alt="message" />
              </div>
            )}
          </div>
          <div className='grid grid-cols-1 h-auto md:flex md:flex-row justify-between space-x-4 border rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform'>
            <div className='left-0 text-left p-4 flex flex-col justifty-between h-full'>
              <h1>Personal Messaging Site</h1>
              <p className='flex flex-row mb-5'>Made with: <img className='project' src={reactLogo} alt="react" /><img className='project' src={firebase} alt="firebase" /></p>
              <button type="button" className="w-3/4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2" onClick={msgWeb}>View Website</button>
            </div>
            {isDesktop && (
              <div className='w-4/5 md:w-1/2 h-auto md:flex md:items-center md:justify-center justify-items-center p-4'>
                <img className='w-full h-auto md:h-40 md:w-auto' src={messageScreenshot} alt="message" />
              </div>
            )}
          </div>
          <div className='grid grid-cols-1 h-auto md:flex md:flex-row justify-between space-x-4 border rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform'>
            <div className='left-0 text-left p-4 flex flex-col justifty-between h-full'>
              <h1>Travel/Remote Work Helper</h1>
              <p className='flex flex-row mb-5'>Made with: <img className='project' src={html} alt="html" /><img className='project' src={css} alt="css" /><img className='project' src={jsLogo} alt="js" /></p>
              <button type="button" className="w-3/4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2" onClick={trvlWeb}>View Website</button>
            </div>
            {isDesktop && (
              <div className='w-4/5 md:w-1/2 h-auto md:flex md:items-center md:justify-center justify-items-center p-4'>
                <img className='w-full h-auto md:h-40 md:w-auto' src={weatherScreenshot} alt="message" />
              </div>
            )}
          </div>
          <div className='grid grid-cols-1 h-auto md:flex md:flex-row justify-between space-x-4 border rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform'>
            <div className='left-0 text-left p-4 flex flex-col justifty-between h-full'>
              <h1>findUrParty iOS App</h1>
              <p className='flex flex-row mb-5'>Made with: <img className='project' src={swift} alt="swift" /></p>
              <button type="button" className="w-3/4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2" onClick={findUrPartyAppStore}>View in App Store</button>
            </div>
            {isDesktop && (
              <div className='w-4/5 md:w-1/2 h-auto md:flex md:items-center md:justify-center justify-items-center p-4'>
                <img className='w-full h-auto md:h-40 md:w-auto' src={findUrPartyScreenshot} alt="message" />
              </div>
            )} 
          </div>
        </div>
        <div className='flex flex-col justify-center mb-10'>
          <h1 className='text-center mb-10 text-3xl font-bold'>Skills</h1>
          <div className='grid grid-cols-4 md:grid-cols-7'>
            <div className='skill'>
              <img src={python} alt="python" />
              <p>Python</p>
            </div>
            <div className='skill'>
              <img src={java} alt="java" />
              <p>Java</p>
            </div>
            <div className='skill'>
              <img src={cLogo} alt="c" />
              <p>C</p>
            </div>
            <div className='skill'>
              <img src={jsLogo} alt="js" />
              <p>JavaScript</p>
            </div>
            <div className='skill'>
              <img src={swift} alt="swift" />
              <p>Swift</p>
            </div>
            <div className='skill'>
              <img src={php} alt="php" />
              <p>PHP</p>
            </div>
            <div className='skill'>
              <img src={sql} alt="sql" />
              <p>SQL</p>
            </div>
            <div className='skill'>
              <img src={html} alt="html" />
              <p>HTML</p>
            </div>
            <div className='skill'>
              <img src={css} alt="css" />
              <p>CSS</p>
            </div>
            <div className='skill'>
              <img src={reactLogo} alt="react" />
              <p>React</p>
            </div>
            <div className='skill'>
              <img src={threejs} alt="threejs" />
              <p>Three.js</p>
            </div>
            <div className='skill'>
              <img src={tailwind} alt="tailwind" />
              <p>Tailwind</p>
            </div>
            <div className='skill'>
              <img src={mysql} alt="mysql" />
              <p>MySQL</p>
            </div>
            <div className='skill'>
              <img src={mongodb} alt="mongodb" />
              <p>MongoDB</p>
            </div>
          </div>
        </div>
        <div id="getInTouch" className="max-w-md m-auto bg-white rounded-md mb-10">
          <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
          <p className='mb-4'>Email <a href="mailto:logankm2014@gmail.com">logankm2014@gmail.com</a> or use this form to send me an email. I'd love to hear from you!</p>
          <form ref={form} onSubmit={sendEmail}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-semibold mb-1">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-semibold mb-1">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-semibold mb-1">Message:</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              ></textarea>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600">Submit</button>
          </form>
        </div>
      </div>
    </main>
  );
}
