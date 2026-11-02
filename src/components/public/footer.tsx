import { getFooterNav, getSiteConfig } from "@/lib/public-data";
import { ClientFooter } from "@/components/public/client-footer";

export async function PublicFooter() {
  const [{ items }, config] = await Promise.all([getFooterNav(), getSiteConfig()]);

  return (
    <ClientFooter
      items={items}
      brandName={config.brandName}
      tagline={config.tagline}
      email={config.email}
      social={config.social}
    />
  );
}
