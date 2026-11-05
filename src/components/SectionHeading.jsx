// Shared heading for portfolio sections: a small tracked index label over a
// display-weight title, left-aligned to the section's content column. Keeps
// Education/Experience/Projects/Skills/Contact reading as one system instead
// of each rolling its own centered <h1>.
export default function SectionHeading({ index, title }) {
  return (
    <div className="mb-6 md:mb-8">
      <span className="block text-xs font-semibold tracking-[0.25em] text-sky-600 mb-2">
        {index}
      </span>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
    </div>
  );
}
