type ArticleImageProps = {
  src: string;
  alt: string;
  caption: string;
};

export default function ArticleImage({ src, alt, caption }: ArticleImageProps) {
  return (
    <figure style={{ margin: "32px 0", padding: 0 }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          aspectRatio: "16 / 9",
          objectFit: "cover",
          borderRadius: 18,
          border: "1px solid rgba(15, 23, 42, 0.10)",
          boxShadow: "0 18px 48px rgba(15, 23, 42, 0.12)",
        }}
      />
      <figcaption style={{ marginTop: 10, color: "#64748b", fontSize: 14, lineHeight: 1.5 }}>
        {caption}
      </figcaption>
    </figure>
  );
}
