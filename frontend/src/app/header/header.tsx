import { JSX } from "react";
import "./header.css";

const navigation: { name: string; href: string }[] = [
  { name: "Swap", href: "#swap" },
  { name: "Exchange", href: "#exchange" },
  { name: "Transaction", href: "#transaction" },
];

export default function Header(): JSX.Element {
  return (
    <header className="header">
      <div className="container">
        <div className="inner">
          <span className="brand">Blockchain Project</span>

          <nav className="nav">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="nav-item">
                {item.name}
              </a>
            ))}
          </nav>

          <div className="actions">
            <button type="button" className="connect-button">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>

      <div className="mobile-menu">
        <div className="mobile-links">
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className="mobile-link">
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
