// This can be a Server Component - it's just static HTML
export default function Background() {
  return (
    <div className="background">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      
      <div className="particles">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
      </div>
      
      <div className="grid-pattern"></div>
      <div className="scanning-lines">
        <div className="scan-line scan-1"></div>
        <div className="scan-line scan-2"></div>
      </div>
    </div>
  )
}