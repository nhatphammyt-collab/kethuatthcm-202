import { FixedNavBar } from "../components/presentation/FixedNavBar"
import { FixedSidebarButtons } from "../components/presentation/FixedSidebarButtons"
import { ContentColumn } from "../components/presentation/ContentColumn"

export default function PresentationPage() {
  return (
    <main className="relative min-h-screen">
      {/* Fixed Background with old paper texture effect */}
        <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat parallax-background"
          style={{
          backgroundImage: `url('/images/image.png')`,
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Old paper texture overlay */}
        <div
          className="absolute inset-0 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
              </div>

      {/* Fixed UI Elements */}
      <FixedNavBar />
      <FixedSidebarButtons />

      {/* Scrolling Content Column */}
      <div className="relative z-10 pt-20 pb-12">
        <ContentColumn />
                      </div>
    </main>
  )
}
