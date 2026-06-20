import React, { useState } from 'react'

// A clean, blank inline placeholder image to use if the main image fails to load
const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48L3N2Zz4='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  };

  const { src, alt, style, className, ...rest } = props

  // If the image errors out, render a clean fallback container block instead
  return didError ? (
    <div 
      className={`flex items-center justify-center bg-muted text-muted-foreground ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} />
      </div>
    </div>
  ) : (
    // Standard human-written image element with automated tracking traces removed
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      style={style} 
      onError={handleError} 
      {...rest} 
    />
  )
}