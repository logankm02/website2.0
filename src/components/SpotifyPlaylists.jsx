import React, { useState, useEffect } from 'react';

const SpotifyPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Logan's curated playlists - no API needed!
  const yourRealPlaylists = [
    {
      id: '1',
      name: 'nz 🇳🇿',
      description: 'Music from New Zealand',
      tracks: { total: 45 },
      images: [{ url: null }], // Will get cover image later
      external_urls: { spotify: 'https://open.spotify.com/playlist/217EFGlRqIsfRCIDLsTbh3' }
    },
    {
      id: '2', 
      name: 'reggaetón 🇵🇷 y más 🇪🇸',
      description: 'Latin vibes and Spanish hits',
      tracks: { total: 120 },
      images: [{ url: null }], // Will get cover image later
      external_urls: { spotify: 'https://open.spotify.com/playlist/53dTdvacLgE7I4LTCKRXtk' }
    },
    {
      id: '3',
      name: 'hip hop & rap',
      description: 'Best of hip hop and rap',
      tracks: { total: 171 },
      images: [{ url: null }], // Will get cover image later
      external_urls: { spotify: 'https://open.spotify.com/playlist/6fM0D7wYCk3F0ca09zOPR5' }
    },
    {
      id: '4',
      name: 'afrobeats',
      description: 'African rhythms and beats',
      tracks: { total: 31 },
      images: [{ url: null }], // Will get cover image later
      external_urls: { spotify: 'https://open.spotify.com/playlist/1leRsxnuchoYZsQWgzmGWq' }
    }
  ];

  // Load playlists on component mount
  useEffect(() => {
    // Simple timeout to simulate loading (for smooth UX)
    setTimeout(() => {
      setPlaylists(yourRealPlaylists);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/20 hover:scale-105 transition-all h-full flex flex-col">
      <div className="flex items-center justify-center mb-2">
        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mr-1.5">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
        <h3 className="text-white font-semibold text-xs">Spotify Playlists</h3>
      </div>
      
      <div className="flex flex-col flex-1">
        {loading ? (
          <div className="text-center text-white/60 flex-1 flex items-center justify-center">
            <div className="animate-pulse text-xs">Loading playlists...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 flex-1">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-white/10 rounded-lg p-1.5 hover:bg-white/20 transition-all cursor-pointer group flex flex-col min-h-0"
                onClick={() => playlist.external_urls?.spotify && window.open(playlist.external_urls.spotify, '_blank')}
              >
                {/* Playlist Cover Image */}
                <div className="w-6 h-6 rounded mb-1 overflow-hidden bg-white/10 relative flex-shrink-0">
                  {playlist.images?.[0]?.url ? (
                    <img
                      src={playlist.images[0].url}
                      alt={`${playlist.name} cover`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to music icon if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center" style={{ display: playlist.images?.[0]?.url ? 'none' : 'flex' }}>
                    <svg className="w-3 h-3 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                  
                  {/* Spotify Indicator */}
                  <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-green-400 rounded-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                {/* Playlist Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium leading-tight line-clamp-1">
                    {playlist.name}
                  </p>
                  <p className="text-white/60 text-xs">
                    {playlist.tracks?.total || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyPlaylists;