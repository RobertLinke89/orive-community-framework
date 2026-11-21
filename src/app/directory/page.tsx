import { redirect } from "next/navigation";

// /directory -> the facilitator directory (claim/remove sub-routes stay under /directory/...).
export default function DirectoryIndex() {
  redirect("/facilitators");
}
