const ITEMS = [
  "NEXT GAME: LADY COMETS VS. STORM — MAY 15",
  "TICKETS AVAILABLE NOW",
  "FINAL SCORE: LADY COMETS 98 – 85 MYSTICS",
  "JUST DROPPED: NEW MERCH CAPSULE",
  "PLAYER OF THE WEEK: ZARA 'THE COMET' VANCE",
  "LADY COMETS LEAD THE LEAGUE IN STEALS",
]

export default function TickerBar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-primary text-black z-50 overflow-hidden flex items-center shadow-[0_0_20px_rgba(255,200,40,0.45)]">
      <div
        className="flex whitespace-nowrap"
        style={{ animation: 'marquee 30s linear infinite' }}
      >
        {[...ITEMS, ...ITEMS, ...ITEMS].map((item, i) => (
          <div key={i} className="flex items-center">
            <span className="text-xs font-black uppercase tracking-widest mx-4">{item}</span>
            <span className="text-black/50 text-xs mx-4">///</span>
          </div>
        ))}
      </div>
    </div>
  )
}
