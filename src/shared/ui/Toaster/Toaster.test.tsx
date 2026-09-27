import { afterEach, expect, test } from "@jest/globals";
import { act, render, screen, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";

import { notify } from "../../lib/notify";
import { Toaster } from "./Toaster";

afterEach(() => {
  toast.dismiss();
  toast.clearWaitingQueue();
});

test("should render reusable success content and deduplicate repeated errors", async () => {
  render(<Toaster mode="light" />);
  act(() => {
    notify.success("Price alert created.", {
      autoClose: 60_000,
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

test("should update a notification's content and severity in the upper right", async () => {
  render(<Toaster mode="light" />);
  act(() => {
    notify.error("Market connection lost.", { toastId: "market-connection" });
    notify.success("Market connection restored.", { toastId: "market-connection" });
  });

  await waitFor(() =>
    expect(document.getElementById("market-connection")).toHaveTextContent(
      "Market connection restored.",
    ),
  );
  expect(screen.queryByText("Market connection lost.")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Market connection restored.");
  expect(document.querySelectorAll(".Toastify__toast-container--top-right")).toHaveLength(1);
  expect(document.querySelectorAll(".Toastify__toast-container--bottom-right")).toHaveLength(0);
});

test("should display distinct alerts immediately when more than three arrive", async () => {
  render(<Toaster mode="light" />);
  act(() => {
    for (let index = 1; index <= 4; index += 1)
      notify.warning(`Price alert ${index}`, { toastId: `price-${index}` });
  });

  expect(await screen.findAllByRole("alert")).toHaveLength(4);
  expect(screen.getByText("Price alert 4")).toBeInTheDocument();
  expect(document.querySelectorAll(".Toastify__toast-container--top-right")).toHaveLength(1);
});
