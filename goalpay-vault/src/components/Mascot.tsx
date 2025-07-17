
const Mascot = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Main vault mascot */}
      <div className="w-32 h-32 md:w-40 md:h-40 relative animate-bounce-gentle">
        {/* Vault body */}
        <div 
          className="w-full h-full rounded-3xl bg-goal-primary shadow-lg relative overflow-hidden"
          style={{
            boxShadow: '0 8px 32px rgba(163, 125, 206, 0.3)'
          }}
        >
          {/* Vault lock */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-goal-text rounded-t-full border-2 border-goal-text">
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-goal-primary rounded-full"></div>
          </div>
          
          {/* Eyes */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
            <div className="w-3 h-3 bg-goal-text rounded-full"></div>
            <div className="w-3 h-3 bg-goal-text rounded-full"></div>
          </div>
          
          {/* Smile */}
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-3 border-2 border-goal-text rounded-b-full border-t-0"></div>
          </div>
          
          {/* Coin slot */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-goal-text rounded-full"></div>
        </div>
        
        {/* Floating sparkles */}
        <div className="absolute -top-2 -right-2 w-3 h-3 text-goal-text animate-sparkle">
          ✨
        </div>
        <div className="absolute -bottom-1 -left-2 w-3 h-3 text-goal-text animate-sparkle" style={{ animationDelay: '1s' }}>
          ⭐
        </div>
        <div className="absolute top-1/2 -right-4 w-3 h-3 text-goal-text animate-sparkle" style={{ animationDelay: '0.5s' }}>
          💫
        </div>
      </div>
    </div>
  );
};

export default Mascot;
