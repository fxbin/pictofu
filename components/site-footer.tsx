import Link from "next/link";

const footerStyles = `
  .pictofu-site-footer {
    width: min(1180px, calc(100% - 40px));
    margin: 72px auto 28px;
    padding: 24px 0 8px;
    border-top: 1px solid rgba(35, 31, 27, 0.12);
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 20px 32px;
    align-items: start;
    color: #4d4741;
  }

  .pictofu-site-footer__brand-block {
    display: grid;
    gap: 6px;
  }

  .pictofu-site-footer__brand {
    width: fit-content;
    color: #27231f;
    font-size: 1.1rem;
    font-weight: 800;
    text-decoration: none;
  }

  .pictofu-site-footer__brand-block p,
  .pictofu-site-footer__note {
    margin: 0;
    color: #746d65;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .pictofu-site-footer__links {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px 18px;
  }

  .pictofu-site-footer__links a {
    color: #4d4741;
    font-size: 0.9rem;
    font-weight: 650;
    text-decoration: none;
  }

  .pictofu-site-footer__links a:hover,
  .pictofu-site-footer__links a:focus-visible,
  .pictofu-site-footer__brand:hover,
  .pictofu-site-footer__brand:focus-visible {
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .pictofu-site-footer__note {
    grid-column: 1 / -1;
    padding-top: 4px;
  }

  @media (max-width: 640px) {
    .pictofu-site-footer {
      width: min(100% - 28px, 1180px);
      margin-top: 52px;
      grid-template-columns: 1fr;
      gap: 18px;
    }

    .pictofu-site-footer__links {
      justify-content: flex-start;
    }
  }
`;

export function SiteFooter() {
  return (
    <>
      <footer className="pictofu-site-footer">
        <div className="pictofu-site-footer__brand-block">
          <Link className="pictofu-site-footer__brand" href="/" prefetch={false}>PicToFu</Link>
          <p>No install. Open. Pose. Download.</p>
        </div>
        <nav className="pictofu-site-footer__links" aria-label="Footer navigation">
          <Link href="/layouts" prefetch={false}>Layouts</Link>
          <Link href="/online-photobooth" prefetch={false}>Photobooth</Link>
          <Link href="/photo-strip-maker" prefetch={false}>Photo strips</Link>
          <Link href="/about" prefetch={false}>About</Link>
          <Link href="/contact" prefetch={false}>Contact</Link>
          <Link href="/privacy" prefetch={false}>Privacy</Link>
        </nav>
        <p className="pictofu-site-footer__note">Photos stay on your device in the current PicToFu MVP.</p>
      </footer>
      <style>{footerStyles}</style>
    </>
  );
}
