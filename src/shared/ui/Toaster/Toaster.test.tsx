import { afterEach, expect, test } from "@jest/globals";
import { act, render, screen } from "@testing-library/react";
import { toast } from "react-toastify";

import { notify } from "../../lib/notify";
import { ToastMessage } from "../ToastMessage/ToastMessage";
import { Toaster } from "./Toaster";

afterEach(() => {
  toast.dismiss();
  toast.clearWaitingQueue();
});

test("should render reusable success content and deduplicate repeated errors", async () => {
  render(<Toaster mode="light" />);
  act(() => {
    toast.success(<ToastMessage message="Price alert created." />, {
      autoClose: 60_000,
      role: "status",
    });
    notify.error("Storage is unavailable.", {
      toastId: "storage-test",
      autoClose: 60_000,
    });
    notify.error("Storage is unavailable.", {
      toastId: "storage-test",
      autoClose: 60_000,
    });
  });

  expect(await screen.findByRole("status")).toHaveTextContent(
    "Price alert created.",
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Storage is unavailable.",
  );
  expect(screen.getAllByText("Storage is unavailable.")).toHaveLength(1);
});
