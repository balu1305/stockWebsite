import { Toaster } from "react-hot-toast";

export default function ToastWrapper() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#1f2937",
          color: "#fff",
          fontSize: "14px"
        },
        success: {
          icon: "✅",
        },
        error: {
          icon: "❌",
        },
      }}
    />
  );
}
