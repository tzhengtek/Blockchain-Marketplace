import Header from "./header/header";
import Swap from "./swap/swap";
import Transaction from "./transaction/transaction";
import Exchange from "./exchange/exchange";

export default function App() {
  return (
    <div style={{ backgroundColor: "#190f5c60", minHeight: "100vh" }}>
      <Header />
      <main>
        <Swap />
        <Transaction />
        {/* <Exchange /> */}
      </main>
    </div>
  );
}
