export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      {/* header entra aqui quando você fizer a navbar */}
      <main className="flex-1">{children}</main>
      {/* footer entra aqui quando você fizer a seção de footer */}
    </div>
  );
}