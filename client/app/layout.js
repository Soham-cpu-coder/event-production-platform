import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "EventFlow — Corporate Event Production",
  description: "Plan staging, audio/visual, keynotes and sponsor integration for multi-day conferences.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="container">{children}</main>
          <footer className="footer">EventFlow · Corporate Event Production &amp; Experience Design</footer>
        </AuthProvider>
      </body>
    </html>
  );
}
