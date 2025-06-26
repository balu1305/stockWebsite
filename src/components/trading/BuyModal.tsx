import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface BuyModalProps {
  symbol: string;
  price: number;
  onConfirm: (quantity: number) => void;
  onClose: () => void;
}

export default function BuyModal({ symbol, price, onConfirm, onClose }: BuyModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("soundEnabled");
    setSoundEnabled(stored !== "false");
  }, []);

  const handleConfirm = () => {
    if (quantity < 1) {
      toast.custom((t) => (
        <div className="bg-red-600 text-white px-4 py-2 rounded shadow">⚠️ Invalid quantity</div>
      ));
      return;
    }
    if (soundEnabled) new Audio("/sounds/confirm.mp3").play();
    onConfirm(quantity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-zinc-800 text-black dark:text-white p-6 rounded shadow-md w-80"
        >
          <h3 className="text-lg font-semibold mb-2">Buy {symbol}</h3>
          <p className="text-sm mb-4">Price: ₹{price}</p>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="border p-2 w-full mb-4 rounded text-sm dark:bg-zinc-700 dark:text-white"
          />
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1 text-sm bg-gray-300 dark:bg-zinc-600 rounded">Cancel</button>
            <button onClick={handleConfirm} className="px-3 py-1 text-sm bg-green-500 text-white rounded">Confirm</button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
