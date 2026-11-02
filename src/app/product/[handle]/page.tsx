import { redirect } from "next/navigation";

export default function ProductRedirect({ params }: { params: { handle: string } }) {
  redirect(`/shop/${params.handle}`);
}
