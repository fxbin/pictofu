const SHARE_LANDING_BY_PRESET: Record<string, string> = {
  "classic-booth": "/online-photobooth",
  "korean-date": "/korean-photobooth",
  "y2k-summer": "/y2k-photobooth",
  "vintage-film": "/vintage-photobooth",
  "couple-date": "/couple-photobooth",
  "polaroid-moment": "/photo-strip-maker",
  "best-friends": "/best-friend-photobooth",
  graduation: "/graduation-photobooth",
};

export function getPresetShareLandingPath(presetId: string) {
  return SHARE_LANDING_BY_PRESET[presetId] ?? "/online-photobooth";
}

export function buildMakeYoursUrl(origin: string, presetId: string) {
  const url = new URL(getPresetShareLandingPath(presetId), origin);
  url.searchParams.set("src", "share");
  url.searchParams.set("utm_source", "pictofu_share");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "make_yours");
  url.searchParams.set("utm_content", presetId);
  return url.toString();
}
