import React from 'react'

interface LoadingScreenProps {
  message?: string
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Cargando...' }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#f8c200] bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
        <div className="relative w-24 h-24 mb-4">
          <div className="absolute inset-0 border-4 border-[#f8c200] rounded-full animate-ping"></div>
          <div className="absolute inset-2 border-4 border-[#291471] rounded-full animate-spin"></div>
          <div className="absolute inset-4 bg-[#f8c200] rounded-full animate-pulse"></div>
        </div>
        <p className="text-[#291471] text-xl font-semibold animate-pulse">{message}</p>
      </div>
    </div>
  )
}

export default LoadingScreen