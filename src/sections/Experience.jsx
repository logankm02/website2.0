import GitHubIcon from "../components/GitHubIcon";
import { experience } from "../data/experience";

export default function Experience() {
  return (
    <div id="experience" className="flex flex-col justify-center h-max w-full md:w-11/12 lg:w-4/5 px-6 md:px-0">
      <h1 className="text-center m-4 md:m-6 text-2xl md:text-3xl font-bold">Experience</h1>

      {experience.map((entry) => (
        <div key={`${entry.role}-${entry.company}`} className="card-light p-4 md:p-6 mb-4 md:mb-6 transition-all">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-0 md:mb-4 gap-3 md:gap-0">
            <div className="flex items-center gap-3">
              <img className="w-20 h-20 object-contain" src={entry.logo} alt={entry.company} />
              <div>
                <h2 className="font-bold text-lg">{entry.role}</h2>
                <h3 className="font-semibold text-gray-700">{entry.company}</h3>
                {entry.department && <p className="text-sm text-gray-600">{entry.department}</p>}
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-gray-600">{entry.dates}</p>
              <p className="text-sm text-gray-500">{entry.location}</p>
            </div>
          </div>
          <div className="hidden md:block pl-15 max-w-2xl">
            {entry.bullets.map((bullet) => (
              <p key={bullet} className="text-sm mb-2">
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
  );
}
