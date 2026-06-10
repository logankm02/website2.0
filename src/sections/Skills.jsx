import { skillCategories } from "../data/skills";

export default function Skills() {
  return (
    <div id="skills" className="flex flex-col justify-center w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 mb-10">
      <h1 className="text-center m-4 md:m-6 text-2xl md:text-3xl font-bold">Skills</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skillCategories.map((category) => (
          <div
            key={category.title}
            className={`card-light p-5 ${category.fullWidth ? "md:col-span-2" : ""}`}
          >
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {category.title}
            </h2>
            <div className="flex flex-wrap gap-3">
              {category.skills.map((skill) => (
                <div key={skill.name} className="skill">
                  <img src={skill.icon} alt={skill.name} />
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
