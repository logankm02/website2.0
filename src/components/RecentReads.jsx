import React, { useState, useEffect } from 'react';

const RecentReads = () => {
  const [currentRead, setCurrentRead] = useState(null);
  const [recentBooks, setRecentBooks] = useState([]);

  useEffect(() => {
    // Logan's recent reads - classic and sci-fi literature
    const recentReads = [
      {
        id: 1,
        title: "Letters from a Stoic",
        author: "Seneca",
        cover: "/images/seneca.jpg"
      },
      {
        id: 2,
        title: "Dune Messiah",
        author: "Frank Herbert",
        cover: "/images/dune-messiah.jpeg"
      },
      {
        id: 3,
        title: "Dune",
        author: "Frank Herbert",
        cover: "/images/dune.jpg"
      },
      {
        id: 4,
        title: "The Fellowship of the Ring",
        author: "J.R.R. Tolkien",
        cover: "/images/fellowship.jpg"
      }
    ];

    setRecentBooks(recentReads);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/20 hover:scale-105 transition-all h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-center mb-2">
        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mr-1.5">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-xs">Current and Recent Reads</h3>
      </div>

      {/* 2x2 Grid of Book Tiles */}
      <div className="grid grid-cols-2 gap-1 flex-1 min-h-0">
        {recentBooks.map((book) => (
          <div
            key={book.id}
            className="bg-white/10 rounded-lg p-1 border border-white/10 hover:scale-105 transition-all cursor-pointer group relative overflow-hidden flex flex-col min-h-0"
          >
            {/* Book Cover - Takes up most of the space */}
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-md mb-1">
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={`${book.title} cover`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-full h-full flex items-center justify-center" 
                style={{ display: book.cover ? 'none' : 'flex' }}
              >
                <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>

            {/* Book Info - Compact at bottom */}
            <div className="text-center flex-shrink-0">
              <p className="text-white text-xs font-medium leading-tight line-clamp-1">
                {book.title}
              </p>
              <p className="text-white/60 text-xs truncate">
                {book.author}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentReads;