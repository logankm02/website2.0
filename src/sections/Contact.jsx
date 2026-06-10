import { profile } from "../data/profile";

export default function Contact() {
  const { github, linkedin } = profile.socials;

  return (
    <div id="getInTouch" className="flex flex-col items-center w-full px-6 md:px-0 mb-16 mt-2">
      <h1 className="text-center mb-8 text-2xl md:text-3xl font-bold">Get in Touch</h1>

      <div className="w-full md:w-11/12 lg:w-4/5 card-light p-6 md:p-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Let&apos;s connect</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Feel free to get in touch with me! The best way is by email.
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-full border border-gray-200 shadow-sm transition-all hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm transition-all"
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
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm transition-all"
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
