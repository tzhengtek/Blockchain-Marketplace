import React from "react";
import { JSX } from "react";
import "./transaction.css";
import { ArrowDownUp } from "lucide-react";

const data = [
  {
    transaction_hash: 1,
    from_address: 100,
    to_address: 200,
    value: 300,
    block_id: 1,
    contract_address: 400,
    date: "2023-01-01",
  },
  {
    transaction_hash: 2,
    from_address: 200,
    to_address: 300,
    value: 400,
    block_id: 2,
    contract_address: 400,
    date: "2023-01-02",
  },
];

export default function Transaction(): JSX.Element {
  return (
    <section className="section">
      <div className="section_header">
        <div>Hash</div>
        <div>Adress</div>
        <div>To</div>
        <div>Value</div>
        <div>Id</div>
        <div>Contract</div>
        <div>Date</div>
      </div>

      {data.map((row) => (
        <div className="data_container" key={row.transaction_hash}>
          <div>{row.transaction_hash}</div>
          <div>{row.from_address}</div>
          <div>{row.to_address}</div>
          <div>{row.value}</div>
          <div>{row.block_id}</div>
          <div>{row.contract_address}</div>
          <div>{row.date}</div>
        </div>
      ))}
    </section>
  );
}
