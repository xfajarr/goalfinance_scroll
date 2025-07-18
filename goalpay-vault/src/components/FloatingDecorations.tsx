
const FloatingDecorations = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Background floating elements */}
      <div className="absolute top-20 left-10">
        <div className="w-8 h-8 rounded-full bg-goal-primary"></div>
      </div>
      
      <div className="absolute top-40 right-16 ">
        <div className="w-6 h-6 rounded-full bg-goal-accent"></div>
      </div>
      
      <div className="absolute top-60 left-20">
        <div className="w-4 h-4 rounded-full bg-goal-border"></div>
      </div>
      
      <div className="absolute bottom-40 right-10">
        <div className="w-10 h-10 rounded-full bg-goal-primary"></div>
      </div>
      
      <div className="absolute bottom-20 left-16">
        <div className="w-5 h-5 rounded-full bg-goal-accent"></div>
      </div>
      
      {/* Sparkle text elements */}
      {/* <div className="absolute top-32 right-32 text-2xl opacity-30 animate-sparkle" style={{ animationDelay: '0.3s' }}>
        ✨
      </div> */}
      
      {/* <div className="absolute bottom-32 left-32 text-xl opacity-25 animate-sparkle" style={{ animationDelay: '1.2s' }}>
        💰
      </div>
      
      <div className="absolute top-1/2 left-8 text-lg opacity-20 animate-sparkle" style={{ animationDelay: '2.1s' }}>
        🌟
      </div>
      
      <div className="absolute top-1/3 right-8 text-xl opacity-30 animate-sparkle" style={{ animationDelay: '0.8s' }}>
        💫
      </div> */}
    </div>
  );
};

export default FloatingDecorations;
