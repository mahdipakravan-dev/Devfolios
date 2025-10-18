import { useThemeStore } from "@/store/useTheme";
import Giscus from "@giscus/react";

const PortfolioComments = ({ username }: { username: string }) => {
  const { theme } = useThemeStore();
  return (
    <Giscus
      id={`giscus-comments-${username}`}
      repo="notstark/devfolios"
      repoId="R_kgDOQEqZkQ"
      category="General"
      categoryId="DIC_kwDOQEqZkc4CwyRQ"
      mapping="specific"
      term={`portfolio-${username}`}
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={theme}
      lang="en"
      loading="lazy"
    />
  );
}


export default PortfolioComments;