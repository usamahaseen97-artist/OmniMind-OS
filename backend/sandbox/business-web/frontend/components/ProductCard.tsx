export function ProductCard({ title, price }: { title: string; price: number }) {
  return (
    <article className="product-card">
      <h3>{title}</h3>
      <strong>${price.toFixed(2)}</strong>
    </article>
  );
}
