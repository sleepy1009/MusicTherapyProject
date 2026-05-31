import React from 'react';

const PlayerSkeleton = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full p-4 gap-6 pt-24 overflow-hidden relative z-10">
      
      <div className="hidden md:flex flex-col w-1/4 h-full bg-black/20 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 gap-6 animate-pulse shadow-xl">
        <div className="w-1/2 h-6 bg-white/10 rounded-full mb-2"></div>
        <div className="flex items-end gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0"></div>
          <div className="w-3/4 h-20 bg-white/10 rounded-2xl rounded-bl-none"></div>
        </div>
        <div className="flex items-end gap-3 justify-end mt-4">
          <div className="w-2/3 h-12 bg-white/10 rounded-2xl rounded-br-none"></div>
        </div>
        <div className="flex items-end gap-3 mt-4">
          <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0"></div>
          <div className="w-5/6 h-24 bg-white/10 rounded-2xl rounded-bl-none"></div>
        </div>
        <div className="mt-auto w-full h-14 bg-white/10 rounded-full"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center animate-pulse mt-10 md:mt-0">
         <div className="w-64 h-64 md:w-80 md:h-80 bg-white/5 border-[8px] border-white/5 rounded-full mb-10 shadow-[0_0_60px_rgba(255,255,255,0.02)]"></div>
         <div className="w-1/2 md:w-1/3 h-8 bg-white/10 rounded-full mb-4"></div>
         <div className="w-1/3 md:w-1/4 h-4 bg-white/5 rounded-full mb-10"></div>
         <div className="w-3/4 max-w-md h-2 bg-white/10 rounded-full mb-8"></div>
         <div className="flex gap-8 items-center">
            <div className="w-12 h-12 bg-white/10 rounded-full"></div>
            <div className="w-20 h-20 bg-white/10 rounded-full shadow-lg"></div>
            <div className="w-12 h-12 bg-white/10 rounded-full"></div>
         </div>
      </div>

      <div className="hidden md:flex flex-col w-1/4 h-full bg-black/20 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 gap-4 animate-pulse shadow-xl">
         <div className="flex gap-2 mb-4">
             <div className="flex-1 h-10 bg-white/10 rounded-lg"></div>
             <div className="flex-1 h-10 bg-white/5 rounded-lg"></div>
             <div className="flex-1 h-10 bg-white/5 rounded-lg"></div>
         </div>
         {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-4 items-center w-full bg-white/5 p-3 rounded-2xl">
               <div className="w-14 h-14 bg-white/10 rounded-xl flex-shrink-0"></div>
               <div className="flex-1 flex flex-col gap-3">
                   <div className="w-3/4 h-4 bg-white/10 rounded-full"></div>
                   <div className="w-1/2 h-3 bg-white/5 rounded-full"></div>
               </div>
            </div>
         ))}
      </div>
    </div>
  )
}

export default PlayerSkeleton;