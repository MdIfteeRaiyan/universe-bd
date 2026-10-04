import type { Metadata } from "next";
import { FocusedToolShell } from "@/components/focused-tool-shell";
import { ShortlistWorkspace } from "./workspace";

export const metadata: Metadata = { title: "My Shortlist | CampusChoice BD", description: "Review university choices saved in this browser." };

export default function ShortlistPage() {
  return <FocusedToolShell eyebrow="MY SHORTLIST" title="Your saved choices, without the noise." description="Universities saved while browsing stay on this device. Review them here and return to discovery whenever you need."><ShortlistWorkspace /></FocusedToolShell>;
}
