export function LabAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="lab-mesh absolute inset-0" />
      <div className="lab-grid absolute inset-0 opacity-40" />
      <div className="lab-grain absolute inset-0" />
    </div>
  )
}
