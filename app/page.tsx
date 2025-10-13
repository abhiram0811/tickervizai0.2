// This is now a Server Component - renders static structure
import Background from '@/components/ui/Background'
import Header from '@/components/ui/Header'
import InteractiveContent from '@/components/InteractiveContent'
import './homepage.css'
import './chart.css'

export default function HomePage() {

  return (
    <main className="homepage">
      {/* Background - Server Component (static) */}
      <Background />

      {/* Main Content */}
      <div className="content">
        <div className="container">
          
          {/* Header - Server Component (static) */}
          <Header 
            title="VizAI"
            subtitle="Next-generation stock visualization powered by AI"
          />

          {/* All Interactive Content - Client Component */}
          <InteractiveContent />

        </div>
      </div>
    </main>
  )
}