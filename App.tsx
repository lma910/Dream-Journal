import React, { useState } from 'react';
import VoiceRecorder from './components/VoiceRecorder';
import DreamChat from './components/DreamChat';
import { analyzeDreamAudio, generateDreamImage } from './services/geminiService';
import { AppState, DreamAnalysis } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysis, setAnalysis] = useState<DreamAnalysis | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = async (audioBase64: string) => {
    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      // 1. Analyze Audio (Transcript + Meaning)
      const result = await analyzeDreamAudio(audioBase64);
      setAnalysis(result);

      // 2. Generate Image based on theme
      const imageUrl = await generateDreamImage(result.emotionalTheme, result.transcription);
      setGeneratedImage(imageUrl);

      setAppState(AppState.VIEWING);
    } catch (err) {
      console.error("Pipeline failed:", err);
      setError("Failed to interpret the dream. The spirits are quiet today.");
      setAppState(AppState.IDLE);
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setAnalysis(null);
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-night-900 text-white font-sans selection:bg-dream-purple selection:text-white overflow-x-hidden relative">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-dream-purple/20 rounded-full blur-[128px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-dream-blue/10 rounded-full blur-[128px]"></div>
        <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] bg-dream-pink/10 rounded-full blur-[96px] animate-float"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={reset}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-dream-purple to-dream-blue rounded-lg flex items-center justify-center shadow-lg shadow-dream-purple/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              ONEIRIC
            </h1>
          </div>
          {appState === AppState.VIEWING && (
             <button onClick={reset} className="text-sm text-slate-400 hover:text-white transition-colors uppercase tracking-widest font-semibold border-b border-transparent hover:border-dream-purple">
               New Dream
             </button>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-8 text-center backdrop-blur-md">
              {error}
            </div>
          )}

          {appState === AppState.IDLE || appState === AppState.ANALYZING ? (
            <div className="flex-grow flex flex-col items-center justify-center space-y-12">
               <div className="text-center space-y-4 max-w-2xl">
                 <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">
                   Capture the fleeting nature <br/> of your subconscious.
                 </h2>
                 <p className="text-slate-400 text-lg md:text-xl font-light">
                   Speak your dream immediately upon waking. We will transcribe, visualize, and interpret the symbols hidden within.
                 </p>
               </div>
               <VoiceRecorder 
                 onRecordingComplete={handleRecordingComplete} 
                 isProcessing={appState === AppState.ANALYZING} 
               />
               
               {appState === AppState.ANALYZING && (
                 <div className="text-center animate-pulse text-dream-purple">
                   <p className="text-sm uppercase tracking-widest font-bold">Consulting the Oracle</p>
                 </div>
               )}
            </div>
          ) : (
            // VIEWING STATE
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-1000 slide-in-from-bottom-10">
              
              {/* Left Column: Visuals & Transcript */}
              <div className="space-y-8">
                {/* Generated Image */}
                <div className="group relative aspect-square w-full rounded-3xl overflow-hidden shadow-2xl shadow-dream-purple/20 border border-white/10 bg-night-800">
                  {generatedImage ? (
                    <img 
                      src={generatedImage} 
                      alt="Dream visualization" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                      Image generation failed
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-night-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                    <p className="text-white font-serif text-lg italic">
                      "{analysis?.emotionalTheme}"
                    </p>
                  </div>
                </div>

                {/* Transcript */}
                <div className="bg-night-800/50 backdrop-blur-lg rounded-3xl p-8 border border-white/5">
                   <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Transcript</h3>
                   <p className="text-slate-300 leading-relaxed text-lg font-light">
                     "{analysis?.transcription}"
                   </p>
                </div>
              </div>

              {/* Right Column: Interpretation & Chat */}
              <div className="space-y-8 flex flex-col">
                {/* Interpretation Card */}
                <div className="bg-gradient-to-br from-night-800/80 to-night-900/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-lg">
                  <h2 className="text-3xl font-serif text-white mb-6">Interpretation</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-dream-purple text-sm font-bold uppercase tracking-wider mb-2">Psychological Theme</h4>
                      <p className="text-slate-200 leading-relaxed">
                        {analysis?.interpretation.psychologicalMeaning}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-dream-blue text-sm font-bold uppercase tracking-wider mb-3">Archetypes Detected</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis?.interpretation.archetypes.map((arch, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded-full text-sm text-slate-200">
                            {arch}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                       <p className="text-slate-400 text-sm italic">
                         "{analysis?.interpretation.summary}"
                       </p>
                    </div>
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-grow">
                   <DreamChat analysis={analysis!} />
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;