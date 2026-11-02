import { getOpenSourceData } from "@/lib/opensource";
import { OpenSourceLanding } from "@/components/opensource/opensource-landing";

export const revalidate = 60;

export default async function OpenSourcePage() {
  const { projects, featured, url, githubUrl } = await getOpenSourceData();

  return (
    <OpenSourceLanding
      projects={projects}
      featured={featured}
      url={url}
      githubUrl={githubUrl}
    />
  );
}
