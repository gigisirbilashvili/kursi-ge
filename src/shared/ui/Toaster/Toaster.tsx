import { ToastContainer } from "react-toastify";

import { LATEST_SUCCESS_CONTAINER_ID } from "../../lib/toastContainers";
import type { IToasterProps } from "./types";

export function Toaster({ mode }: IToasterProps) {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={6000}
        limit={3}
        theme={mode}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        closeOnClick={false}
        aria-label="Notifications"
      />
      <ToastContainer
        containerId={LATEST_SUCCESS_CONTAINER_ID}
        position="bottom-right"
        autoClose={6000}
        limit={1}
        theme={mode}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        closeOnClick={false}
        aria-label="Pair changes"
      />
    </>
  );
}
