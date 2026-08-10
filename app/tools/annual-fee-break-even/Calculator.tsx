"use client"
import { useMemo, useState } from 'react'
import CalculatorShell from '../../components/CalculatorShell'
import styles from '../../v6.module.css'

const money = new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0})
export default function Calculator(){
  const [fee,setFee]=useState(1000),[tax,setTax]=useState(18),[paid,setPaid]=useState(5),[alt,setAlt]=useState(1)
  const r=useMemo(()=>{const cost=fee*(1+tax/100),delta=(paid-alt)/100;return{cost,delta,spend:delta>0?cost/delta:0}},[fee,tax,paid,alt])
  return <CalculatorShell category="Card economics" title="Credit Card Annual Fee Break-Even Calculator" description="Estimate the annual spending needed for a paid card’s additional reward rate to recover its annual ownership cost." equation="break-even spend = annual ownership cost ÷ (paid-card effective rate − alternative effective rate)" caveats={["Use effective reward rates after caps and exclusions, not headline rates.","Run a separate scenario if the annual fee can be waived.","Give non-cash benefits a value only when you would genuinely use them."]}>
    <div className={styles.calcPanel}><section className={styles.inputPanel}><h2>Your assumptions</h2><div className={styles.fieldGrid}>
      <div className={styles.field}><label>Annual fee before tax (₹)<input type="number" min="0" value={fee} onChange={e=>setFee(+e.target.value||0)}/></label></div>
      <div className={styles.field}><label>Applicable tax on fee (%)<input type="number" min="0" value={tax} onChange={e=>setTax(+e.target.value||0)}/></label></div>
      <div className={styles.field}><label>Paid card effective reward rate (%)<input type="number" min="0" step="0.1" value={paid} onChange={e=>setPaid(+e.target.value||0)}/></label></div>
      <div className={styles.field}><label>Alternative card effective rate (%)<input type="number" min="0" step="0.1" value={alt} onChange={e=>setAlt(+e.target.value||0)}/></label></div>
    </div></section><section className={styles.resultPanel}><h2>Estimated break-even</h2><div className={styles.resultLabel}>Annual spend required</div><div className={styles.resultBig}>{r.delta>0?money.format(r.spend):'N/A'}</div><div className={styles.resultList}><div className={styles.resultRow}><span>Ownership cost</span><b>{money.format(r.cost)}</b></div><div className={styles.resultRow}><span>Incremental reward rate</span><b>{(r.delta*100).toFixed(2)}%</b></div></div></section></div>
  </CalculatorShell>
}
