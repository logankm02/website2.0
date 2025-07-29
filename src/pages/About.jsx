import React, { useState, useEffect, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import emailjs from "@emailjs/browser";
import TableOfContents from "../components/TableOfContents";
import WorldClock from "../components/WorldClock";
import SpotifyPlaylists from "../components/SpotifyPlaylists";
import RecentReads from "../components/RecentReads";
import profile from "../../public/images/profile.jpeg";
import github from "../../public/images/github.png";
import linkedin from "../../public/images/linkedin.png";
import arrow from "../../public/images/arrow.png";
import r from "../../public/images/r.png";
import python from "../../public/images/python.png";
import java from "../../public/images/java.png";
import cLogo from "../../public/images/clogo.png";
import jsLogo from "../../public/images/jslogo.png";
import swift from "../../public/images/swift.png";
import php from "../../public/images/php.png";
import sql from "../../public/images/sqllogo.png";
import html from "../../public/images/html.png";
import css from "../../public/images/css.png";
import flask from "../../public/images/flask.png";
import reactLogo from "../../public/images/react.png";
import threejs from "../../public/images/threejs.png";
import tailwind from "../../public/images/tailwind.png";
import mysql from "../../public/images/mysql.png";
import mongodb from "../../public/images/mongodb.svg";
import firebase from "../../public/images/firebase.png";
import webScreenshot from "../../public/images/webss.png";
import messageScreenshot from "../../public/images/messagess.png";
import weatherScreenshot from "../../public/images/weatherss.png";
import findUrPartyScreenshot from "../../public/images/findurpartyss.jpg";
import scrabbleScreenshot from "../../public/images/scrabbless.png";
import blackjackScreenshot from "../../public/images/blackjackss.png";
import berkeley from "../../public/images/berkeley.png";

export default function About() {
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  
  const VITE_PUBLIC_KEY = "dMEvhwxawdetQkE0U";
  const VITE_TEMPLATE_ID = "template_9rosqi6";
  const VITE_SERVICE_ID = "service_43su9pt";

  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();
    console.log("Sending email with public key:", VITE_PUBLIC_KEY);
    
    emailjs
      .sendForm(
        VITE_SERVICE_ID,
        VITE_TEMPLATE_ID,
        form.current,
        {
          publicKey: VITE_PUBLIC_KEY,
        }
      )
      .then(
        () => {
          console.log("SUCCESS!");
          alert("Message sent successfully!");
          form.current.reset();
        },
        (error) => {
          console.log("FAILED...", error);
          alert("Failed to send message. Please try again or email directly.");
        }
      );
  };

  const [fadeIn, setFadeIn] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (profileLoaded) {
      setFadeIn(true);
    }
  }, [profileLoaded]);

  const handleProfileLoad = () => {
    setProfileLoaded(true);
  };

  const handleScrollAbout = (e) => {
    e.preventDefault();
    const aboutSection = document.querySelector("#about");
    const yOffset = -80; // Offset to not scroll too far
    const y = aboutSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({top: y, behavior: 'smooth'});
  };

  const handleScrollGetInTouch = (e) => {
    e.preventDefault();
    const aboutSection = document.querySelector("#getInTouch");
    aboutSection.scrollIntoView({ behavior: "smooth" });
  };

  const navWeb = (e) => {
    e.preventDefault();
    const url = "https://logankm02.github.io/website2.0/";
    window.open(url, "_blank");
  };

  const msgWeb = (e) => {
    e.preventDefault();
    const url = "https://logankm02.github.io/Message-App/";
    window.open(url, "_blank");
  };

  const trvlWeb = (e) => {
    e.preventDefault();
    const url = "https://logankm02.github.io/travel-helper/";
    window.open(url, "_blank");
  };

  const scrabbleWeb = (e) => {
    e.preventDefault();
    const url = "https://logankm02.github.io/scrabble-bot/";
    window.open(url, "_blank");
  };
  const BlackjackWeb = (e) => {
    e.preventDefault();
    const url = "https://logankm02.github.io/blackjack/";
    window.open(url, "_blank");
  };

  const findUrPartyAppStore = (e) => {
    e.preventDefault();
    const url = "https://apps.apple.com/app/id6465749219";
    window.open(url, "_blank");
  };

  return (
    <main className="h-auto top-0 left-0">
      <TableOfContents />
      <div
        className={`flex flex-col items-center mx-10 transition-opacity duration-1000 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          id="home"
          className="w-screen h-screen flex flex-col bg-banner bg-cover bg-center relative overflow-hidden"
        >
          {/* Location Badge */}
          <div className="absolute top-4 right-4 flex items-center bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 z-10">
            <svg className="w-3 h-3 mr-1 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <p className="text-white text-xs font-medium">Wellington, NZ</p>
          </div>

          {/* Dashboard Grid */}
          <div className="flex-1 flex items-center justify-center w-full max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 w-full h-full max-h-[85vh]">
              
              {/* Profile Card - Main focal point */}
              <div className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20 h-full">
                <div className="flex flex-col items-center text-center h-full justify-center space-y-3">
                  <img
                    className="rounded-full border-3 border-white/30 shadow-xl w-20 h-20 object-cover"
                    src={profile}
                    alt="profile"
                    onLoad={handleProfileLoad}
                  />
                  <div className="space-y-1">
                    <h1 className="text-xl font-bold text-white">Logan Kinajil-Moran</h1>
                    <p className="text-white/80 text-sm">Electrical Engineering & CS</p>
                    <p className="text-white/70 leading-relaxed text-sm">
                      MEng student at UC Berkeley, originally from New Zealand 🇳🇿
                    </p>
                  </div>
                  
                  {/* Social Links */}
                  <div className="flex gap-2 w-full">
                    <a href="https://github.com/logankm02" className="flex-1 flex items-center justify-center gap-2 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105">
                      <img className="h-4 w-4" src={github} alt="github" />
                      <span className="text-white text-xs font-medium">GitHub</span>
                    </a>
                    <a href="https://www.linkedin.com/in/logan-kinajil-moran/" className="flex-1 flex items-center justify-center gap-2 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105">
                      <img className="h-4 w-4" src={linkedin} alt="linkedin" />
                      <span className="text-white text-xs font-medium">LinkedIn</span>
                    </a>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    <button className="text-black bg-white hover:bg-gray-100 font-semibold rounded-lg px-4 py-2 transition-all hover:scale-105 shadow-lg text-sm">
                      Download Resume
                    </button>
                    <button 
                      onClick={handleScrollGetInTouch}
                      className="text-white bg-white/20 hover:bg-white/30 font-semibold rounded-lg px-4 py-2 transition-all hover:scale-105 backdrop-blur-sm border border-white/30 text-sm"
                    >
                      Get in Touch
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side Widgets */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-fr h-full">
                
                {/* Recent Reads Widget */}
                <div className="h-full">
                  <RecentReads />
                </div>

                {/* Spotify Playlists Widget */}
                <div className="h-full">
                  <SpotifyPlaylists />
                </div>

                {/* World Clock & Weather Widget */}
                <div className="h-full">
                  <WorldClock />
                </div>

                {/* Table of Contents Widget */}
                <div className="h-full">
                  <TableOfContents isWidget={true} />
                </div>

              </div>
            </div>
          </div>

          {/* Scroll Arrow */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <a
              href="#about"
              className="flex justify-center items-center"
              onClick={handleScrollAbout}
            >
              <img className="w-6 slow-bounce opacity-70" src={arrow} alt="arrow" />
            </a>
          </div>
        </div>
        <div id="about" className="flex flex-col justify-center h-max w-4/5 md:w-3/5 mx-auto">
          <h1 className="text-center mb-5 text-3xl font-bold">Education</h1>
          
          {/* UC Berkeley */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 place-items-center md:place-items-start md:items-center border p-8 rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <img className="h-28 justify-self-center" src={berkeley} alt="Berkeley" />
            <div className="mb-4 text-center md:text-left">
              <h1>University of California, Berkeley</h1>
              <p>Berkeley, California</p>
              <p>Master of Engineering</p>
              <p>Electrical Engineering and Computer Science</p>
              <p>Class of 2026</p>
            </div>
            <div className="mb-4 text-center md:text-left">
              <p>Fung Excellence Scholarship</p>
              <p>Concentration: Visual Computing and Computer Graphics</p>
            </div>
          </div>

          {/* University of Rochester */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 place-items-center md:place-items-start md:items-center border p-8 rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <img className="h-28 justify-self-center" src={r} alt="Rochester" />
            <div className="mb-4 text-center md:text-left">
              <h1>University of Rochester</h1>
              <p>Rochester, New York</p>
              <p>Major in Computer Science</p>
              <p>Major in Economics</p>
              <p>Class of 2025</p>
            </div>
            <div className="mb-4 text-center md:text-left">
              <p>GPA 3.93</p>
              <p>Dean's Scholar, Provost's Circle Scholar</p>
              <p>Varsity Athlete (Men's Soccer)</p>
              <p>UAA All-Academic Recognition</p>
              <p>Dean's List in every semester</p>
            </div>
          </div>
        </div>
        <div id="experience" className="flex flex-col justify-center h-max w-4/5 md:w-3/5 mx-auto">
          <h1 className="text-center mb-5 text-3xl font-bold">Experience</h1>
          
          {/* Electronics Engineer Intern */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 place-items-center md:place-items-start md:items-start border p-8 rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <div className="mb-4 text-center md:text-left">
              <h2 className="font-bold">Electronics Engineer Intern</h2>
              <p className="text-sm text-gray-600">June 2025 – Present</p>
            </div>
            <div className="mb-4 text-center md:text-left">
              <h3 className="font-semibold">OWL Integrations</h3>
              <p className="text-sm">Rochester, New York</p>
            </div>
            <div className="mb-4 text-center md:text-left">
              <p className="text-sm">• Beginning in June developing new electronics firmware for DuckLinks, and contribute to the ClusterDuck Protocol open source firmware</p>
            </div>
          </div>

          {/* Release Software Engineer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 place-items-center md:place-items-start md:items-start border p-8 rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <div className="mb-4 text-center md:text-left">
              <h2 className="font-bold">Release Software Engineer/Head of Testing</h2>
              <p className="text-sm text-gray-600">July 2024 – Present</p>
            </div>
            <div className="mb-4 text-center md:text-left">
              <h3 className="font-semibold">CyberDyne Ventures/Independent Research</h3>
              <p className="text-sm">US/Remote</p>
            </div>
            <div className="mb-4 text-center md:text-left">
              <p className="text-sm">• Collaborated with security researcher Craig Chamberlain (previously Principal Security Researcher at Elastic) to release the Skynet project at DEF CON 2024</p>
              <p className="text-sm">• Contributed to the backend using Go and Neo4j, and a React frontend integrated with Docker for demonstration</p>
            </div>
          </div>

          {/* Research Assistant */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 place-items-center md:place-items-start md:items-start border p-8 rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <div className="mb-4 text-center md:text-left">
              <h2 className="font-bold">Research Assistant</h2>
              <p className="text-sm text-gray-600">March 2024 – October 2024</p>
            </div>
            <div className="mb-4 text-center md:text-left">
              <h3 className="font-semibold">University of Rochester Medical Centre</h3>
              <p className="text-sm">Department of Neurosurgery</p>
              <p className="text-sm">Rochester, New York</p>
            </div>
            <div className="mb-4 text-center md:text-left">
              <p className="text-sm">• Collaborated with residents and PhD candidates in Dr. Jonathan J. Stone's lab to support neurosurgery research, enhancing team efficiency and contributing to successful project outcomes</p>
              <p className="text-sm">• Utilized computer science skills in data analysis, machine learning, and visualization using tools like PyTorch and scikit-learn to support scientific research, leading to improved data insights and successful funding applications</p>
            </div>
          </div>
        </div>
        <div id="projects" className="flex flex-col justify-center w-4/5 md:w-3/5">
          <h1 className="text-center mb-5 text-3xl font-bold">Projects</h1>
          <div className="grid grid-cols-1 h-auto md:flex md:flex-row justify-between space-x-4 border rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <div className="left-0 text-left p-4 flex flex-col justifty-between h-full">
              <h1>TuiNet</h1>
              <p className="flex flex-row mb-5">
                Made with: <img className="project" src={python} alt="python" />
                <img className="project" src={cLogo} alt="c" />
                <img className="project" src={jsLogo} alt="js" />
              </p>
              <button
                type="button"
                className="w-3/4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
              >
                View Project
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 h-auto md:flex md:flex-row justify-between space-x-4 border rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <div className="left-0 text-left p-4 flex flex-col justifty-between h-full">
              <h1>Kite</h1>
              <p className="flex flex-row mb-5">
                Made with: <img className="project" src={python} alt="python" />
                <img className="project" src={reactLogo} alt="react" />
                <img className="project" src={tailwind} alt="tailwind" />
              </p>
              <button
                type="button"
                className="w-3/4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
              >
                View Project
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 h-auto md:flex md:flex-row justify-between space-x-4 border rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <div className="left-0 text-left p-4 flex flex-col justifty-between h-full">
              <h1>Blackjack Game</h1>
              <p className="flex flex-row mb-5">
                Made with: <img className="project" src={html} alt="html" />
                <img className="project" src={css} alt="css" />
                <img className="project" src={jsLogo} alt="js" />
                <img className="project" src={python} alt="python" />
              </p>
              <button
                type="button"
                className="w-3/4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
                onClick={BlackjackWeb}
              >
                View Website
              </button>
            </div>
            {isDesktop && (
              <div className="w-4/5 md:w-1/2 h-auto md:flex md:items-center md:justify-center justify-items-center p-4">
                <img
                  className="w-4/5 h-auto md:h-40 md:w-auto"
                  src={blackjackScreenshot}
                  alt="scrabble"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 h-auto md:flex md:flex-row justify-between space-x-4 border rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <div className="left-0 text-left p-4 flex flex-col justifty-between h-full">
              <h1>findUrParty iOS App</h1>
              <p className="flex flex-row mb-5">
                Made with: <img className="project" src={swift} alt="swift" />
              </p>
              <button
                type="button"
                className="w-3/4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
                onClick={findUrPartyAppStore}
              >
                View in App Store
              </button>
            </div>
            {isDesktop && (
              <div className="w-4/5 md:w-1/2 h-auto md:flex md:items-center md:justify-center justify-items-center p-4">
                <img
                  className="w-full h-auto md:h-40 md:w-auto"
                  src={findUrPartyScreenshot}
                  alt="message"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 h-auto md:flex md:flex-row justify-between space-x-4 border rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <div className="left-0 text-left p-4 flex flex-col justifty-between h-full">
              <h1>Travel/Remote Work Helper</h1>
              <p className="flex flex-row mb-5">
                Made with: <img className="project" src={html} alt="html" />
                <img className="project" src={css} alt="css" />
                <img className="project" src={jsLogo} alt="js" />
              </p>
              <button
                type="button"
                className="w-3/4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
                onClick={trvlWeb}
              >
                View Website
              </button>
            </div>
            {isDesktop && (
              <div className="w-4/5 md:w-1/2 h-auto md:flex md:items-center md:justify-center justify-items-center p-4">
                <img
                  className="w-full h-auto md:h-40 md:w-auto"
                  src={weatherScreenshot}
                  alt="message"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 h-auto md:flex md:flex-row justify-between space-x-4 border rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <div className="left-0 text-left p-4 flex flex-col justifty-between h-full">
              <h1>Personal Messaging Site</h1>
              <p className="flex flex-row mb-5">
                Made with:{" "}
                <img className="project" src={reactLogo} alt="react" />
                <img className="project" src={firebase} alt="firebase" />
              </p>
              <button
                type="button"
                className="w-3/4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
                onClick={msgWeb}
              >
                View Website
              </button>
            </div>
            {isDesktop && (
              <div className="w-4/5 md:w-1/2 h-auto md:flex md:items-center md:justify-center justify-items-center p-4">
                <img
                  className="w-full h-auto md:h-40 md:w-auto"
                  src={messageScreenshot}
                  alt="message"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 h-auto md:flex md:flex-row justify-between space-x-4 border rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <div className="left-0 text-left p-4 flex flex-col justifty-between h-full">
              <h1>AI Scrabble Bot</h1>
              <p className="flex flex-row mb-5">
                Made with: <img className="project" src={html} alt="html" />
                <img className="project" src={css} alt="css" />
                <img className="project" src={jsLogo} alt="js" />
                <img className="project" src={python} alt="python" />
              </p>
              <button
                type="button"
                className="w-3/4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
                onClick={scrabbleWeb}
              >
                View Website
              </button>
            </div>
            {isDesktop && (
              <div className="w-4/5 md:w-1/2 h-auto md:flex md:items-center md:justify-center justify-items-center p-4">
                <img
                  className="w-4/5 h-auto md:h-40 md:w-auto"
                  src={scrabbleScreenshot}
                  alt="scrabble"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 h-auto md:flex md:flex-row justify-between space-x-4 border rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <div className="left-0 text-left p-4 flex flex-col justifty-between h-full">
              <h1>Personal Website</h1>
              <p className="flex flex-row mb-5">
                Made with:{" "}
                <img className="project" src={reactLogo} alt="react" />
                <img className="project" src={threejs} alt="threejs" />
                <img className="project" src={tailwind} alt="tailwind" />
              </p>
              <button
                type="button"
                className="w-3/4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
                onClick={navWeb}
              >
                View Website
              </button>
            </div>
            {isDesktop && (
              <div className="w-4/5 md:w-1/2 h-auto md:flex md:items-center md:justify-center justify-items-center p-4">
                <img
                  className="w-4/5 h-auto md:h-40 md:w-auto"
                  src={webScreenshot}
                  alt="message"
                />
              </div>
            )}
          </div>
        </div>
        <div id="skills" className="flex flex-col justify-center mb-10">
          <h1 className="text-center mb-10 text-3xl font-bold">Skills</h1>
          <div className="grid grid-cols-4 md:grid-cols-6">
            <div className="skill">
              <img src={python} alt="python" />
              <p>Python</p>
            </div>
            <div className="skill">
              <img src={java} alt="java" />
              <p>Java</p>
            </div>
            <div className="skill">
              <img src={cLogo} alt="c" />
              <p>C</p>
            </div>
            <div className="skill">
              <img src={jsLogo} alt="js" />
              <p>JavaScript</p>
            </div>
            <div className="skill">
              <img src={swift} alt="swift" />
              <p>Swift</p>
            </div>
            <div className="skill">
              <img src={php} alt="php" />
              <p>PHP</p>
            </div>
            <div className="skill">
              <img src={sql} alt="sql" />
              <p>SQL</p>
            </div>
            <div className="skill">
              <img src={html} alt="html" />
              <p>HTML</p>
            </div>
            <div className="skill">
              <img src={css} alt="css" />
              <p>CSS</p>
            </div>
            <div className="skill">
              <img src={reactLogo} alt="react" />
              <p>React</p>
            </div>
            <div className="skill">
              <img src={threejs} alt="threejs" />
              <p>Three.js</p>
            </div>
            <div className="skill">
              <img src={tailwind} alt="tailwind" />
              <p>Tailwind</p>
            </div>
            <div className="skill">
              <img src={mysql} alt="mysql" />
              <p>MySQL</p>
            </div>
            <div className="skill">
              <img src={mongodb} alt="mongodb" />
              <p>MongoDB</p>
            </div>
            <div className="skill">
              <img src={flask} alt="flask" />
              <p>Flask</p>
            </div>
          </div>
        </div>
        <div id="getInTouch" className="flex flex-col justify-center w-4/5 md:w-3/5 mx-auto mb-10">
          <h1 className="text-center mb-8 text-3xl font-bold">Get in Touch</h1>
          <div className="max-w-2xl mx-auto bg-slate-50 border rounded-xl p-8">
            <p className="mb-6 text-center text-gray-700">
              Email{" "}
              <a href="mailto:logankm2014@gmail.com" className="text-blue-600 hover:underline font-medium">
                logankm2014@gmail.com
              </a>{" "}
              or use this form to send me a message. I'd love to hear from you!
            </p>
            <form ref={form} onSubmit={sendEmail} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="px-8 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all hover:shadow-lg"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
