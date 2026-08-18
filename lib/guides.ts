export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Guide = {
  slug: string;
  category: "Getting Started" | "Shooting" | "Pose Ideas" | "Output";
  title: string;
  description: string;
  h1: string;
  intro: string;
  updated: string;
  readTime: string;
  presetId?: string;
  ctaLabel: string;
  sections: GuideSection[];
  checklist: string[];
  faq: { question: string; answer: string }[];
  related: string[];
};

export const GUIDES: Guide[] = [
  {
    slug: "how-to-use-pictofu",
    category: "Getting Started",
    title: "How to Use PicToFu: Make a Photo Strip in Your Browser",
    description: "A step-by-step guide to taking or uploading photos, adjusting each shot, styling a strip, and exporting a PNG with PicToFu.",
    h1: "How to use PicToFu from first photo to finished strip",
    intro: "PicToFu is designed for a short path: choose a look, take photos or use images you already have, make small framing fixes, then export one finished strip. This guide explains the whole flow without assuming you have used an online photobooth before.",
    updated: "August 18, 2026",
    readTime: "6 min read",
    presetId: "classic-booth",
    ctaLabel: "Open the Classic Booth",
    sections: [
      {
        heading: "1. Start with a preset, not a blank canvas",
        paragraphs: [
          "A PicToFu preset gives you a useful starting combination of layout, filter, frame, and shot count. Classic Booth is neutral, while Korean Date, Y2K Summer, Best Friends, Graduation, and the other presets start with a stronger visual direction.",
          "You can still change compatible styling later. The preset is there to reduce setup time, not lock you into one result.",
        ],
      },
      {
        heading: "2. Choose camera or upload",
        paragraphs: [
          "Use the camera when you want the photobooth rhythm: countdown, pose, next shot. Use Upload photos when the pictures already exist on your phone or computer.",
          "Uploaded and camera photos follow the same review flow afterward. PicToFu processes the selected images in the browser rather than building a cloud photo gallery for your session.",
        ],
        bullets: [
          "Camera: best for a fresh four-cut session with changing poses.",
          "Upload: best for styling existing selfies, date photos, or group pictures.",
          "Mixed sets: useful when one shot needs replacing without restarting the whole strip.",
        ],
      },
      {
        heading: "3. Review every photo before styling",
        paragraphs: [
          "The Review step is where you fix composition. Drag the photo to reposition it, pinch or use the Zoom slider, adjust horizontal or vertical framing, rotate in 90-degree steps, straighten a slight tilt, or flip a selfie horizontally.",
          "The Final crop frame shows what will remain in the exported photo cell. Content outside that frame stays visible as context so you can see what is being cropped away.",
        ],
      },
      {
        heading: "4. Style the finished strip",
        paragraphs: [
          "After the photos look right, move to Style & Export. You can switch filters and frames, choose a compatible layout, arrange photo order, change the composition ratio, and add preset-aware stickers where available.",
          "If you reorder photos, the final PNG follows that same order. Treat the style step as finishing rather than repairing; large framing problems are easier to solve in Review first.",
        ],
      },
      {
        heading: "5. Export or share",
        paragraphs: [
          "Download PNG creates one finished image containing the whole strip. Share photo uses the browser or device share flow when supported. If direct file sharing is unavailable, PicToFu can show the generated image so you can save it manually.",
          "Before leaving the page, zoom in on the final preview once and check faces, crop edges, sticker placement, and photo order. That ten-second check prevents most avoidable re-exports.",
        ],
      },
    ],
    checklist: [
      "Pick the preset closest to the mood you want.",
      "Use camera or upload the photos you already have.",
      "Review crop, zoom, rotation, and framing for each shot.",
      "Choose the final layout, filter, frame, order, ratio, and stickers.",
      "Export the PNG and inspect it before sharing or printing.",
    ],
    faq: [
      { question: "Do I need an account to use PicToFu?", answer: "No. The current browser photobooth flow does not require an account." },
      { question: "Can I use photos that are already on my phone?", answer: "Yes. Use Upload photos, then review and style them just like camera shots." },
      { question: "Can I change one bad photo without restarting?", answer: "Yes. In Review you can replace an uploaded photo or retake an individual camera shot." },
    ],
    related: ["make-photo-strip-from-existing-photos", "edit-photo-strip-before-export", "better-online-photobooth-photos"],
  },
  {
    slug: "make-photo-strip-from-existing-photos",
    category: "Getting Started",
    title: "How to Make a Photo Strip From Existing Photos",
    description: "Turn photos already on your phone or computer into a PicToFu photo strip, then crop, reorder, style, and export them as one PNG.",
    h1: "Make a photo strip from photos you already have",
    intro: "You do not need to take a new set every time you want a photobooth-style result. Existing selfies, date-night photos, graduation pictures, and friend-group shots can all be arranged into a new strip as long as you choose a layout that fits the number of useful images you have.",
    updated: "August 18, 2026",
    readTime: "5 min read",
    presetId: "classic-booth",
    ctaLabel: "Upload photos to PicToFu",
    sections: [
      {
        heading: "Choose photos that can live together",
        paragraphs: [
          "A strip feels more intentional when the photos have some connection: the same day, the same people, a similar color mood, or a simple beginning-to-end sequence. They do not need identical lighting, but extremely different crops can make the result feel jumpy.",
          "Start with more candidate photos than you need if possible. It is easier to remove a weak frame than to force every image into the final layout.",
        ],
      },
      {
        heading: "Upload, then inspect orientation and crop",
        paragraphs: [
          "After upload, review each photo individually. Portrait images often need less correction in a vertical strip, while landscape photos may require more zoom or horizontal repositioning.",
          "Use the full-photo context around the Final crop frame to protect faces, hands, hats, flowers, signs, or other details that should survive the crop.",
        ],
      },
      {
        heading: "Use order to create a tiny sequence",
        paragraphs: [
          "Photo order is not just housekeeping. A four-frame strip can read like a micro-story: calm smile, closer pose, funny frame, ending pose. Drag the selected photo cards into the order that feels most natural.",
          "For a memory strip, chronological order works well. For a social post, visual rhythm can matter more than chronology, so alternate close and wider shots instead of stacking four almost identical crops.",
        ],
      },
      {
        heading: "Unify the set with restrained styling",
        paragraphs: [
          "If the source photos come from slightly different lighting conditions, a consistent filter and frame can help the strip feel like one object. Start subtle. Heavy color treatment can make skin tones or already-edited photos look inconsistent.",
          "A frame color that already appears somewhere in the photos often looks more deliberate than a random contrasting frame.",
        ],
      },
      {
        heading: "Export one finished image",
        paragraphs: [
          "PicToFu composes the selected photos into one PNG. Save that finished file rather than taking a screenshot of the browser preview; the generated PNG is the intended output artifact.",
        ],
      },
    ],
    checklist: [
      "Choose photos from one moment, people set, or visual theme.",
      "Protect important faces and details inside Final crop.",
      "Drag photos into a deliberate sequence.",
      "Use one consistent frame/filter direction across the set.",
      "Download the generated PNG instead of screenshotting the editor.",
    ],
    faq: [
      { question: "Do uploaded photos get sent to a PicToFu photo server?", answer: "The current PicToFu flow previews and composes selected photos in the browser and does not maintain a PicToFu cloud photo gallery." },
      { question: "Can I mix portrait and landscape photos?", answer: "Yes, but landscape images may need more crop and repositioning in vertical strip layouts." },
      { question: "Can I change photo order after uploading?", answer: "Yes. In the selection controls you can drag the chosen photos into the final order." },
    ],
    related: ["how-to-use-pictofu", "edit-photo-strip-before-export", "photo-strip-sizes-aspect-ratios"],
  },
  {
    slug: "better-online-photobooth-photos",
    category: "Shooting",
    title: "How to Take Better Online Photobooth Photos",
    description: "Practical lighting, camera-height, framing, timing, and pose tips for getting better four-cut and photo-strip results in a browser photobooth.",
    h1: "Take better photobooth photos before you ever touch a filter",
    intro: "The strongest photo strip usually starts with simple capture choices: soft light, a stable camera, enough room around faces, and poses that actually change between frames. Editing can refine a good shot, but it cannot fully rescue poor light or a face that started outside the frame.",
    updated: "August 18, 2026",
    readTime: "7 min read",
    presetId: "classic-booth",
    ctaLabel: "Try these tips in the Booth",
    sections: [
      {
        heading: "Put the brightest useful light in front of you",
        paragraphs: [
          "A window or soft room light in front of the camera usually produces a more forgiving face than a bright lamp directly behind you. Backlighting can turn faces dark while the background stays bright.",
          "If the light is harsh, move a little farther from it or turn so it reaches the face from an angle instead of straight above.",
        ],
      },
      {
        heading: "Raise the camera before changing your pose",
        paragraphs: [
          "A laptop sitting low on a desk often points upward. Raising it closer to eye level makes the frame feel more intentional and gives you more freedom to move without constantly correcting your chin or shoulders.",
          "On a phone, prop the device securely rather than holding it if you want consistent framing across several countdown shots.",
        ],
      },
      {
        heading: "Leave breathing room around the important parts",
        paragraphs: [
          "Do not compose every face exactly against the edge of the live camera preview. A photo strip cell may crop differently from the raw camera frame, especially after rotation, straightening, or a ratio change.",
          "Leave a little room around heads, hats, hands, graduation caps, bouquets, or two-person poses. You can crop tighter later; recreating missing pixels is not part of the current PicToFu editor.",
        ],
      },
      {
        heading: "Plan a four-frame rhythm",
        paragraphs: [
          "Instead of inventing a pose after every countdown, decide on a simple sequence before you start. For example: look at camera, look at each other, one playful gesture, then a close final frame.",
          "The goal is variation, not acrobatics. Small changes in gaze, hand position, distance, and expression are enough to make four frames feel different.",
        ],
      },
      {
        heading: "Use Review for precision, not panic",
        paragraphs: [
          "After capture, fix small problems deliberately: drag to reposition, zoom only as much as needed, straighten a tilted horizon, or rotate an incorrectly oriented image. If one photo is genuinely bad, retake that photo rather than over-editing all four to hide it.",
        ],
      },
    ],
    checklist: [
      "Face a useful light source instead of placing it directly behind you.",
      "Bring the camera close to eye level.",
      "Leave crop room around faces, hands, and props.",
      "Decide a simple pose sequence before the countdown starts.",
      "Retake a genuinely bad frame instead of forcing it through editing.",
    ],
    faq: [
      { question: "Should I use a ring light?", answer: "You can, but it is not required. A soft window or room light in front of you can work well too." },
      { question: "Why do four photobooth frames sometimes look repetitive?", answer: "The most common reason is changing only the smile. Vary gaze, hands, distance, or who is looking at whom." },
      { question: "Should I zoom in before taking the picture?", answer: "Usually it is safer to capture with a little breathing room and make a modest crop afterward." },
    ],
    related: ["photo-booth-pose-ideas", "korean-four-cut-photo-guide", "edit-photo-strip-before-export"],
  },
  {
    slug: "edit-photo-strip-before-export",
    category: "Getting Started",
    title: "How to Fix Crop, Rotation, Framing and Photo Order Before Export",
    description: "A practical PicToFu editing guide for crop, zoom, horizontal and vertical framing, rotate, straighten, flip, ratio, and photo order.",
    h1: "Fix the little things that make a photo strip feel finished",
    intro: "PicToFu is intentionally lighter than a general image editor. Its editing tools focus on the problems that matter inside a photo strip: what stays in frame, whether the image is level, how a selfie reads, and which photo appears first.",
    updated: "August 18, 2026",
    readTime: "6 min read",
    presetId: "classic-booth",
    ctaLabel: "Open the Photo Editor",
    sections: [
      {
        heading: "Crop by moving the photo, not the frame",
        paragraphs: [
          "The Final crop frame represents the output area. Drag the photo underneath it to choose which part stays. The dimmed area outside the frame is context, not part of the exported cell.",
          "This is especially useful for group photos because you can see when someone is just outside the final boundary instead of guessing through a clipped viewport.",
        ],
      },
      {
        heading: "Zoom only after position is roughly right",
        paragraphs: [
          "Start by moving the photo so the subject is near the intended location, then use zoom to tighten the composition. Zooming first often makes later horizontal or vertical correction feel more sensitive than necessary.",
          "For small precision changes, use the Horizontal and Vertical sliders rather than repeatedly dragging back and forth.",
        ],
      },
      {
        heading: "Know when to rotate and when to straighten",
        paragraphs: [
          "Rotate left/right is for quarter-turn orientation changes. Straighten is for a photo that is only slightly tilted. Using a large quarter-turn when you only need a few degrees creates more work than it solves.",
          "PicToFu applies safe-cover behavior while straightening so the final crop remains filled rather than exposing empty corners.",
        ],
      },
      {
        heading: "Flip is mostly about how a selfie feels",
        paragraphs: [
          "The horizontal Flip control can make a selfie feel more familiar when the captured orientation does not match the way you expected to see yourself. It is also useful when the visual direction of several photos feels inconsistent.",
        ],
      },
      {
        heading: "Treat ratio and order as composition decisions",
        paragraphs: [
          "The ratio setting changes the shape of the photo cells across the composition rather than inventing a different crop model for every individual image. After choosing a ratio, revisit any photo where a face moved too close to an edge.",
          "Photo order can be changed by dragging selected cards. Think in terms of sequence: strongest opener, variation in the middle, satisfying last frame.",
        ],
      },
    ],
    checklist: [
      "Reposition first, then zoom.",
      "Use Horizontal/Vertical sliders for fine correction.",
      "Use Rotate for 90-degree orientation and Straighten for small tilts.",
      "Check each photo again after changing the global composition ratio.",
      "Drag photo cards into the final storytelling order before export.",
    ],
    faq: [
      { question: "Does the dimmed area outside Final crop appear in the PNG?", answer: "No. It is editing context so you can see what is being cropped away." },
      { question: "Will straightening create blank corners?", answer: "PicToFu uses safe-cover behavior so the crop remains filled while the image is straightened." },
      { question: "Is photo order the same in the preview and exported PNG?", answer: "Yes. The selected order drives the final composition." },
    ],
    related: ["how-to-use-pictofu", "make-photo-strip-from-existing-photos", "photo-strip-sizes-aspect-ratios"],
  },
  {
    slug: "photo-booth-pose-ideas",
    category: "Pose Ideas",
    title: "Photo Booth Pose Ideas for a Four-Cut Strip",
    description: "Simple pose sequences for solo, couple, and friend four-cut photo strips that create variation without feeling forced.",
    h1: "Photo booth pose ideas that work as a four-frame sequence",
    intro: "A good four-cut strip is less about finding four perfect poses and more about making four frames feel related without looking identical. The easiest way is to change one dimension at a time: gaze, hands, distance, expression, or who interacts with whom.",
    updated: "August 18, 2026",
    readTime: "7 min read",
    presetId: "classic-booth",
    ctaLabel: "Try a four-cut sequence",
    sections: [
      {
        heading: "Sequence 1: clean to playful",
        paragraphs: [
          "Frame 1: simple eye contact with the camera. Frame 2: add one hand near the face or a small peace sign. Frame 3: exaggerate the expression. Frame 4: move closer for a tighter ending.",
          "This works because every frame changes, but the sequence still feels like the same session.",
        ],
      },
      {
        heading: "Sequence 2: look somewhere different each frame",
        paragraphs: [
          "Try camera, left, right, then back to camera. With two people, alternate between looking at the lens and looking at each other. Gaze changes are easy to execute during a short countdown and create more variety than changing clothes or props.",
        ],
      },
      {
        heading: "Sequence 3: distance as the story",
        paragraphs: [
          "Begin slightly wider, move closer in the second and third frames, then finish with the tightest crop. This is especially effective when the strip will be read from top to bottom because the visual energy increases as the viewer moves down the strip.",
        ],
      },
      {
        heading: "Sequence 4: one prop, four uses",
        paragraphs: [
          "Use one simple object such as sunglasses, a flower, graduation cap, drink cup, or small sign. Hold it normally, move it near the face, hand it to the other person, then use it as the final joke frame.",
          "Avoid large props that hide faces or leave too little crop room.",
        ],
      },
      {
        heading: "The anti-repeat rule",
        paragraphs: [
          "Before capture, decide what changes in each frame. If two consecutive ideas differ only by a slightly bigger smile, replace one with a change in gaze, hand position, distance, or interaction.",
        ],
      },
    ],
    checklist: [
      "Give every frame one visible change.",
      "Keep the first frame simple so the sequence has somewhere to go.",
      "Use gaze and hands for quick changes during a countdown.",
      "Move closer only if the camera framing still leaves safe crop room.",
      "End with the frame that has the clearest personality or interaction.",
    ],
    faq: [
      { question: "How many poses should I plan for a four-cut strip?", answer: "Plan four simple beats, but keep them easy enough to switch during the countdown." },
      { question: "What if I freeze when the countdown starts?", answer: "Use a preplanned sequence such as camera, side look, playful gesture, close-up. Simple beats are easier to remember." },
      { question: "Do I need props?", answer: "No. Gaze, hands, expression, and distance are enough to create a varied strip." },
    ],
    related: ["couple-photobooth-pose-ideas", "best-friend-photobooth-pose-ideas", "korean-four-cut-photo-guide"],
  },
  {
    slug: "couple-photobooth-pose-ideas",
    category: "Pose Ideas",
    title: "Couple Photobooth Pose Ideas for a Four-Cut Strip",
    description: "A practical four-frame pose guide for couples: eye contact, interaction, close-up framing, and playful final shots.",
    h1: "Couple photobooth poses that feel connected instead of repetitive",
    intro: "Couple strips work best when at least some frames show the relationship between the two people rather than two separate poses inside one box. You do not need dramatic choreography; small changes in gaze, shoulders, hands, and distance are enough.",
    updated: "August 18, 2026",
    readTime: "6 min read",
    presetId: "couple-date",
    ctaLabel: "Open Couple Date",
    sections: [
      {
        heading: "Four-frame date-night sequence",
        paragraphs: [
          "Frame 1: both look at camera. Frame 2: look at each other. Frame 3: lean closer or touch shoulders. Frame 4: choose the playful ending — laugh, cheek-to-cheek, tiny heart gesture, or one person looking serious while the other breaks character.",
        ],
      },
      {
        heading: "Use asymmetry so both people do not mirror every move",
        paragraphs: [
          "If both people make the exact same gesture in every frame, the strip can feel staged. Try one person looking at camera while the other looks sideways, or let only one person use a hand gesture in a frame.",
        ],
      },
      {
        heading: "Keep both faces inside the safe crop zone",
        paragraphs: [
          "Couples naturally lean apart when trying to fit shoulders into frame. Instead, move closer together and leave a little breathing room around the outer edges. During Review, check the dimmed area around Final crop to make sure neither face is being clipped.",
        ],
      },
      {
        heading: "Alternate quiet and playful frames",
        paragraphs: [
          "A strip with four exaggerated expressions can feel noisy; four calm smiles can feel flat. Alternating a clean portrait, an interaction, a playful frame, and a close finish gives the strip more rhythm.",
        ],
      },
      {
        heading: "Choose styling after the interaction works",
        paragraphs: [
          "A romantic filter or heart frame cannot create chemistry that is missing from the photos. Get the two-person composition right first, then use frame color, filter, and stickers as accents rather than the main event.",
        ],
      },
    ],
    checklist: [
      "Include at least one frame where you look at each other.",
      "Use one asymmetric pose so the sequence feels less staged.",
      "Keep both faces away from the extreme left/right crop edges.",
      "Mix quiet and playful frames.",
      "Style after you are happy with the interaction and framing.",
    ],
    faq: [
      { question: "What is an easy couple pose if we feel awkward?", answer: "Start shoulder-to-shoulder looking at camera, then simply turn and look at each other for the next frame." },
      { question: "Should every frame be romantic?", answer: "No. A playful or neutral frame often makes the romantic frames feel more natural by contrast." },
      { question: "Which PicToFu preset is a simple starting point for couples?", answer: "Couple Date starts with a four-cut layout and Blush Hearts frame; Korean Date is another softer starting look." },
    ],
    related: ["photo-booth-pose-ideas", "korean-four-cut-photo-guide", "better-online-photobooth-photos"],
  },
  {
    slug: "best-friend-photobooth-pose-ideas",
    category: "Pose Ideas",
    title: "Best Friend Photobooth Pose Ideas",
    description: "Easy photobooth pose sequences for best friends and small groups, with ideas for a 2x2 grid or four-cut strip.",
    h1: "Best friend photobooth poses with more personality than four matching smiles",
    intro: "Friend photos can handle more movement and humor than a formal portrait, but the strongest set still needs structure. Give each frame a job: establish the group, create interaction, add chaos, then finish with a frame you would actually want to keep.",
    updated: "August 18, 2026",
    readTime: "6 min read",
    presetId: "best-friends",
    ctaLabel: "Open Best Friends",
    sections: [
      {
        heading: "The 2x2 grid sequence",
        paragraphs: [
          "For a square grid, think of the four images as equally important rather than top-to-bottom story beats. Try: clean group portrait, everyone looks in a different direction, one synchronized gesture, and a final candid laugh or exaggerated expression.",
        ],
      },
      {
        heading: "Use levels instead of squeezing everyone into one line",
        paragraphs: [
          "For three or more people, change shoulder height or lean direction so every face has space. One person can sit or lean forward while others stay slightly behind, as long as no one is hidden.",
        ],
      },
      {
        heading: "Give one frame permission to be messy",
        paragraphs: [
          "A fully polished four-frame friend set can feel less memorable than one that includes a deliberately chaotic photo. Make the chaos intentional: hands up, everyone looks at one person, or one person breaks the synchronized pose.",
        ],
      },
      {
        heading: "Check the outer faces before export",
        paragraphs: [
          "Group photos are the easiest place to lose someone to crop. In Review, inspect the people on the far left and right first. If a face is too close to Final crop, reposition before adding style.",
        ],
      },
      {
        heading: "Match stickers to the group energy",
        paragraphs: [
          "A few stars, hearts, or playful preset stickers can reinforce the mood, but leave enough empty space for the photos to breathe. If every corner has a sticker, the faces stop being the focus.",
        ],
      },
    ],
    checklist: [
      "Give each frame a different group behavior.",
      "Use different heights or lean directions for groups of three or more.",
      "Include one intentionally chaotic frame.",
      "Protect the outermost faces during crop review.",
      "Use stickers as accents, not as a second subject layer.",
    ],
    faq: [
      { question: "Is a grid or vertical strip better for friends?", answer: "A 2x2 grid gives all four photos equal visual weight; a vertical strip reads more like a sequence. Choose based on the result you want." },
      { question: "How do we fit more people in frame?", answer: "Move the camera farther away if possible, use different shoulder levels, and avoid leaving large empty gaps between people." },
      { question: "Can we reorder the photos later?", answer: "Yes. PicToFu lets you drag selected photos into the final order before export." },
    ],
    related: ["photo-booth-pose-ideas", "better-online-photobooth-photos", "korean-four-cut-photo-guide"],
  },
  {
    slug: "korean-four-cut-photo-guide",
    category: "Shooting",
    title: "Korean Four-Cut Photo Guide: Poses, Framing and Sequence",
    description: "A practical guide to making a soft Korean-style four-cut photo strip with pose rhythm, close framing, and consistent styling.",
    h1: "Build a Korean-style four-cut strip around rhythm, not four random selfies",
    intro: "The recognizable four-cut feeling comes from repetition with variation: the same people and visual setup, but a different small interaction in each frame. The strip should look like one short session rather than four unrelated photos stacked vertically.",
    updated: "August 18, 2026",
    readTime: "7 min read",
    presetId: "korean-date",
    ctaLabel: "Open Korean Date",
    sections: [
      {
        heading: "Keep the camera position stable",
        paragraphs: [
          "A stable camera makes the changes between frames feel intentional. If the camera angle jumps dramatically every shot, the viewer notices the setup more than the poses.",
          "Set the phone or laptop close to eye level and let the people move inside the frame instead of moving the camera between countdowns.",
        ],
      },
      {
        heading: "Use small pose changes",
        paragraphs: [
          "Try a sequence such as: camera smile, side glance, cheek or hand gesture, then close final pose. The visual identity comes from subtle variation, not four unrelated concepts.",
        ],
      },
      {
        heading: "Favor close framing without cutting faces",
        paragraphs: [
          "Four-cut strips often feel intimate because faces occupy a useful amount of the frame. Capture with a little extra room, then tighten the crop in Review so hair, chin, and outer faces stay intentional rather than accidentally cut.",
        ],
      },
      {
        heading: "Keep color treatment consistent",
        paragraphs: [
          "A soft filter and one frame direction help the four images read as one object. The Korean Date preset starts with Rose Glow and Blush Hearts, but you can change either if another look suits the source photos better.",
        ],
      },
      {
        heading: "Use decoration sparingly",
        paragraphs: [
          "A few hearts, bows, sparkles, or text-like stickers can add the diary/booth feeling without covering expressions. Place decoration in negative space or along frame areas rather than across eyes, mouths, or important hands.",
        ],
      },
    ],
    checklist: [
      "Keep camera height and angle stable across all four shots.",
      "Change one small pose element per frame.",
      "Capture slightly wider, then tighten crop in Review.",
      "Use one consistent filter/frame direction.",
      "Place stickers in negative space instead of over faces.",
    ],
    faq: [
      { question: "What does four-cut mean in PicToFu?", answer: "In this context it means a four-photo composition, commonly arranged as a vertical strip, with a short sequence of related poses." },
      { question: "Do I have to use the Korean Date filter and frame?", answer: "No. They are preset defaults, not permanent locks." },
      { question: "Can I make a Korean-style strip from uploaded photos?", answer: "Yes. Upload existing images, then crop, order, and style them into a consistent four-photo set." },
    ],
    related: ["photo-booth-pose-ideas", "couple-photobooth-pose-ideas", "better-online-photobooth-photos"],
  },
  {
    slug: "photo-strip-sizes-aspect-ratios",
    category: "Output",
    title: "Photo Strip Sizes and Aspect Ratios Explained",
    description: "Understand classic 2x6 and 4x6 print formats, digital crop ratios, and how 1:1, 4:3, and 3:4 affect a PicToFu composition.",
    h1: "Photo strip sizes and aspect ratios without the confusing math",
    intro: "A print size and a crop ratio describe different things. A print size tells you the physical dimensions of paper; an aspect ratio tells you the shape relationship between width and height. Keeping those ideas separate makes it much easier to prepare a digital strip for sharing or printing.",
    updated: "August 18, 2026",
    readTime: "7 min read",
    presetId: "classic-booth",
    ctaLabel: "Try the ratio controls",
    sections: [
      {
        heading: "2x6 and 4x6 describe physical print formats",
        paragraphs: [
          "A 2x6-inch strip is a common classic photobooth print shape: narrow and tall. A 4x6-inch print is the familiar full photo size used by many photo labs, and it can hold one larger composition or be prepared so two narrow strips share one sheet before cutting.",
          "Digital files do not become physically 2x6 or 4x6 until you choose a print size and printer/lab settings.",
        ],
      },
      {
        heading: "1:1, 4:3, and 3:4 describe shape",
        paragraphs: [
          "1:1 is square. 4:3 is wider than it is tall. 3:4 is taller than it is wide. In PicToFu, the composition ratio changes the shape of the photo cells, which changes how much of each source image fits inside Final crop.",
        ],
      },
      {
        heading: "Why ratio changes can require a second crop check",
        paragraphs: [
          "A face that fits comfortably in 3:4 may sit closer to an edge in 1:1 or 4:3. After changing ratio, revisit photos with people near the outer edges and make a small position or zoom correction if needed.",
        ],
      },
      {
        heading: "Digital sharing does not require a print-standard size",
        paragraphs: [
          "If the strip will only be sent in a message or posted online, focus on whether the composition looks good at phone-screen size. You do not need to force every digital result into a physical print convention.",
        ],
      },
      {
        heading: "For printing, preserve the PNG and avoid screenshots",
        paragraphs: [
          "Use the generated PicToFu PNG as your source file. A screenshot can add browser chrome, scaling artifacts, or an accidental crop that makes later print preparation harder.",
        ],
      },
    ],
    checklist: [
      "Treat print size and aspect ratio as separate decisions.",
      "Use 1:1 for square cells, 4:3 for wider cells, and 3:4 for taller cells.",
      "Recheck edge faces after changing ratio.",
      "Keep the original generated PNG for later printing.",
      "Choose physical print dimensions only when you are actually preparing to print.",
    ],
    faq: [
      { question: "Is 2x6 the same thing as a 3:4 crop?", answer: "No. 2x6 is a physical print dimension, while 3:4 is an aspect ratio for width and height." },
      { question: "Which ratio is best for portraits?", answer: "There is no universal best choice. 3:4 often gives portraits more vertical room, while 1:1 can work well for close face crops or grids." },
      { question: "Does changing ratio change the original uploaded photo?", answer: "No. It changes the composition/crop view used for the output, not the source file on your device." },
    ],
    related: ["how-to-print-photo-strips", "edit-photo-strip-before-export", "make-photo-strip-from-existing-photos"],
  },
  {
    slug: "how-to-print-photo-strips",
    category: "Output",
    title: "How to Print a Photo Strip From a PNG",
    description: "Prepare a downloaded PicToFu PNG for home or photo-lab printing without accidentally stretching, cropping, or screenshotting the strip.",
    h1: "How to print a photo strip without stretching or losing the crop",
    intro: "PicToFu currently exports a digital PNG. Printing is a separate step handled by your printer, operating system, or photo lab. The main goal is to preserve the finished image and choose print settings that do not silently stretch or crop it.",
    updated: "August 18, 2026",
    readTime: "6 min read",
    presetId: "classic-booth",
    ctaLabel: "Make a strip to print",
    sections: [
      {
        heading: "Start with the downloaded PNG",
        paragraphs: [
          "Do not print a screenshot of the editor if the generated PNG is available. The downloaded file is the clean composition and avoids browser controls, accidental scaling, and screenshot crops.",
        ],
      },
      {
        heading: "Decide whether you want a narrow strip or a full 4x6 composition",
        paragraphs: [
          "Classic physical booths often use a narrow 2x6-inch strip, while 4x6-inch photo paper is a common consumer photo format. If your printer or lab only offers 4x6, you can place a narrow strip within a 4x6 canvas and trim it after printing rather than stretching the strip to fill the entire sheet.",
        ],
      },
      {
        heading: "Look for Fit, Fill, or Crop settings",
        paragraphs: [
          "Print dialogs and photo labs often offer choices that sound similar but behave differently. Fit usually preserves the whole image and may leave margins. Fill can crop edges to cover the paper. Stretch should generally be avoided because it changes proportions.",
          "Always use the print preview to check that faces, borders, and branding remain intact before confirming the job.",
        ],
      },
      {
        heading: "Use photo paper when you want a keepsake feel",
        paragraphs: [
          "Glossy, semi-gloss, or satin photo paper can make the final piece feel closer to a traditional photobooth print than plain office paper. The best choice depends on your printer and whether you prefer shine or a softer surface.",
        ],
      },
      {
        heading: "Make a test print before a batch",
        paragraphs: [
          "If you are preparing party favors, a scrapbook set, or several copies, print one sample first. Check physical size, border thickness, color, and whether the printer added unexpected margins or crop. One test sheet is much cheaper than discovering the problem after a whole batch.",
        ],
      },
    ],
    checklist: [
      "Print from the generated PNG, not a screenshot.",
      "Choose the intended physical paper size before changing layout.",
      "Avoid stretching the image to fill paper.",
      "Inspect Fit/Fill/Crop behavior in print preview.",
      "Run one test print before producing multiple copies.",
    ],
    faq: [
      { question: "Can PicToFu send a file directly to my printer?", answer: "The current product exports a PNG; printing is handled afterward by your device, printer software, or photo lab." },
      { question: "What if my photo lab only offers 4x6 prints?", answer: "A narrow strip can be placed within a 4x6 canvas and trimmed after printing instead of stretching it to fill the whole sheet." },
      { question: "Why did my printed strip lose the edges?", answer: "The print service may have used a Fill or crop-to-paper setting. Use preview and choose a fit/preserve option when available." },
    ],
    related: ["photo-strip-sizes-aspect-ratios", "how-to-use-pictofu", "make-photo-strip-from-existing-photos"],
  },
];

export const GUIDE_MAP = new Map(GUIDES.map((guide) => [guide.slug, guide]));

export function getGuide(slug: string) {
  return GUIDE_MAP.get(slug);
}

export function getGuidesByCategory() {
  return GUIDES.reduce<Record<Guide["category"], Guide[]>>(
    (groups, guide) => {
      groups[guide.category].push(guide);
      return groups;
    },
    {
      "Getting Started": [],
      Shooting: [],
      "Pose Ideas": [],
      Output: [],
    },
  );
}
