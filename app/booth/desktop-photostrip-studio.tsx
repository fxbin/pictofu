"use client";

import { photoStripThemes } from "@/lib/photo-strip-themes";

const shots = [1, 2, 3, 4];

export function DesktopPhotoStripStudio() {
  return (
    <main className="desktop-photo-strip-studio">
      <aside className="studio-theme-panel">
        <h1>Create your photo strip</h1>
        <p>Turn one photo into a beautiful photo booth memory.</p>
        <button className="studio-upload">Upload Photo</button>

        <h2>Themes</h2>
        <div className="studio-themes">
          {photoStripThemes.map((theme) => (
            <button key={theme.id}>
              {theme.name}
            </button>
          ))}
        </div>
      </aside>

      <section className="studio-canvas-panel">
        <div className="studio-step">Choose style → Create strip → Export</div>
        <div className="photo-strip-preview">
          {shots.map((shot) => (
            <div className="photo-slot" key={shot}>
              Photo {shot}
            </div>
          ))}
          <span className="photo-strip-brand">PICTOFU</span>
        </div>
      </section>

      <aside className="studio-control-panel">
        <h2>Layout</h2>
        <div className="layout-options">
          <button>4 Shots</button>
          <button>6 Shots</button>
          <button>2x2 Grid</button>
        </div>

        <h2>Frame Style</h2>
        <div className="frame-options">
          <button>Classic</button>
          <button>Film</button>
          <button>Polaroid</button>
        </div>

        <button className="studio-export">Export Photo Strip</button>
      </aside>
    </main>
  );
}
