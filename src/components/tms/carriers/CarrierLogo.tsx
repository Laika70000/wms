import React from 'react';

interface CarrierLogoProps {
  code: string;
  size?: 'sm' | 'md' | 'lg';
}

const CarrierLogo: React.FC<CarrierLogoProps> = ({ code, size = 'md' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8 text-xs';
      case 'lg': return 'w-16 h-16 text-base';
      default: return 'w-12 h-12 text-sm';
    }
  };

  const sizeClasses = getSizeClasses();

  // Logos spécifiques par transporteur
  switch (code.toUpperCase()) {
    case 'COLISSIMO':
      return (
        <div className={`relative ${sizeClasses} bg-gradient-to-br from-[#C20F2D] to-[#8B0020] rounded-lg flex items-center justify-center shadow-md`}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516478379578-ea8bea43365f?q=80&w=100')] opacity-10 rounded-lg" />
          <div className="flex flex-col items-center justify-center text-white font-bold">
            <span>La</span>
            <span>Poste</span>
          </div>
        </div>
      );

    case 'DHL':
      return (
        <div className={`relative ${sizeClasses} bg-gradient-to-br from-[#FFCC00] to-[#FFB300] rounded-lg flex items-center justify-center shadow-md`}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516478379578-ea8bea43365f?q=80&w=100')] opacity-10 rounded-lg" />
          <span className="font-bold text-[#D40511]">DHL</span>
        </div>
      );

    case 'UPS':
      return (
        <div className={`relative ${sizeClasses} bg-gradient-to-br from-[#351C15] to-[#1A0E0A] rounded-lg flex items-center justify-center shadow-md`}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516478379578-ea8bea43365f?q=80&w=100')] opacity-10 rounded-lg" />
          <span className="font-bold text-[#FFB500]">UPS</span>
        </div>
      );

    case 'FEDEX':
      return (
        <div className={`relative ${sizeClasses} bg-gradient-to-br from-[#4D148C] to-[#2D0B52] rounded-lg flex items-center justify-center shadow-md`}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516478379578-ea8bea43365f?q=80&w=100')] opacity-10 rounded-lg" />
          <span className="font-bold text-[#FF6600]">FedEx</span>
        </div>
      );

    case 'CHRONOPOST':
      return (
        <div className={`relative ${sizeClasses} bg-gradient-to-br from-[#004B93] to-[#003366] rounded-lg flex items-center justify-center shadow-md`}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516478379578-ea8bea43365f?q=80&w=100')] opacity-10 rounded-lg" />
          <span className="font-bold text-white">Chrono</span>
        </div>
      );

    case 'TNT':
      return (
        <div className={`relative ${sizeClasses} bg-gradient-to-br from-[#FF6200] to-[#CC4E00] rounded-lg flex items-center justify-center shadow-md`}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516478379578-ea8bea43365f?q=80&w=100')] opacity-10 rounded-lg" />
          <span className="font-bold text-white">TNT</span>
        </div>
      );

    case 'MONDIAL_RELAY':
      return (
        <div className={`relative ${sizeClasses} bg-gradient-to-br from-[#1F3B64] to-[#0F1D32] rounded-lg flex items-center justify-center shadow-md`}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516478379578-ea8bea43365f?q=80&w=100')] opacity-10 rounded-lg" />
          <div className="flex flex-col items-center justify-center text-white font-bold">
            <span>Mondial</span>
            <span>Relay</span>
          </div>
        </div>
      );

    default:
      return (
        <div className={`relative ${sizeClasses} bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center shadow-md`}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516478379578-ea8bea43365f?q=80&w=100')] opacity-10 rounded-lg" />
          <span className="font-bold text-gray-600">{code}</span>
        </div>
      );
  }
};

export default CarrierLogo;