import { db } from "@/lib/db";
import { SettingsManager } from "@/components/admin/settings-manager";
import { ensureSocialLinksSetting } from "@/lib/migrate-social-links";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await ensureSocialLinksSetting();

  const settings = await db.siteSetting.findMany();
  const settingsMap: Record<string, any> = {};
  for (const s of settings) {
    try {
      settingsMap[s.key] = JSON.parse(s.value);
    } catch {
      settingsMap[s.key] = s.value;
    }
  }

  const navMenus = await db.navigationMenu.findMany({
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Branding, theme, social links, navigation, and list-page heroes.
        </p>
      </div>
      <SettingsManager initialSettings={settingsMap} navMenus={navMenus} />
    </div>
  );
}
