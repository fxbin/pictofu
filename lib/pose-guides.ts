export type PoseGuideArt =
  | "solo-smile"
  | "solo-peace"
  | "solo-side"
  | "solo-fun"
  | "duo-close"
  | "duo-heart"
  | "duo-cheek"
  | "duo-fun"
  | "friends-peace"
  | "friends-hug"
  | "friends-point"
  | "friends-chaos";

export type PoseGuideStep = {
  id: string;
  title: string;
  hint: string;
  art: PoseGuideArt;
};

export type PoseGuideSequence = {
  id: string;
  presetId: string;
  label: string;
  steps: readonly PoseGuideStep[];
};

export type PoseGuideProfile = "none" | "guided" | "customized" | "disabled";

export const POSE_GUIDE_SEQUENCES: readonly PoseGuideSequence[] = [
  {
    id: "classic-four",
    presetId: "classic-booth",
    label: "Classic four-cut",
    steps: [
      { id: "classic-smile", title: "Smile", hint: "Relax your shoulders and look into the lens.", art: "solo-smile" },
      { id: "classic-peace", title: "Peace sign", hint: "Bring one hand up and change the energy.", art: "solo-peace" },
      { id: "classic-side", title: "Look away", hint: "Turn slightly and glance back toward the camera.", art: "solo-side" },
      { id: "classic-fun", title: "Freestyle", hint: "Make the last frame the one nobody planned.", art: "solo-fun" },
    ],
  },
  {
    id: "korean-soft-date",
    presetId: "korean-date",
    label: "Soft date four-cut",
    steps: [
      { id: "korean-close", title: "Lean closer", hint: "Move your faces a little closer and keep the pose soft.", art: "duo-close" },
      { id: "korean-heart", title: "Finger heart", hint: "Make a small heart together near the center of frame.", art: "duo-heart" },
      { id: "korean-cheek", title: "Cheek to cheek", hint: "Close the gap and keep both faces inside the crop.", art: "duo-cheek" },
      { id: "korean-cute", title: "Cute freestyle", hint: "Finish with a playful expression or tiny hand pose.", art: "duo-fun" },
    ],
  },
  {
    id: "couple-date-four",
    presetId: "couple-date",
    label: "Couple date four-cut",
    steps: [
      { id: "couple-look", title: "Look at each other", hint: "Turn inward instead of both facing the lens.", art: "duo-close" },
      { id: "couple-lean", title: "Shoulder lean", hint: "Let one person lean in while the other stays tall.", art: "duo-cheek" },
      { id: "couple-heart", title: "Heart together", hint: "Bring your hands toward the middle of the frame.", art: "duo-heart" },
      { id: "couple-fun", title: "Make each other laugh", hint: "Use the final shot for something less posed.", art: "duo-fun" },
    ],
  },
  {
    id: "besties-four",
    presetId: "best-friends",
    label: "Besties four-cut",
    steps: [
      { id: "friends-peace", title: "Double peace", hint: "Keep both faces visible and vary the hand height.", art: "friends-peace" },
      { id: "friends-hug", title: "Side hug", hint: "Pull closer so the frame reads like one group.", art: "friends-hug" },
      { id: "friends-point", title: "Point at your bestie", hint: "Turn toward each other and point across the frame.", art: "friends-point" },
      { id: "friends-chaos", title: "Chaos frame", hint: "Finish loud: laugh, wave, or make a ridiculous face.", art: "friends-chaos" },
    ],
  },
];

export function getPoseGuideSequence(presetId: string) {
  return POSE_GUIDE_SEQUENCES.find((sequence) => sequence.presetId === presetId) ?? null;
}

export function poseGuideStepForShot(sequence: PoseGuideSequence, shotIndex: number, offset = 0) {
  const count = sequence.steps.length;
  if (!count) return null;
  const normalized = ((shotIndex + offset) % count + count) % count;
  return sequence.steps[normalized] ?? null;
}

export function poseGuideProfileForCapture(args: {
  supported: boolean;
  enabled: boolean;
  customized: boolean;
}): PoseGuideProfile {
  if (!args.supported) return "none";
  if (!args.enabled) return "disabled";
  return args.customized ? "customized" : "guided";
}
