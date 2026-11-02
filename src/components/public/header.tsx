import { getHeaderNav, getSiteConfig } from "@/lib/public-data";
import { ClientHeader } from "@/components/public/client-header";
import { ScrollProgress } from "@/components/motion/scroll-progress";

export async function PublicHeader() {
  const [{ items }, config] = await Promise.all([getHeaderNav(), getSiteConfig()]);

  return (
    <>
      <ScrollProgress />
      <ClientHeader items={items} brandName={config.brandName} />
    </>
  );
}
