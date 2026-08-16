import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brandBlock}>
        <a className={styles.brand} href="/">PicToFu</a>
        <p>No install. Open. Pose. Download.</p>
      </div>
      <nav className={styles.links} aria-label="Footer navigation">
        <a href="/layouts">Layouts</a>
        <a href="/online-photobooth">Photobooth</a>
        <a href="/photo-strip-maker">Photo strips</a>
        <a href="/about">About</a>
        <a href="/privacy">Privacy</a>
      </nav>
      <p className={styles.note}>Photos stay on your device in the current PicToFu MVP.</p>
    </footer>
  );
}
