import SectionHeading from "../components/SectionHeading";
import { profile } from "../data/profile";

export default function Contact() {
  const { github, linkedin } = profile.socials;

  return (
    <div id="getInTouch" className="flex flex-col w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 mb-16 mt-2">
      <SectionHeading index="05" title="Get in touch" />

      <div className="relative w-full card-light p-6 md:p-10 overflow-hidden">
        <div
          className="hidden md:block absolute -right-16 -top-16 w-72 h-72 rounded-full bg-sky-100/70 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          <div className="md:max-w-md">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Let&apos;s connect</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              Feel free to get in touch with me! The best way is by email.
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm md:text-base font-semibold px-6 py-3.5 rounded-full shadow-sm transition-all hover:shadow-md"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {profile.email}
            </a>
          </div>

          <div className="hidden md:block w-px bg-gray-200 self-stretch" />
          <div className="block md:hidden h-px w-full bg-gray-200" />

          <div className="flex flex-col gap-3 min-w-[200px]">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Also find me on
            </p>
            <a
              href={linkedin.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200"
            >
              <img className="w-5 h-5 object-contain" src="/images/linkedin-blue.png" alt="LinkedIn" />
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-none mb-0.5">LinkedIn</p>
                <p className="text-xs text-gray-400">{linkedin.handle}</p>
              </div>
            </a>
            <a
              href={github.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200"
            >
              <img className="w-5 h-5 object-contain" src="/images/github-black.svg" alt="GitHub" />
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-none mb-0.5">GitHub</p>
                <p className="text-xs text-gray-400">{github.handle}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
