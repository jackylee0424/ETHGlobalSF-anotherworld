import React from 'react';

import Header from '../partials/Header';
import Hero from '../partials/Hero';

function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Header />
      <main className="grow">
        <Hero />
      </main>
      <center><br/><br/><p className="text-slate-300 text-sm">Another World<br/>ETH Global Hackathon SF<br/>2022</p><br/></center>
    </div>
  );
}

export default Home;