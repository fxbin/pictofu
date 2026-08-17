export type SeoExperience = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  presetId: string;
  cta: string;
  highlights: string[];
  howItWorks: [string, string, string];
  faq: { question: string; answer: string }[];
  related: string[];
};

export const SEO_EXPERIENCES: SeoExperience[] = [
  {
    slug: "online-photobooth",
    title: "Free Online Photobooth",
    description: "Use your camera to take a cute photo strip online. No app or account required; capture, style and download directly in your browser.",
    h1: "A free online photobooth, right in your browser",
    eyebrow: "Open. Pose. Download.",
    intro: "PicToFu turns your phone or laptop camera into a lightweight photo booth. Take a four-cut set, choose a look, and export a finished PNG without installing an app.",
    presetId: "classic-booth",
    cta: "Start the online booth ✦",
    highlights: ["Four-cut classic strip", "Browser-local photo processing", "PNG download and mobile sharing"],
    howItWorks: ["Open the booth and allow camera access when you’re ready.", "Pose through the 3-2-1 countdown for your photo set.", "Pick a frame or filter, then download or share the finished strip."],
    faq: [
      { question: "Do I need to install an app?", answer: "No. PicToFu runs in a modern browser on your phone or computer." },
      { question: "Does PicToFu upload my camera photos?", answer: "PicToFu captures and composes your strip in the browser rather than storing your photos in a PicToFu cloud photo gallery." },
    ],
    related: ["photo-strip-maker", "korean-photobooth", "vintage-photobooth"],
  },
  {
    slug: "photo-strip-maker",
    title: "Free Photo Strip Maker",
    description: "Make a classic photo strip from your browser camera with layouts, filters and pastel frames. Export your finished strip as a PNG.",
    h1: "Make a photo strip you’ll actually want to keep",
    eyebrow: "Tiny photos. One finished memory.",
    intro: "The PicToFu photo strip maker is built around the finished strip, not a complicated editor. Capture a short sequence, switch between strip and grid layouts, then export one shareable image.",
    presetId: "classic-booth",
    cta: "Make a photo strip ✦",
    highlights: ["1×4, 1×3, 2×2 and Polaroid-like layouts", "Original, Mono, Rose Glow, Film Fade, Y2K Pop and more", "Eight frame styles across clean, cute and retro moods"],
    howItWorks: ["Capture a set of photos with the in-browser camera.", "Choose a layout, filter and frame that fit the moment.", "PicToFu composes the strip locally and exports a PNG."],
    faq: [
      { question: "Can I change the look after taking the photos?", answer: "Yes. After capture you can switch compatible layouts, filters and frame themes before export." },
      { question: "What format does PicToFu export?", answer: "The current photo strip export is a PNG so the whole strip is saved as one image." },
    ],
    related: ["online-photobooth", "y2k-photobooth", "best-friend-photobooth"],
  },
  {
    slug: "korean-photobooth",
    title: "Korean Photobooth Online",
    description: "Try a Korean-style four-cut photobooth online with the Rose Glow filter, Blush Hearts frame and browser-based photo strip export.",
    h1: "A soft Korean-style four-cut photobooth",
    eyebrow: "Four cuts, soft color, date-night energy.",
    intro: "This preset starts with the four-cut rhythm people love in Korean photo booths: the Rose Glow look, Blush Hearts frame and fast countdown flow. It is designed for dates, friends and casual portraits without turning the browser into a heavy editor.",
    presetId: "korean-date",
    cta: "Start Korean Date booth ✦",
    highlights: ["Rose Glow four-cut preset", "Blush Hearts frame", "Fast browser camera flow"],
    howItWorks: ["Open the Korean Date preset with Rose Glow and Blush Hearts already selected.", "Take four poses as PicToFu counts down each shot.", "Fine-tune the look, then save the finished four-cut strip."],
    faq: [
      { question: "What makes this different from the classic booth?", answer: "The Korean Date route opens a real preset with the Rose Glow filter and Blush Hearts four-cut frame instead of the classic neutral defaults." },
      { question: "Can I still change the filter?", answer: "Yes. The route gives you a starting style, but the editor still lets you choose another compatible look before export." },
    ],
    related: ["couple-photobooth", "best-friend-photobooth", "online-photobooth"],
  },
  {
    slug: "y2k-photobooth",
    title: "Y2K Photobooth Online",
    description: "Create a Y2K-inspired photo strip online with the Y2K Pop filter, Chrome Y2K frame and a four-shot browser photobooth flow.",
    h1: "Give your photo strip a Y2K flashback",
    eyebrow: "Glossy color. Chrome frame. 2000s mood.",
    intro: "The Y2K Summer preset pushes the strip toward a brighter, punchier look instead of soft film nostalgia. Start with Y2K Pop and the Chrome Y2K frame, then capture four poses for one playful export.",
    presetId: "y2k-summer",
    cta: "Start Y2K Summer booth ✦",
    highlights: ["Y2K Pop export filter", "Chrome Y2K four-cut frame", "Four poses in one PNG"],
    howItWorks: ["Launch with Y2K Pop and Chrome Y2K preselected.", "Take four quick poses with the countdown.", "Keep the Y2K look or edit it before downloading the strip."],
    faq: [
      { question: "Is the Y2K effect only a preview?", answer: "No. PicToFu applies the selected filter while composing the exported Canvas, so the effect is part of the PNG pixels." },
      { question: "Can I use the Y2K page on mobile?", answer: "PicToFu is designed mobile-first; camera and share behavior still depends on the capabilities of your browser and device." },
    ],
    related: ["photo-strip-maker", "vintage-photobooth", "best-friend-photobooth"],
  },
  {
    slug: "vintage-photobooth",
    title: "Vintage Photobooth Online",
    description: "Make a warm vintage photo strip online with the Film Fade filter, Vintage Film frame and local browser PNG export.",
    h1: "Turn four quick poses into a vintage film strip",
    eyebrow: "Warm grain-era mood, without the old camera.",
    intro: "Vintage Film starts from the Film Fade color treatment and Vintage Film frame. It is for portraits that should feel less glossy and more like a little strip found in a drawer years later.",
    presetId: "vintage-film",
    cta: "Start Vintage Film booth ✦",
    highlights: ["Film Fade Canvas filter", "Vintage Film frame", "Browser-local PNG composition"],
    howItWorks: ["Open the Vintage Film preset with Film Fade ready.", "Capture four expressions or poses.", "Adjust the frame or filter if you want, then export one finished strip."],
    faq: [
      { question: "Does PicToFu add a vintage filter to the exported file?", answer: "Yes. The Film Fade treatment is applied in the Canvas compositor before PNG export." },
      { question: "Is this an AI filter?", answer: "No. The current vintage look uses browser image filtering and Canvas composition; it does not require an AI image model." },
    ],
    related: ["y2k-photobooth", "online-photobooth", "photo-strip-maker"],
  },
  {
    slug: "couple-photobooth",
    title: "Couple Photobooth Online",
    description: "Take a cute couple photo strip online with a Blush Hearts frame, four-shot countdown and browser-local PNG export.",
    h1: "A little online photobooth for two",
    eyebrow: "Date night, anniversary, or just because.",
    intro: "Couple Date keeps the setup simple so two people can focus on posing instead of configuring the editor. It opens with a clean four-cut layout and Blush Hearts frame that works for dates, anniversaries and everyday couple photos.",
    presetId: "couple-date",
    cta: "Start Couple Date booth ♡",
    highlights: ["Four-cut couple-friendly flow", "Blush Hearts frame with clean color", "Download one strip to keep or share"],
    howItWorks: ["Put both of you in frame and enable the camera.", "Use the countdown to change pose between four shots.", "Pick your final look and save the strip as one PNG."],
    faq: [
      { question: "Do both people need an account?", answer: "No. PicToFu does not require an account for the browser photobooth flow." },
      { question: "Can we use a Korean-style look instead?", answer: "Yes. You can open the related Korean Date experience or change the filter/frame in the editor." },
    ],
    related: ["korean-photobooth", "online-photobooth", "best-friend-photobooth"],
  },
  {
    slug: "best-friend-photobooth",
    title: "Best Friend Photobooth Online",
    description: "Make a best-friend photo booth collage online with a 2×2 layout, Lilac Stars frame and four-shot browser camera flow.",
    h1: "Four photos for the friends who never take just one",
    eyebrow: "Besties, chaos, one tiny grid.",
    intro: "Best Friends starts with a 2×2 layout rather than the usual vertical strip. That gives four expressions equal weight and makes the finished image especially easy to post or send after a hangout.",
    presetId: "best-friends",
    cta: "Start Best Friends booth ✦",
    highlights: ["2×2 four-photo default", "Lilac Stars frame", "One shareable PNG collage"],
    howItWorks: ["Fit everyone into the camera preview and start the four-shot set.", "Change expression between countdowns.", "Keep the grid or switch to a compatible strip before export."],
    faq: [
      { question: "Why does this preset use a grid?", answer: "The Best Friends preset uses a 2×2 default so all four photos have the same visual weight instead of reading like a long vertical strip." },
      { question: "Can I change it back to a vertical strip?", answer: "Yes. Because the preset captures four photos, compatible four-photo layouts can be selected before export." },
    ],
    related: ["korean-photobooth", "y2k-photobooth", "graduation-photobooth"],
  },
  {
    slug: "graduation-photobooth",
    title: "Graduation Photobooth Online",
    description: "Create a graduation photo strip online with a Rose Glow three-cut layout, Mint Doodle frame and browser-based PNG export.",
    h1: "A graduation photo strip for the end of one chapter",
    eyebrow: "Cap, gown, three poses, done.",
    intro: "Graduation uses a shorter three-cut strip so the result feels more like a keepsake than a long session. Rose Glow and the Mint Doodle frame make a light starting point for solo portraits or quick photos with classmates.",
    presetId: "graduation",
    cta: "Start Graduation booth 🎓",
    highlights: ["Three-cut keepsake layout", "Rose Glow with Mint Doodle", "Fast browser export after the ceremony"],
    howItWorks: ["Open the three-cut Graduation preset.", "Take three poses during the countdown sequence.", "Adjust the compatible styling and download the finished keepsake."],
    faq: [
      { question: "Why does this booth take three photos?", answer: "The Graduation preset is intentionally a shorter three-cut keepsake; its layout and capture count are different from the four-cut presets." },
      { question: "Can I use it with classmates?", answer: "Yes. As long as everyone fits comfortably in the camera frame, the browser flow works for solo or group poses." },
    ],
    related: ["best-friend-photobooth", "photo-strip-maker", "online-photobooth"],
  },
];

export const SEO_EXPERIENCE_MAP = new Map(SEO_EXPERIENCES.map((experience) => [experience.slug, experience]));

export function getSeoExperience(slug: string) {
  return SEO_EXPERIENCE_MAP.get(slug);
}
