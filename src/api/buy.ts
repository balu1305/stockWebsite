import type { NextApiRequest, NextApiResponse } from "next";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import serviceAccount from "../../../serviceAccountKey.json";

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, symbol, price, quantity } = req.body;
  const userRef = db.collection("users").doc(userId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) return res.status(404).json({ error: "User not found" });

  const userData = userSnap.data();
  const cost = price * quantity;

  if (userData.balance < cost)
    return res.status(400).json({ error: "Insufficient funds" });

  const current = userData.holdings?.[symbol] || { quantity: 0, avgBuyPrice: 0 };
  const newQty = current.quantity + quantity;
  const newAvg = ((current.quantity * current.avgBuyPrice) + cost) / newQty;

  const newHoldings = {
    ...userData.holdings,
    [symbol]: { quantity: newQty, avgBuyPrice: newAvg }
  };

  await userRef.update({
    balance: userData.balance - cost,
    holdings: newHoldings
  });

  await userRef.collection("transactions").add({
    type: "buy",
    symbol,
    price,
    quantity,
    timestamp: new Date()
  });

  res.status(200).json({ message: "Purchase successful" });
}
