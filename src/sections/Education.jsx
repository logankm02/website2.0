import { education } from "../data/education";

export default function Education() {
  return (
    <div id="about" className="flex flex-col justify-center h-max w-full md:w-11/12 lg:w-4/5 px-6 md:px-0">
      <h1 className="text-center m-4 md:m-6 text-2xl md:text-3xl font-bold">Education</h1>

      <div className="flex flex-col md:flex-row gap-4">
        {education.map((entry) => (
          <div key={entry.school} className="flex-1 card-light p-4 md:p-6 transition-all">
            <div className="flex items-center gap-4 mb-0 md:mb-4">
              <img className="h-10 w-auto object-contain flex-shrink-0" src={entry.logo} alt={entry.school} />
              <div>
                <p className="text-sm text-gray-600">{entry.degree}</p>
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
