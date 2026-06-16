import { education } from "../data/education";
import { experience } from "../data/experience";
import { spotlightProjects } from "../data/projects";
import { skillCategories } from "../data/skills";
import { profile } from "../data/profile";
import { PANEL_TITLES } from "./dialogues";

// GBA-menu-styled overlay rendering a resume section. One component on
// purpose: the panel switches content by id.
export default function SectionPanel({ id, onClose }) {
  return (
    <div className="pv-panel-backdrop" onClick={onClose}>
      <div className="pv-panel" onClick={(e) => e.stopPropagation()}>
        <div className="pv-panel-title">
          <span>{PANEL_TITLES[id]}</span>
          <button className="pv-panel-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="pv-panel-body">{renderSection(id)}</div>
        <div className="pv-panel-hint">X / ESC to close</div>
      </div>
    </div>
  );
}

function renderSection(id) {
  switch (id) {
    case "education":
      return education.map((e) => (
        <div key={e.school} className="pv-entry">
          <div className="pv-entry-head">
            <span className="pv-entry-title">{e.school}</span>
            <span className="pv-entry-meta">{e.meta}</span>
          </div>
          <p className="pv-entry-sub">{e.degree}</p>
          <ul>
            {e.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      ));

    case "experience":
      return experience.map((e) => (
        <div key={`${e.role}-${e.company}`} className="pv-entry">
          <div className="pv-entry-head">
            <span className="pv-entry-title">{e.role}</span>
            <span className="pv-entry-meta">{e.dates}</span>
          </div>
          <p className="pv-entry-sub">
            {e.company}
            {e.department ? ` · ${e.department}` : ""} · {e.location}
          </p>
          <ul>
            {e.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      ));

    case "projects":
      return spotlightProjects.map((p) => (
        <div key={p.id} className="pv-entry">
          <div className="pv-entry-head">
            <span className="pv-entry-title">{p.title}</span>
            <span className="pv-entry-meta">{p.tech.join(" · ")}</span>
          </div>
          <p>{p.description}</p>
          <div className="pv-links">
            <a href={p.href} target="_blank" rel="noreferrer">
              ▶ {p.cta}
            </a>
            {p.githubHref && (
              <a href={p.githubHref} target="_blank" rel="noreferrer">
                ▶ GitHub
              </a>
            )}
          </div>
        </div>
      ));

    case "skills":
      return skillCategories.map((cat) => (
        <div key={cat.title} className="pv-entry">
          <div className="pv-entry-head">
            <span className="pv-entry-title">{cat.title}</span>
          </div>
          <div className="pv-skills">
            {cat.skills.map((s) => (
              <span key={s.name} className="pv-skill">
                <img src={s.icon} alt="" />
                {s.name}
              </span>
            ))}
          </div>
        </div>
      ));

    case "contact":
      return (
        <div className="pv-entry">
          <p>The best way to reach LOGAN is by email.</p>
          <div className="pv-links pv-links-col">
            <a href={`mailto:${profile.email}`}>▶ {profile.email}</a>
            <a href={profile.socials.github.url} target="_blank" rel="noreferrer">
              ▶ GitHub · {profile.socials.github.handle}
            </a>
            <a href={profile.socials.linkedin.url} target="_blank" rel="noreferrer">
              ▶ LinkedIn · {profile.socials.linkedin.handle}
            </a>
          </div>
        </div>
      );

    default:
      return null;
  }
}
