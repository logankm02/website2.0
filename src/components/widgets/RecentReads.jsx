import WidgetHeader from "../WidgetHeader";
import { books } from "../../data/books";

function BookIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}

export default function RecentReads() {
  return (
    <div className="relative card-glass p-3 transition-all h-full overflow-hidden">
      <div className="widget-gradient" />
      <div className="relative z-10 h-full flex flex-col">
        <WidgetHeader icon={<BookIcon className="w-3 h-3 text-white" />} title="Current & Recent Reads" />

        <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
          {books.map((book) => (
            <div
              key={book.title}
              className="group border border-white/10 rounded-xl overflow-hidden bg-white/5 flex flex-col"
            >
              <div className="relative h-full overflow-hidden bg-black">
                <img
                  src={book.cover}
                  alt={`${book.title} cover`}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = "flex";
                    }
                  }}
                />
                <div className="absolute inset-0 hidden items-center justify-center bg-white/10">
                  <BookIcon className="w-6 h-6 text-white/40" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    {book.current && (
                      <span className="w-1.5 h-1.5 flex-shrink-0 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    )}
                    <p className="text-white text-xs font-semibold leading-tight line-clamp-1">
                      {book.title}
                    </p>
                  </div>
                  <p className="text-white/70 text-[11px] leading-tight">{book.author}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
