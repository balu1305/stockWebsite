import type { NextApiRequest, NextApiResponse } from "next";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import serviceAccount from "../../../serviceAccountKey.json";

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  const userRef = db.collection("users").doc(userId as string);
  const userSnap = await userRef.get();

  if (!userSnap.exists) return res.status(404).json({ error: "User not found" });

  const userData = userSnap.data();
  res.status(200).json({ balance: userData.balance, holdings: userData.holdings || {} });
}
