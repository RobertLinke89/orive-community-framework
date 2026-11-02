import PwaRegister from "@/components/PwaRegister";
import { dezkMetadata, dezkViewport } from "@/lib/dezkMeta";

export const metadata = dezkMetadata;
export const viewport = dezkViewport;

export default function DezkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PwaRegister />
    </>
  );
}
