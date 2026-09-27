import { ToastContainer } from "react-toastify";

import type { IToasterProps } from "./types";

export function Toaster({ mode }: IToasterProps) {
  return (
    <ToastContainer
      position="top-right"
      autoClose={6000}
      newestOnTop
      theme={mode}
      pauseOnHover={false}
      pauseOnFocusLoss={false}
      closeOnClick={false}
      aria-label="Notifications"
    />
  );
}
