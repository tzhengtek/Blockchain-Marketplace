import Header from "./header/header";
import Swap from "./swap/swap";

export default function Home() {
  return (
    <div style={{ backgroundColor: "#190f5c60", minHeight: "100vh" }}>
      <Header />
      <main
        style={{
          height: "calc(100vh - 64px)",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "1rem",
        }}
      >
        <Swap />
      </main>
    </div>
  );
}
