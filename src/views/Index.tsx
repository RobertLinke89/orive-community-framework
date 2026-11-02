"use client";
import { Layout } from "@/components/Layout";
import { MarketplaceContent } from "@/views/Marketplace";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

const Index = () => {
  return (
    <Layout>
      <AppErrorBoundary>
        <MarketplaceContent showCatalog landingHero />
      </AppErrorBoundary>
    </Layout>
  );
};

export default Index;