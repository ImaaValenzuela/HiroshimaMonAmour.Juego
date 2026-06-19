"use client";

import React, { useState, useEffect, useRef } from "react";

// Image mapping with metadata representing key moments of the film
interface SceneInfo {
  id: number;
  imagePath: string;
  title: string;
  speaker: string;
  location: string;
  quoteFr: string;
  quoteEs: string;
}

const SCENES: SceneInfo[] = [
  {
    id: 1,
    imagePath: "/1.jpg.jpeg",
    title: "El Museo de la Memoria",
    speaker: "Elle & Lui",
    location: "Musée d'Hiroshima",
    quoteFr: "Elle: 'J'ai tout vu. Tout.' / Lui: 'Tu n'as rien vu à Hiroshima. Rien.'",
    quoteEs: "Ella: 'Lo he visto todo. Todo.' / Él: 'No has visto nada en Hiroshima. Nada.'"
  },
  {
    id: 2,
    imagePath: "/2.jpg.jpeg",
    title: "La Fusión de los Cuerpos",
    speaker: "Elle",
    location: "Hôtel",
    quoteFr: "Elle: 'Je te rencontre. Je me souviens de toi. Qui es-tu ? Tu me tues.'",
    quoteEs: "Ella: 'Te encuentro. Me acuerdo de ti. ¿Quién eres? Me destruyes.'"
  },
  {
    id: 3,
    imagePath: "/3.jpg.jpeg",
    title: "El Testimonio del Dolor",
    speaker: "Elle & Lui",
    location: "Hôpital d'Hiroshima",
    quoteFr: "Elle: 'L'hôpital d'Hiroshima, je l'ai vu.' / Lui: 'Tu n'as vu aucun hôpital à Hiroshima.'",
    quoteEs: "Ella: 'El hospital de Hiroshima, lo vi.' / Él: 'No has visto ningún hospital en Hiroshima.'"
  },
  {
    id: 4,
    imagePath: "/4.jpg.jpeg",
    title: "La Hierba de la Ceniza",
    speaker: "Elle",
    location: "Hiroshima",
    quoteFr: "Elle: 'La reconstruction de la ville est complète. Mais de la terre renaît l'herbe.'",
    quoteEs: "Ella: 'La reconstrucción de la ciudad es total. Pero de la tierra vuelve a brotar la hierba.'"
  },
  {
    id: 5,
    imagePath: "/5.webp",
    title: "La Huella de la Piel",
    speaker: "Elle & Lui",
    location: "Chambre",
    quoteFr: "Elle: 'Comme toi, je connais l'oubli.' / Lui: 'Non, tu ne connais pas l'oubli.'",
    quoteEs: "Ella: 'Como tú, yo también conozco el olvido.' / Él: 'No, tú no conoces el olvido.'"
  },
  {
    id: 6,
    imagePath: "/6.jpg.jpeg",
    title: "El Sótano del Destierro",
    speaker: "Elle",
    location: "Nevers, France",
    quoteFr: "Elle: 'À Nevers, ils m'ont tondue et jetée dans la cave. Mon amour y est mort.'",
    quoteEs: "Ella: 'En Nevers, me trasquilaron y me encerraron en el sótano. Mi amor murió allí.'"
  },
  {
    id: 7,
    imagePath: "/7.png",
    title: "La Habitación del Recuerdo",
    speaker: "Elle & Lui",
    location: "Café au bord du fleuve",
    quoteFr: "Lui: 'Pourquoi s'en vouloir de la mémoire des autres ?' / Elle: 'Pourquoi pas ?'",
    quoteEs: "Él: '¿Por qué culparse por la memoria de los demás?' / Ella: '¿Por qué no?'"
  },
  {
    id: 8,
    imagePath: "/8.png",
    title: "El Nombre es la Ciudad",
    speaker: "Lui & Elle",
    location: "Gare d'Hiroshima",
    quoteFr: "Lui: 'Hiroshima, c'est ton nom.' / Elle: 'C'est mon nom, oui. Ton nom est Nevers.'",
    quoteEs: "Él: 'Hiroshima, ese es tu nombre.' / Ella: 'Es mi nombre, sí. Tu nombre es Nevers.'"
  }
];

interface Card {
  uniqueId: number;
  sceneId: number;
  imagePath: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function Home() {
  const [gameState, setGameState] = useState<"intro" | "countdown" | "playing" | "ended">("intro");
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState<number>(0);
  const [turns, setTurns] = useState<number>(0);
  const [mismatches, setMismatches] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [subtitle, setSubtitle] = useState<{ fr: string; es: string; speaker: string }>({
    fr: "« Tu n'as rien vu à Hiroshima. Rien. »",
    es: "« No has visto nada en Hiroshima. Nada. »",
    speaker: "Lui"
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // General audio synthesizer helper using Web Audio API
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSynthSound = (type: "click" | "match" | "error" | "win" | "countdown") => {
    if (!audioEnabled) return;
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;
    
    // Resume context if suspended
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === "click") {
      // Short projector click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "countdown") {
      // Film leader beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, now);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "match") {
      // Warm nostalgic piano major chord (C Major - E - G)
      const frequencies = [261.63, 329.63, 392.00, 523.25];
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.03);
        
        gain.gain.setValueAtTime(0.15, now + index * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + index * 0.05);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.03);
        osc.stop(now + 1.0);
      });
    } else if (type === "error") {
      // Heavy low tone representing forgetting/trauma
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(90, now);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(92, now); // beating effect
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      
      // Add lowpass filter to make it warmer/muted
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(250, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } else if (type === "win") {
      // Soft ascending cinematic arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + index * 0.12);
        
        gain.gain.setValueAtTime(0.12, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2 + index * 0.1);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.12);
        osc.stop(now + 2.0);
      });
    }
  };

  // Initialize and shuffle cards
  const initializeGame = () => {
    initAudio();
    playSynthSound("click");
    
    // Create double cards
    const initialCards: Card[] = [];
    SCENES.forEach((scene) => {
      // Card A
      initialCards.push({
        uniqueId: scene.id * 2 - 1,
        sceneId: scene.id,
        imagePath: scene.imagePath,
        isFlipped: false,
        isMatched: false
      });
      // Card B
      initialCards.push({
        uniqueId: scene.id * 2,
        sceneId: scene.id,
        imagePath: scene.imagePath,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle cards
    for (let i = initialCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialCards[i], initialCards[j]] = [initialCards[j], initialCards[i]];
    }

    setCards(initialCards);
    setSelectedCards([]);
    setMatches(0);
    setTurns(0);
    setMismatches(0);
    setTime(0);
    setSubtitle({
      fr: "« Commençons à nous souvenir. Ou à oublier. »",
      es: "« Comencemos a recordar. O a olvidar. »",
      speaker: "Elle"
    });
    
    // Start countdown
    setGameState("countdown");
    setCountdownNum(3);
  };

  // Handle countdown animation
  useEffect(() => {
    if (gameState !== "countdown") return;

    playSynthSound("countdown");
    const interval = setInterval(() => {
      setCountdownNum((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setGameState("playing");
          return 3;
        }
        playSynthSound("countdown");
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Start game timer
  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Monitor win condition
  useEffect(() => {
    if (matches === SCENES.length && gameState === "playing") {
      setTimeout(() => {
        setGameState("ended");
        playSynthSound("win");
        setSubtitle({
          fr: "« Hiroshima c'est ton nom. C'est mon nom, oui. »",
          es: "« Hiroshima es tu nombre. Es mi nombre, sí. »",
          speaker: "Elle & Lui"
        });
      }, 1200);
    }
  }, [matches, gameState]);

  // Handle Card Clicking
  const handleCardClick = (index: number) => {
    if (gameState !== "playing") return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (selectedCards.length >= 2) return;

    playSynthSound("click");
    
    // Flip card
    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    const newSelection = [...selectedCards, index];
    setSelectedCards(newSelection);

    // Update subtitle based on the card's film scene quote to build atmosphere
    const scene = SCENES.find(s => s.id === cards[index].sceneId);
    if (scene) {
      setSubtitle({
        fr: `« ${scene.quoteFr.split(" / ")[0] || scene.quoteFr} »`,
        es: `« ${scene.quoteEs.split(" / ")[0] || scene.quoteEs} »`,
        speaker: scene.speaker.split(" & ")[0] || scene.speaker
      });
    }

    if (newSelection.length === 2) {
      setTurns((prev) => prev + 1);
      const [firstIdx, secondIdx] = newSelection;

      if (cards[firstIdx].sceneId === cards[secondIdx].sceneId) {
        // MATCH FOUND
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setMatches((prev) => prev + 1);
          setSelectedCards([]);
          playSynthSound("match");
          
          // Display the full matched conversation quote
          const matchedScene = SCENES.find(s => s.id === cards[firstIdx].sceneId);
          if (matchedScene) {
            setSubtitle({
              fr: matchedScene.quoteFr,
              es: matchedScene.quoteEs,
              speaker: matchedScene.speaker
            });
          }
        }, 600);
      } else {
        // MISMATCH (FORGETTING)
        setMismatches((prev) => prev + 1);
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setSelectedCards([]);
          playSynthSound("error");
          
          // Show a poetic quote about forgetting
          const forgettingQuotes = [
            { fr: "« Comme toi, je connais l'oubli. »", es: "« Como tú, conozco el olvido. »", speaker: "Elle" },
            { fr: "« Non. Tu ne connais pas l'oubli. »", es: "« No. Tú no conoces el olvido. »", speaker: "Lui" },
            { fr: "« Le temps viendra où nous ne saurons plus du tout. »", es: "« Llegará el momento en que ya no sabremos nada. »", speaker: "Lui" },
            { fr: "« J'ai l'illusion devant Hiroshima que jamais je n'oublierais. »", es: "« Tuve la ilusión ante Hiroshima de que jamás olvidaría. »", speaker: "Elle" }
          ];
          const randomQuote = forgettingQuotes[Math.floor(Math.random() * forgettingQuotes.length)];
          setSubtitle(randomQuote);
        }, 1200);
      }
    }
  };

  // Helper to format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Evaluate memory performance message based on "Forgetfulness" (olvidos)
  const getMemoryEvaluation = () => {
    if (mismatches <= 3) return {
      title: "Memoria Absoluta",
      desc: "Has vencido al olvido. Conservas cada imagen de Hiroshima grabada en tu interior de forma intacta."
    };
    if (mismatches <= 8) return {
      title: "Memoria Humana",
      desc: "Luchas entre el recuerdo y la ceniza. Recordar duele, pero olvidar es la verdadera muerte de la historia."
    };
    return {
      title: "El Olvido Inevitable",
      desc: "«De la misma manera que en el amor existe la ilusión de no olvidar jamás, así creí que nunca olvidaría Hiroshima». Has olvidado demasiado."
    };
  };

  return (
    <main className="flex-1 w-full bg-charcoal-900 flex justify-center items-center p-0 sm:p-4 z-10 relative">
      {/* Mobile viewport container */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] flex flex-col justify-between bg-cream-100 sm:rounded-3xl sm:border border-charcoal-800 shadow-2xl relative overflow-hidden select-none font-serif">
        
        {/* Intro View */}
        {gameState === "intro" && (
          <div className="flex-1 flex flex-col justify-between p-8 text-center bg-cream-100 relative z-20">
            {/* Film leader marker */}
            <div className="flex justify-between items-center text-xs tracking-widest text-hiroshima-500/60 font-typewriter uppercase">
              <span>Rell. n° 1</span>
              <span>1959</span>
              <span>N.F.</span>
            </div>

            <div className="my-auto flex flex-col items-center gap-6">
              {/* Cinematic Red Dot */}
              <div className="w-12 h-12 rounded-full bg-hiroshima-500 animate-pulse flex items-center justify-center shadow-lg shadow-hiroshima-500/20">
                <span className="text-white text-xs font-typewriter tracking-widest pl-0.5">REC</span>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-charcoal-900 uppercase">
                  Hiroshima
                </h1>
                <p className="text-lg italic text-hiroshima-500 tracking-wider font-light">
                  mon amour
                </p>
                <div className="red-line w-24 mx-auto my-2" />
                <p className="text-xs uppercase tracking-widest text-charcoal-900/60 font-typewriter mt-1">
                  Un jeu de la mémoire
                </p>
              </div>

              {/* Poetic teaser block */}
              <div className="bg-cream-200 border-y border-cream-300 py-4 px-3 max-w-xs rounded text-charcoal-900/80 space-y-3">
                <p className="text-sm leading-relaxed font-typewriter italic">
                  &quot;Me acuerdo de ti. ¿Quién eres? Me destruyes. Eres mi bien. ¿Cómo podría saber que esta ciudad estaba a la medida del amor?&quot;
                </p>
              </div>

              <p className="text-xs text-charcoal-900/70 max-w-xs leading-relaxed">
                Une experiencia interactiva inspirada en la película de <strong>Alain Resnais</strong> y <strong>Marguerite Duras</strong>. Reconstruye los fragmentos de la memoria buscando los pares del celuloide.
              </p>
            </div>

            <div className="space-y-4">
              <button
                id="start-game-btn"
                onClick={initializeGame}
                className="w-full py-4 px-6 bg-hiroshima-500 hover:bg-hiroshima-600 active:bg-hiroshima-700 text-white uppercase text-sm tracking-widest font-semibold rounded shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95"
              >
                Entrar en la memoria
              </button>
              
              <div className="text-[10px] text-charcoal-900/40 font-typewriter uppercase tracking-wider">
                Utiliza auriculares para una experiencia inmersiva
              </div>
            </div>
          </div>
        )}

        {/* Projector Countdown View */}
        {gameState === "countdown" && (
          <div className="flex-1 flex flex-col justify-center items-center bg-charcoal-900 text-cream-100 z-20 relative">
            {/* Visual film wheel grid lines */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-10 pointer-events-none">
              <div className="border-r border-b border-white"></div>
              <div className="border-l border-b border-white"></div>
              <div className="border-r border-t border-white"></div>
              <div className="border-l border-t border-white"></div>
            </div>
            
            {/* Projector light circle */}
            <div className="w-56 h-56 rounded-full border-4 border-dashed border-cream-100/30 flex items-center justify-center animate-spin duration-[10s] absolute" />
            
            <div className="w-48 h-48 rounded-full bg-cream-100 text-charcoal-900 flex items-center justify-center text-7xl font-bold font-typewriter relative shadow-2xl">
              {countdownNum}
              {/* Tick sound effect visual feedback */}
              <div className="absolute inset-0 rounded-full border border-hiroshima-500 animate-ping opacity-50" />
            </div>
            
            <div className="mt-8 text-xs tracking-widest uppercase font-typewriter text-cream-100/50 animate-pulse">
              Enfocando celuloide...
            </div>
          </div>
        )}

        {/* Main Memory Board View */}
        {gameState === "playing" && (
          <div className="flex-1 flex flex-col justify-between bg-cream-100 z-20">
            {/* Board Header */}
            <div className="p-4 bg-cream-200 border-b border-cream-300">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs uppercase tracking-widest text-hiroshima-500 font-bold">HIROSHIMA</span>
                <span className="text-[10px] uppercase tracking-widest font-typewriter text-charcoal-900/60 bg-cream-300 px-2 py-0.5 rounded">
                  ACTE II
                </span>
              </div>
              
              {/* Stats dashboard */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="bg-cream-100 p-2 rounded border border-cream-300 flex flex-col">
                  <span className="text-[10px] tracking-wider text-charcoal-900/50 uppercase font-typewriter">Memoria</span>
                  <span className="text-lg font-bold text-hiroshima-500 font-typewriter">{matches} / 8</span>
                </div>
                <div className="bg-cream-100 p-2 rounded border border-cream-300 flex flex-col">
                  <span className="text-[10px] tracking-wider text-charcoal-900/50 uppercase font-typewriter">Olvidos</span>
                  <span className="text-lg font-bold text-charcoal-900 font-typewriter">{mismatches}</span>
                </div>
                <div className="bg-cream-100 p-2 rounded border border-cream-300 flex flex-col">
                  <span className="text-[10px] tracking-wider text-charcoal-900/50 uppercase font-typewriter">Temps</span>
                  <span className="text-lg font-bold text-charcoal-900 font-typewriter">{formatTime(time)}</span>
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="p-4 my-auto flex justify-center items-center">
              <div className="grid grid-cols-4 gap-2.5 w-full max-w-sm">
                {cards.map((card, index) => (
                  <div
                    key={card.uniqueId}
                    id={`card-${index}`}
                    onClick={() => handleCardClick(index)}
                    className="card-container aspect-[3/4] cursor-pointer"
                  >
                    <div className={`card-inner h-full w-full relative ${card.isFlipped || card.isMatched ? "card-flipped" : ""}`}>
                      {/* Card Back (Design Cream with Red Circle) */}
                      <div className="card-back absolute inset-0 flex flex-col justify-between items-center p-2 border border-cream-300 rounded shadow-sm hover:shadow-md hover:border-hiroshima-500/50 transition-all duration-300">
                        {/* Film sprocket design lines */}
                        <div className="w-full flex justify-between px-1 opacity-40">
                          <div className="w-1.5 h-1.5 border border-hiroshima-500 rounded-full" />
                          <div className="w-1.5 h-1.5 border border-hiroshima-500 rounded-full" />
                        </div>
                        
                        {/* Red Circle (Hinomaru/Film core motif) */}
                        <div className="w-8 h-8 rounded-full border-2 border-hiroshima-500 flex items-center justify-center relative">
                          <div className="w-4 h-4 rounded-full bg-hiroshima-500" />
                        </div>

                        {/* Text */}
                        <span className="text-[7px] uppercase tracking-widest text-hiroshima-500 font-typewriter font-bold rotate-180 writing-mode-vertical">
                          MÉMOIRE
                        </span>
                      </div>

                      {/* Card Front (Actual Scene Image) */}
                      <div className={`card-front absolute inset-0 bg-white border rounded overflow-hidden shadow-md flex items-center justify-center ${card.isMatched ? "border-hiroshima-500" : "border-charcoal-900"}`}>
                        {/* Film Frame layout */}
                        <div className="relative w-full h-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={card.imagePath}
                            alt={`Scène ${card.sceneId}`}
                            className="w-full h-full object-cover grayscale brightness-95 contrast-105"
                          />
                          
                          {/* Match state visual overlay */}
                          {card.isMatched && (
                            <div className="absolute inset-0 bg-hiroshima-500/10 flex items-center justify-center">
                              {/* Small red ribbon tag */}
                              <div className="absolute top-0 right-0 bg-hiroshima-500 text-white text-[8px] font-typewriter px-1.5 py-0.5 uppercase tracking-widest">
                                OK
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtitle / Quote Screen */}
            <div className="px-4 py-3 bg-charcoal-900 text-cream-100 flex flex-col justify-center min-h-[96px] border-t border-hiroshima-500/40 relative">
              <span className="absolute top-1 left-2 text-[8px] uppercase tracking-wider text-hiroshima-500 font-typewriter">
                Sous-titres // {subtitle.speaker}
              </span>
              <div className="space-y-1 text-center mt-2 px-2">
                <p className="text-xs font-typewriter text-cream-200 leading-relaxed italic">
                  {subtitle.fr}
                </p>
                <p className="text-[10px] text-cream-400 font-sans tracking-wide">
                  {subtitle.es}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-3 bg-cream-200 border-t border-cream-300 flex justify-between items-center">
              <button
                id="reset-btn"
                onClick={initializeGame}
                className="py-1.5 px-3 border border-charcoal-900/20 text-charcoal-900/80 hover:bg-cream-300 text-[10px] font-typewriter uppercase tracking-widest rounded transition-colors"
              >
                Reiniciar
              </button>

              <button
                id="audio-toggle-btn"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="p-1.5 text-charcoal-900/60 hover:text-hiroshima-500 transition-colors"
                title={audioEnabled ? "Silenciar audio" : "Activar audio"}
              >
                {audioEnabled ? (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-2.5 2.27L7 9.5H3v5h4l4.5 4v-13z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM4.34 2.93L2.93 4.34 7.29 8.7H3v6.6h4.4L12 19.7v-6.6l4.69 4.69c-.69.53-1.46.95-2.3 1.23v2.03c1.38-.3 2.63-.95 3.68-1.81l2.62 2.62 1.41-1.41L4.34 2.93zM12 4.3L9.89 6.41 12 8.52V4.3z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Win / Ending Screen */}
        {gameState === "ended" && (
          <div className="flex-1 flex flex-col justify-between p-6 bg-charcoal-900 text-cream-100 z-20 relative overflow-y-auto scrollbar-thin">
            <div className="text-center py-4 space-y-1">
              <span className="text-[10px] tracking-widest font-typewriter text-hiroshima-500 uppercase">
                Générique de Fin
              </span>
              <h2 className="text-3xl font-bold uppercase tracking-wide">
                Fin del Recuerdo
              </h2>
              <div className="red-line w-16 mx-auto my-2" />
            </div>

            {/* Performance analysis */}
            <div className="bg-charcoal-800 border border-charcoal-700 p-4 rounded text-center space-y-3 my-2">
              <span className="text-xs uppercase tracking-widest text-hiroshima-400 font-typewriter">
                {getMemoryEvaluation().title}
              </span>
              <p className="text-xs text-cream-300 leading-relaxed font-sans px-2">
                {getMemoryEvaluation().desc}
              </p>
              
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-charcoal-700 text-left font-typewriter text-[11px] text-cream-400">
                <div>• Intentos totales: <span className="text-white font-bold">{turns}</span></div>
                <div>• Olvidos cometidos: <span className="text-hiroshima-400 font-bold">{mismatches}</span></div>
                <div className="col-span-2">• Tiempo transcurrido: <span className="text-white font-bold">{formatTime(time)}</span></div>
              </div>
            </div>

            {/* Matched Gallery (The Museum of Memory) */}
            <div className="space-y-2 mt-2">
              <span className="text-[9px] uppercase tracking-wider text-cream-400 font-typewriter block text-center">
                — Le Musée de la Mémoire (Escenas desbloqueadas) —
              </span>
              
              <div className="grid grid-cols-4 gap-1.5 max-h-[160px] overflow-y-auto p-1 bg-charcoal-800/50 rounded border border-charcoal-800">
                {SCENES.map((scene) => (
                  <div
                    key={scene.id}
                    className="relative aspect-video rounded overflow-hidden border border-charcoal-700 group cursor-pointer"
                    title={scene.title}
                    onClick={() => {
                      setSubtitle({
                        fr: scene.quoteFr,
                        es: scene.quoteEs,
                        speaker: scene.speaker
                      });
                      playSynthSound("click");
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={scene.imagePath}
                      alt={scene.title}
                      className="w-full h-full object-cover grayscale brightness-75 hover:brightness-100 hover:scale-110 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-center text-cream-100/40 italic font-typewriter">
                Haz clic en las miniaturas de arriba para revivir sus diálogos.
              </p>
            </div>

            {/* Active quote explorer in win screen */}
            <div className="p-3 bg-charcoal-800 rounded border-l-2 border-hiroshima-500 min-h-[72px] flex flex-col justify-center my-2">
              <span className="text-[8px] uppercase tracking-wider text-hiroshima-400 font-typewriter mb-1">
                Diálogo: {subtitle.speaker}
              </span>
              <p className="text-[11px] font-typewriter text-cream-200 italic leading-snug">
                {subtitle.fr}
              </p>
              <p className="text-[9px] text-cream-400 mt-1 leading-snug">
                {subtitle.es}
              </p>
            </div>

            {/* Restart Actions */}
            <div className="space-y-3 pt-2">
              <button
                id="restart-game-btn"
                onClick={initializeGame}
                className="w-full py-3 bg-hiroshima-500 hover:bg-hiroshima-600 active:bg-hiroshima-700 text-white uppercase text-xs tracking-widest font-semibold rounded shadow-md transition-all duration-300"
              >
                Reconstruir la memoria
              </button>
              
              <button
                id="back-intro-btn"
                onClick={() => {
                  playSynthSound("click");
                  setGameState("intro");
                }}
                className="w-full py-2 border border-cream-100/20 hover:border-cream-100/40 hover:bg-charcoal-800 text-cream-300 uppercase text-[10px] tracking-widest rounded transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
