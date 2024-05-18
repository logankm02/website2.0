import React, { useState, useEffect } from 'react';
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

export default function About() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    setFormData({
      name: '',
      email: '',
      message: ''
    });
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

  return (
    <main className="h-auto top-0 left-0">
      <div className={`flex flex-col items-center mx-10 transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div id='home' className='w-screen h-screen flex flex-col justify-center items-center mb-20 bg-banner bg-cover bg-center'>
          <div className='grid grid-cols-2 m-10'>
            <div className='flex flex-col items-center justify-center'>
              <img className='rounded-full border h-80' src={profile} alt="profile" />
            </div>
            <div className='w-auto grid grid-cols-1 items-center justify-center text-right p-6 text-white border rounded-lg bg-slate-800 bg-opacity-20 hover:scale-105 transition-transform'>
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
          <a href="#about" className='flex items-center justify-center' onClick={handleScrollAbout}><img className='w-14' src={arrow} alt="arrow" /></a>
        </div>
        <div id='about' className='flex flex-col justify-center h-max'>
          <h1 className='text-center mb-5 text-3xl font-bold'>Education</h1>
          <div className='flex flex-row items-center space-x-4 border p-8 rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform'>
            <img className='h-20' src={r} alt="R" />
            <div>
              <h1>University of Rochester</h1>
              <p>Rochester, New York</p>
              <p>Major in Computer Science</p>
              <p>Major in Economics</p>
              <p>Class of 2025</p>
            </div>
            <div>
              <p>GPA 3.93</p>
              <p>Dean's Scholar, Provost's Circle Scholar</p>
              <p>Varsity Athlete (Men's Soccer)</p>
              <p>UAA All-Academic Recognition</p>
              <p>Dean's List in every semester</p>
            </div>
          </div>
        </div>
        <div className='flex flex-col justify-center '>
          <h1 className='text-center mb-5 text-3xl font-bold'>Projects</h1>
          <div className='flex flex-row items-center justify-between space-x-4 border p-4 rounded-md bg-slate-50 mb-10'>
            <div>
              AI Text Chatbot
            </div>
            <div>
              Finetuning LLMs
            </div>
          </div>
          <div className='flex flex-row items-center justify-between space-x-4 border p-4 rounded-md bg-slate-50 mb-10'>
            <div>
              Personal Messaging App
            </div>
            <div>
              Messaging App
            </div>
          </div>
          <div className='flex flex-row items-center justify-between space-x-4 border p-4 rounded-md bg-slate-50 mb-10'>
            <div>
              Sliding Block Puzzle Solver
            </div>
            <div>
              Depth First Search
            </div>
          </div>
          <div className='flex flex-row items-center justify-between space-x-4 border p-4 rounded-md bg-slate-50 mb-10'>
            <div>
              Path Finder
            </div>
            <div>
              Dijsktra's Algorithm
            </div>
          </div>
          <div className='flex flex-row items-center justify-between space-x-4 border p-4 rounded-md bg-slate-50 mb-10'>
            <div>
              Time Zone Converter and Weather
            </div>
            <div>
              Had trouble with the time?
            </div>
          </div>
          <div className='flex flex-row items-center justify-between space-x-4 border p-4 rounded-md bg-slate-50 mb-10'>
            <div>
              Personal Website
            </div>
            <div>
              This Website
            </div>
          </div>
        </div>
        <div className='flex flex-col justify-center mb-10'>
          <h1 className='text-center mb-10 text-3xl font-bold'>Skills</h1>
          <div className='grid grid-cols-7'>
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
          <p className='mb-4'>Email logankm2014@gmail.com or use this form to send me an email. I'd love to hear from you!</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-semibold mb-1">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-semibold mb-1">Message:</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
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
