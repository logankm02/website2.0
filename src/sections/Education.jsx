import SectionHeading from "../components/SectionHeading";
import { education } from "../data/education";

export default function Education() {
  return (
    <div id="about" className="flex flex-col justify-center h-max w-full md:w-11/12 lg:w-4/5 px-6 md:px-0">
      <SectionHeading index="01" title="Education" />

      <div className="flex flex-col md:flex-row gap-4">
        {education.map((entry) => (
          <div key={entry.school} className="flex-1 card-light card-light-interactive p-4 md:p-6">
            <div className="flex items-center gap-4 mb-0 md:mb-4">
              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-white border border-gray-100 p-1.5 flex-shrink-0">
                <img className="h-full w-full object-contain" src={entry.logo} alt={entry.school} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{entry.degree}</p>
                <p className="text-sm text-gray-500">{entry.meta}</p>
              </div>
            </div>
            <div className="hidden md:block">
              {entry.highlights.map((highlight) => (
                <p key={highlight} className="text-sm mb-2">
                  • {highlight}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
