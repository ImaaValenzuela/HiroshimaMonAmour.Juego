"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// Image metadata representing the 8 scenes from the film
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
    title: "El Museo de Hiroshima",
    speaker: "Elle",
    location: "Musée d'Hiroshima",
    quoteFr: "Elle: 'Les reconstructions faites avec la plus grande précision possible...'",
    quoteEs: "Ella: 'Las reconstrucciones hechas con la mayor precisión posible...'"
  },
  {
    id: 2,
    imagePath: "/2.jpg.jpeg",
    title: "La Ceniza y los Cuerpos",
    speaker: "Elle",
    location: "Hôtel",
    quoteFr: "Elle: 'Je me souviens. Vi les cicatrices de fer, de terre, de feu...'",
    quoteEs: "Ella: 'Me acuerdo. Vi las cicatrices de hierro, de tierra, de fuego...'"
  },
  {
    id: 3,
    imagePath: "/3.jpg.jpeg",
    title: "El Hospital de Hiroshima",
    speaker: "Elle",
    location: "Hôpital d'Hiroshima",
    quoteFr: "Elle: 'L'hôpital d'Hiroshima, je l'ai vu. Comment l'éviter ?'",
    quoteEs: "Ella: 'El hospital de Hiroshima, lo vi. ¿Cómo evitarlo?'"
  },
  {
    id: 4,
    imagePath: "/4.jpg.jpeg",
    title: "La Hierba de la Ceniza",
    speaker: "Elle",
    location: "Hiroshima",
    quoteFr: "Elle: 'La reconstruction de la ville est complète. De la cendre renaît l'herbe.'",
    quoteEs: "Ella: 'La reconstrucción de la ciudad es total. De la ceniza vuelve a brotar la hierba.'"
  },
  {
    id: 5,
    imagePath: "/5.webp",
    title: "La Huella de la Piel",
    speaker: "Elle",
    location: "Chambre",
    quoteFr: "Elle: 'Comme toi, je connais l'oubli. L'oubli de ton amour.'",
    quoteEs: "Ella: 'Como tú, yo también conozco el olvido. El olvido de tu amor.'"
  },
  {
    id: 6,
    imagePath: "/6.jpg.jpeg",
    title: "El Sótano de Nevers",
    speaker: "Elle",
    location: "Nevers, France",
    quoteFr: "Elle: 'À Nevers, ils m'ont tondue et jetée dans la cave. Mon premier amour y est mort.'",
    quoteEs: "Ella: 'En Nevers, me trasquilaron y me encerraron en el sótano. Mi primer amor murió allí.'"
  },
  {
    id: 7,
    imagePath: "/7.png",
    title: "La Habitación del Recuerdo",
    speaker: "Elle",
    location: "Hôtel à Hiroshima",
    quoteFr: "Elle: 'Te rencontre. Je me souviens de toi. Qui es-tu ? Tu me tues. Tu me fais du bien.'",
    quoteEs: "Ella: 'Te encuentro. Me acuerdo de ti. ¿Quién eres? Me destruyes. Eres mi bien.'"
  },
  {
    id: 8,
    imagePath: "/8.png",
    title: "El Nombre es la Ciudad",
    speaker: "Lui",
    location: "Gare d'Hiroshima",
    quoteFr: "Lui: 'Ton nom à toi est Nevers. Nevers en France. Et le mien est Hiroshima.'",
    quoteEs: "Él: 'Tu nombre es Nevers. Nevers en Francia. Y el mío es Hiroshima.'"
  }
];

// Unified Match Themes for pairs (1-2, 3-4, 5-6, 7-8)
interface MatchTheme {
  pairId: number;
  title: string;
  speaker: string;
  quoteFr: string;
  quoteEs: string;
  desc: string;
}

const MATCH_THEMES: MatchTheme[] = [
  {
    pairId: 1, // 1 & 2
    title: "Le Musée et la Cendre",
    speaker: "Elle & Lui",
    quoteFr: "Elle: 'J'ai tout vu. Tout.' / Lui: 'Tu n'as rien vu à Hiroshima. Rien.'",
    quoteEs: "Ella: 'Lo he visto todo. Todo.' / Él: 'No has visto nada en Hiroshima. Nada.'",
    desc: "La contradicción entre la memoria oficial del museo y la intimidad corporal cubierta de ceniza."
  },
  {
    pairId: 2, // 3 & 4
    title: "La Maladie et la Renaissance",
    speaker: "Elle & Lui",
    quoteFr: "Elle: 'L'hôpital d'Hiroshima, je l'ai vu.' / Lui: 'Tu n'as vu aucun hôpital à Hiroshima.'",
    quoteEs: "Ella: 'El hospital de Hiroshima, lo vi.' / Él: 'No has visto ningún hospital en Hiroshima.'",
    desc: "El dolor insalvable de las quemaduras atómicas frente a la inevitable regeneración urbana."
  },
  {
    pairId: 3, // 5 & 6
    title: "L'Oubli et Nevers",
    speaker: "Elle & Lui",
    quoteFr: "Elle: 'Comme toi, je connais l'oubli.' / Lui: 'Non. Tu ne connais pas l'oubli.'",
    quoteEs: "Ella: 'Como tú, conozco el olvido.' / Él: 'No. Tú no conoces el olvido.'",
    desc: "El tacto en Hiroshima evoca la reclusión secreta en el sótano de Nevers tras perder a su primer amor."
  },
  {
    pairId: 4, // 7 & 8
    title: "La Nomination Finale",
    speaker: "Lui & Elle",
    quoteFr: "Lui: 'Hiroshima, c'est ton nom.' / Elle: 'C'est mon nom, oui. Ton nom est Nevers.'",
    quoteEs: "Él: 'Hiroshima, ese es tu nombre.' / Ella: 'Es mi nombre, sí. Tu nombre es Nevers.'",
    desc: "La disolución de los amantes en los lugares que representan sus heridas históricas."
  }
];

interface Card {
  uniqueId: number; // 1 to 8
  sceneId: number;  // 1 to 8 (corresponds to scene image index)
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
  
  // Active projection in the cinema screen
  const [activeImagePath, setActiveImagePath] = useState<string>("/1.jpg.jpeg");
  const [subtitle, setSubtitle] = useState<{ fr: string; es: string; speaker: string }>({
    fr: "« Tu n'as rien vu à Hiroshima. Rien. »",
    es: "« No has visto nada en Hiroshima. Nada. »",
    speaker: "Lui"
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context helper
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
  }, []);

  // Web Audio Synthesizer
  const playSynthSound = useCallback((type: "click" | "match" | "error" | "win" | "countdown") => {
    if (!audioEnabled) return;
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === "click") {
      // Film reel click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.07);
      
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.07);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === "countdown") {
      // Retro sine beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(950, now);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.12);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "match") {
      // major seventh piano chord representing union
      const notes = [261.63, 329.63, 392.00, 493.88]; // Cmaj7
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.04);
        
        gain.gain.setValueAtTime(0.12, now + index * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9 + index * 0.04);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.04);
        osc.stop(now + 1.2);
      });
    } else if (type === "error") {
      // low tone representing forgetfulness/separation
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(80, now);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(81.5, now);
      
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.45);
      
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(200, now);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } else if (type === "win") {
      // cinematic ascending cascade
      const scale = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      scale.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + index * 0.1);
        
        gain.gain.setValueAtTime(0.1, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0 + index * 0.08);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.1);
        osc.stop(now + 1.8);
      });
    }
  }, [audioEnabled, initAudio]);

  // Check if two IDs form a matching pair (1-2, 3-4, 5-6, 7-8)
  const isPairMatch = (id1: number, id2: number) => {
    if ((id1 === 1 && id2 === 2) || (id1 === 2 && id2 === 1)) return true;
    if ((id1 === 3 && id2 === 4) || (id1 === 4 && id2 === 3)) return true;
    if ((id1 === 5 && id2 === 6) || (id1 === 6 && id2 === 5)) return true;
    if ((id1 === 7 && id2 === 8) || (id1 === 8 && id2 === 7)) return true;
    return false;
  };

  // Find MatchTheme by card IDs
  const getMatchTheme = (id1: number, id2: number) => {
    if ((id1 === 1 && id2 === 2) || (id1 === 2 && id2 === 1)) return MATCH_THEMES[0];
    if ((id1 === 3 && id2 === 4) || (id1 === 4 && id2 === 3)) return MATCH_THEMES[1];
    if ((id1 === 5 && id2 === 6) || (id1 === 6 && id2 === 5)) return MATCH_THEMES[2];
    if ((id1 === 7 && id2 === 8) || (id1 === 8 && id2 === 7)) return MATCH_THEMES[3];
    return null;
  };

  // Start/Initialize game
  const initializeGame = () => {
    initAudio();
    playSynthSound("click");
    
    // Create exactly 8 cards representing the 8 images (1 of each)
    const initialCards: Card[] = SCENES.map((scene) => ({
      uniqueId: scene.id,
      sceneId: scene.id,
      imagePath: scene.imagePath,
      isFlipped: false,
      isMatched: false
    }));

    // Shuffle the 8 cards
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
    setActiveImagePath("/1.jpg.jpeg");
    setSubtitle({
      fr: "« Commençons la recherche des paires oubliées. »",
      es: "« Comencemos la búsqueda de los pares olvidados. »",
      speaker: "Elle"
    });
    
    setGameState("countdown");
    setCountdownNum(3);
  };

  // Countdown timer effect
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
  }, [gameState, playSynthSound]);

  // Game timer effect
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

  // Monitor win condition (4 pairs total)
  useEffect(() => {
    if (matches === 4 && gameState === "playing") {
      setTimeout(() => {
        setGameState("ended");
        playSynthSound("win");
        setSubtitle({
          fr: "« Tu m'as tuée. Tu me faisais du bien. Hiroshima c'est ton nom. »",
          es: "« Me destruiste. Me hacías bien. Hiroshima es tu nombre. »",
          speaker: "Elle & Lui"
        });
      }, 1200);
    }
  }, [matches, gameState, playSynthSound]);

  // Card Click Interaction
  const handleCardClick = (index: number) => {
    if (gameState !== "playing") return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (selectedCards.length >= 2) return;

    playSynthSound("click");

    // Flip card
    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    // Project card scene image to screen immediately
    const scene = SCENES.find(s => s.id === cards[index].sceneId);
    if (scene) {
      setActiveImagePath(scene.imagePath);
      setSubtitle({
        fr: scene.quoteFr,
        es: scene.quoteEs,
        speaker: scene.speaker
      });
    }

    const newSelection = [...selectedCards, index];
    setSelectedCards(newSelection);

    if (newSelection.length === 2) {
      setTurns((prev) => prev + 1);
      const [firstIdx, secondIdx] = newSelection;
      const id1 = cards[firstIdx].sceneId;
      const id2 = cards[secondIdx].sceneId;

      if (isPairMatch(id1, id2)) {
        // MATCH DETECTED (e.g. 1 & 2, 3 & 4...)
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setMatches((prev) => prev + 1);
          setSelectedCards([]);
          playSynthSound("match");

          // Display the match narrative on the screen
          const theme = getMatchTheme(id1, id2);
          if (theme) {
            setSubtitle({
              fr: theme.quoteFr,
              es: theme.quoteEs,
              speaker: theme.speaker
            });
          }
        }, 600);
      } else {
        // MISMATCH (Forgetfulness error)
        setMismatches((prev) => prev + 1);
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setSelectedCards([]);
          playSynthSound("error");

          // Show a poetic text about forgetting
          const errorQuotes = [
            { fr: "« De même que dans l'amour cette illusion existe, celle de ne jamais oublier... »", es: "« Al igual que en el amor existe esa ilusión, la de nunca poder olvidar... »", speaker: "Elle" },
            { fr: "« Comme toi, je connais l'oubli. / Non, tu ne connais pas l'oubli. »", es: "« Como tú, conozco el olvido. / No, tú no conoces el olvido. »", speaker: "Elle & Lui" },
            { fr: "« Le temps s'en viendra où nous ne saurons plus du tout ce qui nous unit. »", es: "« Llegará el momento en que ya no sepamos qué es lo que nos une. »", speaker: "Lui" },
            { fr: "« Pourquoi refuser le besoin d'oublier ? »", es: "« ¿Por qué rechazar la necesidad de olvidar? »", speaker: "Elle" }
          ];
          const randomQuote = errorQuotes[Math.floor(Math.random() * errorQuotes.length)];
          setSubtitle(randomQuote);
        }, 1200);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getMemoryEvaluation = () => {
    if (mismatches <= 1) return {
      title: "Mémoire Absolue (Ceniza Inmortal)",
      desc: "Has vencido al olvido de inmediato. Cada imagen y fragmento de celuloide permanece perfectamente fijado en tu historia."
    };
    if (mismatches <= 4) return {
      title: "L'Ombre de la Mémoire (Lucha y Olvido)",
      desc: "Recordar requiere esfuerzo. Tu memoria titubea ante las cenizas de Hiroshima y Nevers, pero lograste entrelazarlas."
    };
    return {
      title: "L'Oubli Total (Borrón del Tiempo)",
      desc: "«El tiempo vendrá en que ya no sepamos qué es lo que nos une». Has cometido demasiados olvidos en el camino."
    };
  };

  return (
    <main className="flex-1 w-full bg-charcoal-900 flex justify-center items-center p-0 z-10 relative md:h-screen md:w-screen md:overflow-hidden">
      {/* Cinematic Viewport Container (Responsive split layout) */}
      <div className="w-full min-h-screen md:min-h-0 md:h-screen md:w-screen bg-cream-50 relative overflow-hidden flex flex-col md:flex-row font-serif">
        
        {/* LEFT PANEL: Cinema Projector Screen (65% width on Desktop, Top on Mobile) */}
        <div className="w-full md:w-[65%] bg-charcoal-900 border-b md:border-b-0 md:border-r border-charcoal-800 flex flex-col justify-between p-4 sm:p-6 md:p-8 min-h-[350px] md:min-h-0 md:h-full relative z-20">
          {/* Cinema Header */}
          <div className="flex justify-between items-center text-xs tracking-widest text-hiroshima-500 font-typewriter uppercase">
            <span>Projection</span>
            <span className="animate-pulse">● PLAYING</span>
          </div>

          {/* Projector screen display */}
          <div className="my-auto flex flex-col items-center justify-center py-4 md:py-6">
            {gameState === "intro" && (
              <div className="text-center py-6 px-4 space-y-4 max-w-md">
                <div className="w-12 h-12 rounded-full bg-hiroshima-500 mx-auto animate-pulse flex items-center justify-center">
                  <span className="text-white text-xs font-typewriter tracking-widest pl-0.5">REC</span>
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase">HIROSHIMA</h1>
                  <p className="text-lg md:text-xl italic text-hiroshima-400 tracking-wider">mon amour</p>
                  <div className="red-line w-24 mx-auto my-3" />
                  <p className="text-xs md:text-sm uppercase tracking-widest text-cream-300/60 font-typewriter">Un jeu de la mémoire et de l&apos;oubli</p>
                </div>
                <p className="text-sm md:text-base text-cream-200/80 leading-relaxed font-sans">
                  Una experiencia de memoria no-idéntica. Empareja los fragmentos correspondientes: el museo y la ceniza (1-2), la enfermedad y la hierba (3-4), el amor y el sótano (5-6), los nombres de las heridas (7-8).
                </p>
              </div>
            )}

            {gameState === "countdown" && (
              <div className="relative w-40 h-40 rounded-full bg-cream-100 text-charcoal-900 flex items-center justify-center text-6xl font-bold font-typewriter shadow-inner">
                {countdownNum}
                <div className="absolute inset-0 rounded-full border-2 border-hiroshima-500 animate-ping opacity-60" />
              </div>
            )}

            {(gameState === "playing" || gameState === "ended") && (
              <div className="w-full max-w-2xl md:max-w-4xl aspect-[16/10] md:max-h-[52vh] bg-black border border-charcoal-800 rounded relative overflow-hidden group shadow-lg transition-all duration-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImagePath}
                  alt="Proyección Celuloide"
                  className="w-full h-full object-cover grayscale brightness-90 contrast-110 transition-transform duration-700"
                />
                
                {/* Red flash effect on matches */}
                {gameState === "ended" && (
                  <div className="absolute inset-0 bg-hiroshima-500/10 border-2 border-hiroshima-500 animate-pulse" />
                )}
                
                <div className="absolute bottom-1 right-2 text-[8px] bg-charcoal-900/80 px-2 py-0.5 rounded text-cream-300 font-typewriter tracking-widest">
                  {SCENES.find(s => s.imagePath === activeImagePath)?.location.toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Subtitles Cinema Box */}
          <div className="bg-black/90 border border-charcoal-800 p-4 md:p-6 rounded min-h-[110px] md:min-h-[140px] flex flex-col justify-center relative">
            <span className="absolute top-1.5 left-3 text-[9px] md:text-[11px] uppercase tracking-wider text-hiroshima-400 font-typewriter font-bold">
              Sub-titres // {subtitle.speaker}
            </span>
            <div className="space-y-2 text-center mt-3 px-2">
              <p className="text-sm md:text-lg lg:text-xl font-typewriter text-cream-100 italic leading-relaxed font-semibold">
                {subtitle.fr}
              </p>
              <p className="text-xs md:text-sm lg:text-base text-cream-300 font-sans tracking-wide">
                {subtitle.es}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Control Board & Card Grid (35% width on Desktop, Bottom on Mobile) */}
        <div className="w-full md:w-[35%] bg-cream-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 md:h-full z-20 md:overflow-y-auto">
          
          {/* INTRO PHASE ACTION PANEL */}
          {gameState === "intro" && (
            <div className="flex-1 flex flex-col justify-between text-center py-6 px-4">
              <div className="my-auto space-y-6">
                <div className="bg-cream-200 border border-cream-300 py-6 px-5 rounded text-charcoal-900/90 shadow-sm">
                  <p className="text-sm tracking-widest font-typewriter text-hiroshima-500 uppercase font-bold mb-3">Reglas de Asociación</p>
                  <ul className="text-left text-xs md:text-sm font-sans space-y-3 list-disc list-inside leading-relaxed">
                    <li>La imagen <strong>1</strong> hace par con la <strong>2</strong> (Museo e Intimidad).</li>
                    <li>La imagen <strong>3</strong> hace par con la <strong>4</strong> (Dolor y Renacimiento).</li>
                    <li>La imagen <strong>5</strong> hace par con la <strong>6</strong> (Piel y Sótano de Nevers).</li>
                    <li>La imagen <strong>7</strong> hace par con la <strong>8</strong> (Encuentro y Despedida).</li>
                  </ul>
                </div>
                
                <p className="text-xs md:text-sm text-charcoal-900/70 leading-relaxed max-w-sm mx-auto">
                  La memoria no duplica. Conecta los recuerdos complementarios para revivir la poesía fílmica.
                </p>
              </div>

              <button
                id="start-game-btn"
                onClick={initializeGame}
                className="w-full py-4 bg-hiroshima-500 hover:bg-hiroshima-600 active:bg-hiroshima-700 text-white uppercase text-xs md:text-sm tracking-widest font-bold rounded shadow-md transition-all duration-300 transform active:scale-95 mt-6"
              >
                Iniciar la memoria
              </button>
            </div>
          )}

          {/* COUNTDOWN INTERMEDIARY PANEL */}
          {gameState === "countdown" && (
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] uppercase tracking-widest font-typewriter text-charcoal-900/60 mb-2">
                Alineando Proyector
              </span>
              <p className="text-xs text-charcoal-900/50 max-w-[200px] leading-relaxed">
                El celuloide de la memoria está a punto de rodar...
              </p>
            </div>
          )}

          {/* PLAYING PHASE PANEL (Cards board) */}
          {gameState === "playing" && (
            <div className="flex-1 flex flex-col justify-between">
              
              {/* Score dashboard */}
              <div className="grid grid-cols-3 gap-3 text-center mb-6">
                <div className="bg-cream-200 p-3 rounded border border-cream-300 flex flex-col justify-center">
                  <span className="text-[10px] md:text-xs tracking-wider text-charcoal-900/60 uppercase font-typewriter font-semibold mb-1">Asociación</span>
                  <span className="text-lg md:text-2xl font-bold text-hiroshima-500 font-typewriter">{matches} / 4</span>
                </div>
                <div className="bg-cream-200 p-3 rounded border border-cream-300 flex flex-col justify-center">
                  <span className="text-[10px] md:text-xs tracking-wider text-charcoal-900/60 uppercase font-typewriter font-semibold mb-1">Olvidos</span>
                  <span className="text-lg md:text-2xl font-bold text-charcoal-900 font-typewriter">{mismatches}</span>
                </div>
                <div className="bg-cream-200 p-3 rounded border border-cream-300 flex flex-col justify-center">
                  <span className="text-[10px] md:text-xs tracking-wider text-charcoal-900/60 uppercase font-typewriter font-semibold mb-1">Temps</span>
                  <span className="text-lg md:text-2xl font-bold text-charcoal-900 font-typewriter">{formatTime(time)}</span>
                </div>
              </div>

              {/* Memory Cards Grid (4x2 on mobile, 2x4 on desktop) */}
              <div className="my-auto flex justify-center items-center py-2 md:py-4">
                <div className="grid grid-cols-4 md:grid-cols-2 gap-3 md:gap-4 w-full max-w-sm md:max-w-[280px]">
                  {cards.map((card, index) => (
                    <div
                      key={card.uniqueId}
                      id={`card-${index}`}
                      onClick={() => handleCardClick(index)}
                      className="card-container aspect-[3/4] cursor-pointer"
                    >
                      <div className={`card-inner h-full w-full relative ${card.isFlipped || card.isMatched ? "card-flipped" : ""}`}>
                        {/* Card Back */}
                        <div className="card-back absolute inset-0 flex flex-col justify-between items-center p-2 border border-cream-300 rounded shadow-sm hover:shadow-md hover:border-hiroshima-500/50 transition-all duration-300">
                          <div className="w-full flex justify-between px-1 opacity-45">
                            <div className="w-1.5 h-1.5 border border-hiroshima-500 rounded-full" />
                            <div className="w-1.5 h-1.5 border border-hiroshima-500 rounded-full" />
                          </div>
                          
                          <div className="w-7 h-7 rounded-full border border-hiroshima-500 flex items-center justify-center relative">
                            <div className="w-3.5 h-3.5 rounded-full bg-hiroshima-500" />
                          </div>

                          <span className="text-[7px] uppercase tracking-widest text-hiroshima-500 font-typewriter font-bold rotate-180">
                            MEMO
                          </span>
                        </div>

                        {/* Card Front */}
                        <div className={`card-front absolute inset-0 bg-white border rounded overflow-hidden shadow-md flex items-center justify-center ${card.isMatched ? "border-hiroshima-500" : "border-charcoal-900"}`}>
                          <div className="relative w-full h-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={card.imagePath}
                              alt={`Scène ${card.sceneId}`}
                              className="w-full h-full object-cover grayscale brightness-95 contrast-105"
                            />
                            {card.isMatched && (
                              <div className="absolute inset-0 bg-hiroshima-500/10 flex items-center justify-center">
                                <div className="absolute top-0 right-0 bg-hiroshima-500 text-white text-[7px] font-typewriter px-1 py-0.5 uppercase tracking-widest">
                                  PAIR
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

              {/* Action buttons footer */}
              <div className="mt-4 pt-3 border-t border-cream-300 flex justify-between items-center">
                <button
                  id="reset-btn"
                  onClick={initializeGame}
                  className="py-1.5 px-3 border border-charcoal-900/20 text-charcoal-900/80 hover:bg-cream-200 text-[10px] font-typewriter uppercase tracking-widest rounded transition-colors"
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

          {/* ENDED PHASE ACTION PANEL (Game over & final review) */}
          {gameState === "ended" && (
            <div className="flex-1 flex flex-col justify-between overflow-y-auto scrollbar-thin py-2">
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-xs tracking-widest font-typewriter text-hiroshima-500 uppercase font-semibold">
                    Bilan de la Mémoire
                  </span>
                  <h2 className="text-3xl font-bold uppercase tracking-wide text-charcoal-900 mt-1">
                    Fin del Celuloide
                  </h2>
                </div>

                {/* Score & Evaluation */}
                <div className="bg-cream-200 border border-cream-300 p-4 rounded text-center space-y-3 shadow-sm">
                  <span className="text-sm md:text-base uppercase tracking-widest text-hiroshima-600 font-typewriter block font-bold">
                    {getMemoryEvaluation().title}
                  </span>
                  <p className="text-xs md:text-sm text-charcoal-900/80 leading-relaxed font-sans px-1">
                    {getMemoryEvaluation().desc}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-cream-300 text-left font-typewriter text-xs text-charcoal-900/70">
                    <div>• Intentos: <span className="text-charcoal-900 font-bold">{turns}</span></div>
                    <div>• Olvidos: <span className="text-hiroshima-500 font-bold">{mismatches}</span></div>
                    <div className="col-span-2">• Duración: <span className="text-charcoal-900 font-bold">{formatTime(time)}</span></div>
                  </div>
                </div>

                {/* Matched Pairs Interactive Reviewer */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-charcoal-900/60 font-typewriter block text-center font-semibold">
                    — Le Musée de la Mémoire (Revisión de Pares) —
                  </span>
                  
                  <div className="grid grid-cols-4 gap-1.5 bg-cream-200/50 p-1.5 rounded border border-cream-200 max-h-[100px] overflow-y-auto">
                    {MATCH_THEMES.map((theme) => (
                      <div
                        key={theme.pairId}
                        className="relative aspect-video rounded overflow-hidden border border-cream-300 cursor-pointer hover:border-hiroshima-500 transition-all duration-300"
                        title={theme.title}
                        onClick={() => {
                          playSynthSound("click");
                          // Project one of the images of the pair
                          const imageNum = theme.pairId * 2 - 1;
                          setActiveImagePath(`/${imageNum}.jpg.jpeg`);
                          setSubtitle({
                            fr: theme.quoteFr,
                            es: theme.quoteEs,
                            speaker: theme.speaker
                          });
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/${theme.pairId * 2 - 1}.jpg.jpeg`}
                          alt={theme.title}
                          className="w-full h-full object-cover grayscale brightness-75 hover:brightness-100"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[8px] text-center text-charcoal-900/40 italic font-typewriter">
                    Haz clic en los pares para proyectar sus diálogos en el cine.
                  </p>
                </div>
              </div>

              {/* Ending actions */}
              <div className="space-y-2 pt-3 border-t border-cream-300">
                <button
                  id="restart-game-btn"
                  onClick={initializeGame}
                  className="w-full py-3 bg-hiroshima-500 hover:bg-hiroshima-600 active:bg-hiroshima-700 text-white uppercase text-xs tracking-widest font-semibold rounded shadow-md transition-all duration-300"
                >
                  Reconstruir el Recuerdo
                </button>
                
                <button
                  id="back-intro-btn"
                  onClick={() => {
                    playSynthSound("click");
                    setGameState("intro");
                  }}
                  className="w-full py-2 border border-charcoal-900/20 hover:bg-cream-200 text-charcoal-900/70 uppercase text-[9px] tracking-widest rounded transition-colors"
                >
                  Volver al Inicio
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
