import "./globals.css";

export const metadata = {
  title: "School Result System",
  description: "GPA Engine & Result Processing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 min-h-screen">
        <header className="bg-indigo-600 text-white px-8 py-5 shadow-md">
          <h1 className="text-xl font-bold tracking-tight">School Result Processing System</h1>
          <p className="text-indigo-100 text-sm">GPA Engine · P08</p>
        </header>
        <div className="px-4 py-6">{children}</div>
      </body>
    </html>
  );
}