import React from 'react';

function Header() {
  return (
    <header className="absolute w-full z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="shrink-0 mr-4">
          </div>
          <nav className="flex grow">
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
