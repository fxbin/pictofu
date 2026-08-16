import Link from "next/link";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brandBlock}>
        <Link className={styles.brand} href="/" prefetch={false}>PicToFu</Link>
        <p>No install. Open. Pose. Download.</p>
      </div>
      <nav className={styles.links} aria-label="Footer navigation">
        <Link href="/layouts" prefetch={false}>Layouts</Link>
        <Link href="/online-photobooth" prefetch={false}>Photobooth</Link>
        <Link href="/photo-strip-maker" prefetch={false}>Photo strips</Link>
        <Link href="/about" prefetch={false}>About</Link>
        <Link href="/privacy" prefetch={false}>Privacy</Link>
      </nav>
      <p className={styles.note}>Photos stay on your device in the current PicToFu MVP.</p>
    </footer>
  );
}
