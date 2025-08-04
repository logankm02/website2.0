import React, { useState, useEffect, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import emailjs from "@emailjs/browser";
import { useBackground } from "../contexts/BackgroundContext";
import TableOfContents from "../components/TableOfContents";
import WorldClock from "../components/WorldClock";
import SpotifyPlaylistsAPI from "../components/SpotifyPlaylistsAPI";
import RecentReads from "../components/RecentReads";
// Using public directory paths directly for Vite
const profile = "/images/profile.jpeg";
const github = "/images/github.png";
const linkedin = "/images/linkedin.png";
const arrow = "/images/arrow.png";
const r = "/images/r.png";
const python = "/images/python.png";
const cpp = "/images/c++.png";
const rp = "/images/rp.png";
const owlLogo = "/images/owl-logo.png";
const java = "/images/java.png";
const cLogo = "/images/clogo.png";
const jsLogo = "/images/jslogo.png";
const swift = "/images/swift.png";
const php = "/images/php.png";
const sql = "/images/sqllogo.png";
const html = "/images/html.png";
const css = "/images/css.png";
const flask = "/images/flask.png";
const reactLogo = "/images/react.png";
const threejs = "/images/threejs.png";
const tailwind = "/images/tailwind.png";
const mysql = "/images/mysql.png";
const mongodb = "/images/mongodb.svg";
const firebase = "/images/firebase.png";
const ruby = "/images/ruby.png";
const golang = "/images/golang.png";
const bash = "/images/bash.png";
const nodejs = "/images/nodejs.svg";
const neo4j = "/images/neo4j.png";
const linux = "/images/linux.png";
const azure = "/images/azure.png";
const git = "/images/git.png";
const docker = "/images/docker.png";
const vscode = "/images/vscode.png";
const pytorch = "/images/pytorch.png";
const platformio = "/images/platformio.png";
const rust = "/images/rust.png";
const webScreenshot = "/images/webss.png";
const messageScreenshot = "/images/messagess.png";
const weatherScreenshot = "/images/weatherss.png";
const findUrPartyScreenshot = "/images/findurpartyss.jpg";
const scrabbleScreenshot = "/images/scrabbless.png";
const blackjackScreenshot = "/images/blackjackss.png";
const tuinetScreenshot = "/images/tuinet.jpg";
const kiteScreenshot = "/images/askkite.png";
const berkeley = "/images/berkeley.png";

export default function About() {
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { setAboutContentLoaded } = useBackground();
  
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
  const [showMoreProjects, setShowMoreProjects] = useState(false);

  useEffect(() => {
    if (profileLoaded) {
      setFadeIn(true);
      // Delay background change until after hero fade-in completes
      setTimeout(() => {
        setAboutContentLoaded(true);
      }, 1100); // 1100ms to ensure fade-in is fully complete
    }
  }, [profileLoaded, setAboutContentLoaded]);

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

  const kiteWeb = (e) => {
    e.preventDefault();
    const url = "https://usekite.app";
    window.open(url, "_blank");
  };

  const findUrPartyAppStore = (e) => {
    e.preventDefault();
    const url = "https://apps.apple.com/app/id6465749219";
    window.open(url, "_blank");
  };

  const tuinetWeb = (e) => {
    e.preventDefault();
    const url = "https://medium.com/project-owl/project-t%C5%AB%C4%ABnet-tools-for-native-wildlife-conservation-5551211158fe";
    window.open(url, "_blank");
  };

  return (
    <main className="h-auto top-0 left-0">
      {/* Logo in top left */}
      <div className="hidden md:block fixed top-2 left-2 z-30">
        <img 
          src="/lkmlogo-white.png" 
          alt="LKM Logo" 
          className="w-10 h-10 object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
        />
      </div>
      <TableOfContents />
      <div
        className={`flex flex-col items-center mx-4 md:mx-10 transition-opacity duration-1000 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          id="home"
          className="w-screen min-h-screen md:h-screen flex flex-col bg-banner bg-cover bg-center relative overflow-hidden"
        >
          {/* Location Badge */}
          <div className="hidden md:flex absolute top-4 right-4 items-center bg-black/20 backdrop-blur-sm rounded-full px-2 py-0.5 z-10">
            <svg className="w-2.5 h-2.5 mr-0.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <p className="text-white text-xs font-medium">Wellington, NZ</p>
          </div>

          {/* Hero Dashboard - Redesigned */}
          <div className="w-full h-full flex items-center justify-center px-4 md:px-8 py-4 md:py-6">
            <div className="w-full max-w-7xl min-h-[90vh] md:h-[75vh] grid grid-cols-1 md:grid-cols-12 grid-rows-auto md:grid-rows-6 gap-2 md:gap-3">
              
              {/* Profile Card - Left side spanning 4 columns, 6 rows */}
              <div className="col-span-1 md:col-span-4 row-span-1 md:row-span-6 bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-2xl border border-white/20 flex flex-col items-center justify-center text-center">
                <img
                  className="rounded-full border-3 border-white/30 shadow-xl w-24 md:w-40 h-24 md:h-40 object-cover mb-2 md:mb-4"
                  src={profile}
                  alt="profile"
                  onLoad={handleProfileLoad}
                />
                <h1 className="text-xl md:text-3xl font-bold text-white mb-1">Logan Kinajil-Moran</h1>
                <p className="text-white/80 text-sm md:text-lg mb-1">Electrical Engineering & Computer Science</p>
                <p className="text-white/80 text-xs md:text-sm mb-1">University of Rochester '25 | UC Berkeley '26</p>
                <p className="text-white/80 text-sm mb-1"></p>
                <p className="text-white/70 text-xs md:text-sm mb-2 md:mb-4 leading-relaxed">
                  MEng student currently based in Berkeley, California. From New Zealand 🇳🇿 
                </p>
                
                {/* Social Links */}
                <div className="flex gap-1 md:gap-2 w-full mb-2 md:mb-4">
                  <a href="https://github.com/logankm02" className="flex-1 flex items-center justify-center gap-1 md:gap-2 p-1 md:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105">
                    <img className="h-4 w-4" src={github} alt="github" />
                    <span className="text-white text-xs font-medium">GitHub</span>
                  </a>
                  <a href="https://www.linkedin.com/in/logan-kinajil-moran/" className="flex-1 flex items-center justify-center gap-1 md:gap-2 p-1 md:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105">
                    <img className="h-4 w-4" src={linkedin} alt="linkedin" />
                    <span className="text-white text-xs font-medium">LinkedIn</span>
                  </a>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-1 md:gap-2 w-full">
                  {/* <button className="text-black bg-white hover:bg-gray-100 font-semibold rounded-lg px-4 py-2 transition-all hover:scale-105 shadow-lg text-sm">
                    Download Resume
                  </button> */}
                  <button className="text-black bg-white hover:bg-gray-100 font-semibold rounded-lg px-3 md:px-4 py-1 md:py-2 transition-all hover:scale-105 shadow-lg text-xs md:text-sm"
                    onClick={handleScrollAbout}
                  >
                    Learn More
                  </button>
                  <button 
                    onClick={handleScrollGetInTouch}
                    className="text-white bg-white/20 hover:bg-white/30 font-semibold rounded-lg px-3 md:px-4 py-1 md:py-2 transition-all hover:scale-105 backdrop-blur-sm border border-white/30 text-xs md:text-sm"
                  >
                    Get in Touch
                  </button>
                </div>
              </div>

              {/* Recent Reads - Top left widget */}
              <div className="col-span-1 md:col-span-4 row-span-1 md:row-span-3">
                <RecentReads />
              </div>

              {/* Spotify Playlists - Top right widget */}
              <div className="col-span-1 md:col-span-4 row-span-1 md:row-span-3">
                <SpotifyPlaylistsAPI />
              </div>

              {/* World Clock - Bottom left widget */}
              <div className="col-span-1 md:col-span-4 row-span-1 md:row-span-3">
                <WorldClock />
              </div>

              {/* Table of Contents - Bottom right widget */}
              <div className="col-span-1 md:col-span-4 row-span-1 md:row-span-3">
                <TableOfContents isWidget={true} />
              </div>

            </div>
          </div>

          {/* Scroll Arrow */}
          <div className="hidden md:block absolute bottom-1 md:bottom-1 left-1/2 transform -translate-x-1/2">
            <a
              href="#about"
              className="flex justify-center items-center"
              onClick={handleScrollAbout}
            >
              <img className="w-5 md:w-8 opacity-70 p-2" src={arrow} alt="arrow" />
            </a>
          </div>
        </div>
        <div id="about" className="flex flex-col justify-center h-max w-full md:w-4/5 lg:w-3/5 px-6 md:px-0">
          <h1 className="text-center m-4 md:m-6 text-2xl md:text-3xl font-bold">Education</h1>
          
          {/* UC Berkeley */}
          <div className="border p-4 md:p-6 rounded-md bg-slate-50 mb-4 md:mb-6 hover:scale-105 transition-transform">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
              <div className="flex items-center gap-3">
                <img className="w-12 h-12 object-contain" src={berkeley} alt="UC Berkeley" />
                <div>
                  <h2 className="font-bold text-lg">University of California, Berkeley</h2>
                  <p className="font-sm text-gray-600">MEng, Electrical Engineering and Computer Science</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-600">Class of 2026</p>
                <p className="text-sm text-gray-500">Berkeley, California</p>
              </div>
            </div>
            <div className="pl-15">
              <p className="text-sm mb-2">• Fung Excellence Scholarship</p>
              <p className="text-sm mb-2">• Concentration in Visual Computing and Computer Graphics</p>
            </div>
          </div>

          {/* University of Rochester */}
          <div className="border p-6 rounded-md bg-slate-50 hover:scale-105 transition-transform">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
              <div className="flex items-center gap-3">
                <img className="w-12 h-12 object-contain" src={r} alt="University of Rochester" />
                <div>
                  <h2 className="font-bold text-lg">University of Rochester</h2>
                  <p className="font-sm text-gray-600">BA, Computer Science and Economics, Magna Cum Laude</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-600">Class of 2025</p>
                <p className="text-sm text-gray-500">Rochester, New York</p>
              </div>
            </div>
            <div className="pl-15">
              <p className="text-sm mb-2">• GPA 3.94</p>
               <p className="text-sm mb-2">• Phi Kappa Beta</p>
              <p className="text-sm mb-2">• Dean's Scholar, Provost's Circle Scholar</p>
              <p className="text-sm mb-2">• NCAA Varsity Athlete (Men's Soccer)</p>
              <p className="text-sm mb-2">• UAA All-Academic Recognition</p>
              <p className="text-sm mb-2">• Dean's List in every semester</p>
            </div>
          </div>
        </div>
        <div id="experience" className="flex flex-col justify-center h-max w-full md:w-4/5 lg:w-3/5 px-6 md:px-0">
          <h1 className="text-center m-4 md:m-6 text-2xl md:text-3xl font-bold">Experience</h1>
          
          {/* Electronics Engineer Intern */}
          <div className="border p-4 md:p-6 rounded-md bg-slate-50 mb-4 md:mb-6 hover:scale-105 transition-transform">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
              <div className="flex items-center gap-3">
                <img className="w-12 h-12 object-contain" src={owlLogo} alt="OWL Integrations" />
                <div>
                  <h2 className="font-bold text-lg">Electronics Engineer Intern</h2>
                  <h3 className="font-semibold text-gray-700">OWL Integrations</h3>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-600">June 2025 – Present</p>
                <p className="text-sm text-gray-500">Rochester, New York</p>
              </div>
            </div>
            <div className="pl-15">
              <p className="text-sm mb-2">• Beginning in June developing new electronics firmware for DuckLinks, and contribute to the ClusterDuck Protocol open source firmware</p>
            </div>
          </div>

          {/* Release Software Engineer */}
          <div className="border p-4 md:p-6 rounded-md bg-slate-50 mb-4 md:mb-6 hover:scale-105 transition-transform">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
              <div>
                <h2 className="font-bold text-lg">Release Software Engineer/Head of Testing</h2>
                <h3 className="font-semibold text-gray-700">CyberDyne Ventures/Independent Research</h3>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-600">July 2024 – Present</p>
                <p className="text-sm text-gray-500">US/Remote</p>
              </div>
            </div>
            <div>
              <p className="text-sm mb-2">• Collaborated with security researcher Craig Chamberlain (previously Principal Security Researcher at Elastic) to release the Skynet project at DEF CON 2024</p>
              <p className="text-sm mb-2">• Contributed to the backend using Go and Neo4j, and a React frontend integrated with Docker for demonstration</p>
            </div>
          </div>

          {/* Research Assistant */}
          <div className="border p-4 md:p-6 rounded-md bg-slate-50 mb-4 md:mb-6 hover:scale-105 transition-transform">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
              <div className="flex items-center gap-3">
                <img className="w-12 h-12 object-contain" src={r} alt="University of Rochester" />
                <div>
                  <h2 className="font-bold text-lg">Research Assistant</h2>
                  <h3 className="font-semibold text-gray-700">University of Rochester Medical Centre</h3>
                  <p className="text-sm text-gray-600">Department of Neurosurgery</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-600">March 2024 – October 2024</p>
                <p className="text-sm text-gray-500">Rochester, New York</p>
              </div>
            </div>
            <div className="pl-15">
              <p className="text-sm mb-2">• Collaborated with residents and PhD candidates in Dr. Jonathan J. Stone's lab to support neurosurgery research, enhancing team efficiency and contributing to successful project outcomes</p>
              <p className="text-sm mb-2">• Utilized computer science skills in data analysis, machine learning, and visualization using tools like PyTorch and scikit-learn to support scientific research, leading to improved data insights and successful funding applications</p>
            </div>
          </div>
        </div>
        <div id="projects" className="flex flex-col justify-center w-full md:w-4/5 lg:w-3/5 px-6 md:px-0">
          <h1 className="text-center m-4 md:m-6 text-2xl md:text-3xl font-bold">Projects</h1>
          <div className="grid grid-cols-1 h-auto md:flex md:flex-row justify-between space-x-4 border rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <div className="left-0 text-left p-4 flex flex-col justifty-between h-full">
              <h1>Project TūīNet</h1>
              <p className="flex flex-row mb-3">
                Made with: <img className="project" src={cpp} alt="c++" />
                <img className="project" src={python} alt="python" />
                <img className="project" src={rp} alt="rp" />
              </p>
              <p className="text-sm text-gray-600 mb-5">
                IoT device for detecting and identifying New Zealand native bird species using AI-powered audio recognition. Built with Raspberry Pi and OWL's ClusterDuck Protocol to monitor bird populations in remote areas, the device could be used to support wildlife conservation efforts.
              </p>
              <button
                type="button"
                className="w-3/4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
                onClick={tuinetWeb}
              >
                View Project
              </button>
            </div>
            {isDesktop && (
              <div className="w-4/5 md:w-1/2 h-auto md:flex md:items-center md:justify-center justify-items-center p-4">
                <img
                  className="w-4/5 h-auto md:h-40 md:w-auto"
                  src={tuinetScreenshot}
                  alt="tuinet"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 h-auto md:flex md:flex-row justify-between space-x-4 border rounded-md bg-slate-50 mb-10 hover:scale-105 transition-transform">
            <div className="left-0 text-left p-4 flex flex-col justifty-between h-full">
              <h1>Kite - AI Email Assistant</h1>
              <p className="flex flex-row mb-3">
                Made with: <img className="project" src={python} alt="python" />
                <img className="project" src={jsLogo} alt="javascript" />
                <img className="project" src={firebase} alt="firebase" />
              </p>
              <p className="text-sm text-gray-600 mb-5">
                AI-powered Gmail assistant that turns your inbox into a queryable database. Features natural language search, thread summarization, context-aware reply generation, and automated calendar management.
              </p>
              <button
                type="button"
                className="w-3/4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
                onClick={kiteWeb}
              >
                View Website
              </button>
            </div>
            {isDesktop && (
              <div className="w-4/5 md:w-1/2 h-auto md:flex md:items-center md:justify-center justify-items-center p-4">
                <img
                  className="w-4/5 h-auto md:h-auto md:w-auto max-h-48 object-contain"
                  src={kiteScreenshot}
                  alt="kite"
                />
              </div>
            )}
          </div>
          
          {/* More Projects Dropdown */}
          <div className="w-full mb-6">
            <button
              onClick={() => setShowMoreProjects(!showMoreProjects)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border"
            >
              <span className="text-lg font-semibold text-gray-800">More Projects</span>
              <svg 
                className={`w-5 h-5 transition-transform ${showMoreProjects ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showMoreProjects && (
              <div className="mt-4 space-y-6">
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
        </div>
            )}
        </div>
        <div id="skills" className="flex flex-col justify-center mb-10 px-6">
          <h1 className="text-center mb-6 md:mb-10 text-2xl md:text-3xl font-bold">Skills</h1>
          
          {/* Programming Languages */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">Programming Languages</h2>
            
            {/* Systems Programming */}
            <div className="mb-3 md:mb-4">
              <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                <div className="skill">
                  <img src={cLogo} alt="c" />
                  <p>C</p>
                </div>
                <div className="skill">
                  <img src={cpp} alt="c++" />
                  <p>C++</p>
                </div>
                <div className="skill">
                  <img src={rust} alt="rust" />
                  <p>Rust</p>
                </div>
                <div className="skill">
                  <img src={golang} alt="golang" />
                  <p>Go</p>
                </div>
              </div>
            </div>

            {/* High-Level Languages */}  
            <div className="mb-3 md:mb-4">
              <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                <div className="skill">
                  <img src={python} alt="python" />
                  <p>Python</p>
                </div>
                <div className="skill">
                  <img src={java} alt="java" />
                  <p>Java</p>
                </div>
                <div className="skill">
                  <img src={ruby} alt="ruby" />
                  <p>Ruby</p>
                </div>
                <div className="skill">
                  <img src={swift} alt="swift" />
                  <p>Swift</p>
                </div>
              </div>
            </div>

            {/* Scripting & Query Languages */}
            <div className="mb-3 md:mb-4">
              <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                <div className="skill">
                  <img src={php} alt="php" />
                  <p>PHP</p>
                </div>
                <div className="skill">
                  <img src={bash} alt="bash" />
                  <p>Bash</p>
                </div>
                <div className="skill">
                  <img src={sql} alt="sql" />
                  <p>SQL</p>
                </div>
              </div>
            </div>
          </div>

          {/* Databases */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">Databases</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="skill">
                <img src={mysql} alt="mysql" />
                <p>MySQL</p>
              </div>
              <div className="skill">
                <img src={mongodb} alt="mongodb" />
                <p>MongoDB</p>
              </div>
              <div className="skill">
                <img src={neo4j} alt="neo4j" />
                <p>Neo4j</p>
              </div>
              <div className="skill">
                <img src={firebase} alt="firebase" />
                <p>Firebase</p>
              </div>
            </div>
          </div>

          {/* Tools & Platforms */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">Tools & Platforms</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="skill">
                <img src={git} alt="git" />
                <p>Git</p>
              </div>
              <div className="skill">
                <img src={docker} alt="docker" />
                <p>Docker</p>
              </div>
              <div className="skill">
                <img src={linux} alt="linux" />
                <p>Linux</p>
              </div>
              <div className="skill">
                <img src={azure} alt="azure" />
                <p>Azure</p>
              </div>
              <div className="skill">
                <img src={vscode} alt="vscode" />
                <p>VS Code</p>
              </div>
              <div className="skill">
                <img src={platformio} alt="platformio" />
                <p>PlatformIO</p>
              </div>
              <div className="skill">
                <img src={rp} alt="raspberry pi" />
                <p>Raspberry Pi</p>
              </div>
              <div className="skill">
                <img src={pytorch} alt="pytorch" />
                <p>PyTorch</p>
              </div>
            </div>
          </div>

          {/* Web Technologies */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">Web Technologies</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="skill">
                <img src={jsLogo} alt="js" />
                <p>JavaScript</p>
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
                <img src={nodejs} alt="nodejs" />
                <p>Node.js</p>
              </div>
              <div className="skill">
                <img src={flask} alt="flask" />
                <p>Flask</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <div id="getInTouch" className="flex flex-col justify-center w-full mx-auto mb-2 md:mb-4">
        <h1 className="text-center mb-4 md:mb-8 text-2xl md:text-3xl font-bold px-4 md:px-0">Get in Touch</h1>
        <div className="mx-2 md:mx-auto md:max-w-2xl md:bg-slate-50 md:border md:rounded-xl p-4 md:p-8">
          <p className="mb-6 text-center text-gray-700">
            Email{" "}
            <a href="mailto:logan8@gmail.com" className="text-blue-600 hover:underline font-medium">
              logankm8@gmail.com
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
    </main>
  );
}
