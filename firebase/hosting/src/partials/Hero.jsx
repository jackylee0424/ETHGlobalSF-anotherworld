import React from 'react';
import Illustration from '../images/hero-illustration.svg';

function Hero() {
  return (
    <section className="relative">
      {/* Illustration */}
      <div className="md:block absolute left-1/2 -translate-x-1/2 pointer-events-none -z-10" aria-hidden="true">
        <img src={Illustration} className="max-w-none" width="1440" height="1265" alt="Hero Illustration" />
      </div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 md:pt-20">
          {/* Hero content */}
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="h1 font-bangers mb-6" data-aos="fade-up">
              Another World
            </h1>
            <p className="text-md mb-6" data-aos="fade-up">
            A "Ready Player One"-like FPS game<br/>Built with ENS, Apecoin, Polygon, Optimism, IPFS, and Unreal Engine.
            </p>
            <p className="text-xs text-slate-200 mb-5 text-center" data-aos="fade-up" data-aos-delay="300">
            <a href="https://testnets.opensea.io/assets/goerli/0xbdd4d9846734c090defdfbf234fa993792e73916/0"> Treasure Vault via OpenSea (Testnet)</a>
            </p>
            <center>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/xCouMKrQI84?controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </center>
          </div>
          
          <div className="pt-8  mr-6 mt-0" data-aos="fade-up" data-aos-delay="900">
            
            <p className="text-slate-300 text-xs text-center">TEAM<br/><a href="https://twitter.com/JackieLeeETH">jackie.eth</a>, <a href="https://twitter.com/skullapes">skvll.eth</a>, Tibet, and Gokey</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
