import Link from "next/link";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brandBlock}>
        <Link className={styles.brand} href="/">PicToFu</Link>
        <p>No install. Open. Pose. Download.</p>
      </div>
      <nav className={styles.links} aria-label="Footer navigation">
        <Link href="/layouts">Layouts</Link>
        <Link href="/online-photobooth">Photobooth</Link>
        <Link href="/photo-strip-maker">Photo strips</Link>
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
      <p className={styles.note}>Photos stay on your device in the current PicToFu MVP.</p>
    </footer>
  );
}
