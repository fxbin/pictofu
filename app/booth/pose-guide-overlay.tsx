import type { PoseGuideArt, PoseGuideStep } from "@/lib/pose-guides";

function Head({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r="24" />;
}

function Body({ x, y = 150 }: { x: number; y?: number }) {
  return <path d={`M ${x} ${y} C ${x - 26} ${y + 36}, ${x - 32} ${y + 92}, ${x - 24} ${y + 152} M ${x} ${y} C ${x + 26} ${y + 36}, ${x + 32} ${y + 92}, ${x + 24} ${y + 152}`} />;
}

function SoloArt({ art }: { art: PoseGuideArt }) {
  const arm = art === "solo-peace"
    ? "M160 190 C120 170 105 135 118 95 M118 95 L105 72 M118 95 L136 74 M160 190 C205 205 220 240 226 278"
    : art === "solo-side"
      ? "M158 190 C118 205 96 238 92 278 M158 190 C204 178 224 150 236 118"
      : art === "solo-fun"
        ? "M160 190 C112 160 92 124 84 82 M160 190 C208 160 228 124 236 82"
        : "M160 190 C116 198 98 226 90 266 M160 190 C204 198 222 226 230 266";
  return (
    <>
      <Head cx={160} cy={118} />
      <Body x={160} />
      <path d={arm} />
      {art === "solo-peace" && <path d="M103 72 L95 55 M105 72 L114 54" />}
      {art === "solo-fun" && <path d="M84 82 L73 61 M236 82 L247 61" />}
    </>
  );
}

function DuoArt({ art }: { art: PoseGuideArt }) {
  const leftX = art === "duo-cheek" ? 142 : 126;
  const rightX = art === "duo-cheek" ? 178 : 194;
  return (
    <>
      <Head cx={leftX} cy={118} />
      <Head cx={rightX} cy={118} />
      <Body x={leftX} y={154} />
      <Body x={rightX} y={154} />
      {art === "duo-heart" ? (
        <>
          <path d={`M${leftX} 194 C148 180 154 164 160 154`} />
          <path d={`M${rightX} 194 C172 180 166 164 160 154`} />
          <path d="M160 154 C151 140 132 146 136 163 C139 178 160 188 160 188 C160 188 181 178 184 163 C188 146 169 140 160 154Z" />
        </>
      ) : art === "duo-fun" ? (
        <>
          <path d={`M${leftX} 194 C100 168 90 132 82 94`} />
          <path d={`M${rightX} 194 C220 168 230 132 238 94`} />
        </>
      ) : (
        <>
          <path d={`M${leftX} 194 C148 205 154 224 160 248`} />
          <path d={`M${rightX} 194 C172 205 166 224 160 248`} />
        </>
      )}
    </>
  );
}

function FriendsArt({ art }: { art: PoseGuideArt }) {
  return (
    <>
      <Head cx={118} cy={120} />
      <Head cx={202} cy={120} />
      <Body x={118} y={156} />
      <Body x={202} y={156} />
      {art === "friends-peace" && (
        <>
          <path d="M118 194 C88 170 76 132 82 96 M82 96 L70 76 M82 96 L94 76" />
          <path d="M202 194 C232 170 244 132 238 96 M238 96 L226 76 M238 96 L250 76" />
        </>
      )}
      {art === "friends-hug" && <path d="M118 194 C146 176 174 176 202 194 M202 194 C174 218 146 218 118 194" />}
      {art === "friends-point" && <path d="M118 194 C150 170 174 170 202 194 M202 194 C174 222 150 222 118 194" />}
      {art === "friends-chaos" && <path d="M118 194 C80 160 72 122 72 80 M202 194 C240 160 248 122 248 80" />}
    </>
  );
}

function PoseArt({ art }: { art: PoseGuideArt }) {
  if (art.startsWith("solo-")) return <SoloArt art={art} />;
  if (art.startsWith("duo-")) return <DuoArt art={art} />;
  return <FriendsArt art={art} />;
}

export function PoseGuideOverlay({
  pose,
  shotIndex,
  shotCount,
  mirrored,
}: {
  pose: PoseGuideStep;
  shotIndex: number;
  shotCount: number;
  mirrored: boolean;
}) {
  return (
    <div className="pose-guide-overlay" aria-label={`Pose guide: ${pose.title}`}>
      <div className={`pose-guide-overlay__art ${mirrored ? "is-mirrored" : ""}`} aria-hidden="true">
        <svg viewBox="0 0 320 420" role="presentation">
          <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <PoseArt art={pose.art} />
          </g>
        </svg>
      </div>
      <div className="pose-guide-overlay__copy">
        <span>{Math.min(shotIndex + 1, shotCount)} / {shotCount} · Pose Guide</span>
        <strong>{pose.title}</strong>
        <small>{pose.hint}</small>
      </div>
    </div>
  );
}
