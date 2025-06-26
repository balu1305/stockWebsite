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
  const snapshot = await db.collection("users").doc(userId as string).collection("transactions").orderBy("timestamp", "desc").get();

  const transactions = snapshot.docs.map(doc => doc.data());
  res.status(200).json({ transactions });
}
