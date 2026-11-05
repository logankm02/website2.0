import GitHubIcon from "../components/GitHubIcon";
import SectionHeading from "../components/SectionHeading";
import { experience } from "../data/experience";

// A connected vertical timeline instead of a stack of identical boxed cards:
// entries share one continuous rail, so the date/location label sits as a
// compact line above the copy rather than floating in a mostly-empty column.
export default function Experience() {
  return (
    <div id="experience" className="flex flex-col justify-center h-max w-full md:w-11/12 lg:w-4/5 px-6 md:px-0">
      <SectionHeading index="02" title="Experience" />

      <div className="relative pl-7 md:pl-9">
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gray-200" aria-hidden="true" />

        {experience.map((entry) => (
          <div key={`${entry.role}-${entry.company}`} className="relative pb-10 md:pb-12 last:pb-0">
            <span
              className="absolute -left-7 md:-left-9 top-1.5 w-[11px] h-[11px] rounded-full bg-white border-2 border-sky-600"
              aria-hidden="true"
            />

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-6">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 md:h-12 md:w-12 flex items-center justify-center rounded-lg bg-white border border-gray-100 p-1.5 flex-shrink-0">
                  <img className="h-full w-full object-contain" src={entry.logo} alt={entry.company} />
                </div>
                <div>
                  <h2 className="font-bold text-base md:text-lg text-gray-900">{entry.role}</h2>
                  <h3 className="font-semibold text-gray-600 text-sm md:text-base">{entry.company}</h3>
                  {entry.department && <p className="text-xs md:text-sm text-gray-500">{entry.department}</p>}
                </div>
              </div>
              <p className="text-xs md:text-sm text-gray-400 md:text-right md:pt-1 md:whitespace-nowrap">
                {entry.dates} · {entry.location}
              </p>
            </div>

            <div className="hidden md:block mt-3 max-w-2xl">
              {entry.bullets.map((bullet) => (
                <p key={bullet} className="text-sm text-gray-600 leading-relaxed mb-2">
                  • {bullet}
                </p>
              ))}
              {entry.githubUrl && (
                <a
                  href={entry.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-full shadow-sm transition-colors mt-1"
                >
                  <GitHubIcon className="w-3.5 h-3.5" />
                  View on GitHub
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
