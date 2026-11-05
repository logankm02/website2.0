import SectionHeading from "../components/SectionHeading";
import { skillCategories } from "../data/skills";

export default function Skills() {
  return (
    <div id="skills" className="flex flex-col justify-center w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 mb-10">
      <SectionHeading index="04" title="Skills" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skillCategories.map((category) => (
          <div
            key={category.title}
            className={`card-light p-5 ${category.fullWidth ? "md:col-span-2" : ""}`}
          >
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {category.title}
            </h2>
            <div className="flex flex-wrap gap-x-3 gap-y-4">
              {category.skills.map((skill) => (
                <div key={skill.name} className="skill">
                  <div className="skill-icon">
                    <img src={skill.icon} alt={skill.name} />
                  </div>
                  <p>{skill.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
