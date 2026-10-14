import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { Hero } from "@/components/sections/Hero";
import { ProductShot } from "@/components/sections/ProductShot";
import { ProblemSolution } from "@/components/sections/ProblemSolution";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeatureRow, Stats } from "@/components/sections/FeatureRow";
import { WhoItIsFor } from "@/components/sections/WhoItIsFor";
import { About } from "@/components/sections/About";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { TealScope } from "@/components/visuals/TealScope";
import { NavyFindings } from "@/components/visuals/NavyFindings";
import { ExportReport } from "@/components/visuals/ExportReport";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProductShot />
        <ProblemSolution />
        <HowItWorks />

        <FeatureRow
          id="what-you-get"
          bg="mist"
          title="Get most of the day back on every document"
          body={
            <p>
              A careful manual review can take several hours. With Subvera it&apos;s closer to five minutes, even on a
              conservative estimate. Your team can spend the time on the engineering questions that actually need them.
            </p>
          }
          extra={
            <Stats
              items={[
                { value: "~5 min", label: "per document review" },
                { value: "100+", label: "documents on a typical project" },
                { value: "0", label: "per-document charges" },
              ]}
            />
          }
          visual={<TealScope />}
        />

        <FeatureRow
          bg="white"
          reverse
          title="Catch problems before they turn into rework"
          body={
            <>
              <p>
                Every finding tells you the standard, the clause and where it sits in the document, so checking it takes
                seconds rather than a search.
              </p>
              <p>
                The same checks run every time, so the result doesn&apos;t depend on who did the review or how busy they
                were that week.
              </p>
            </>
          }
          visual={<NavyFindings />}
        />

        <FeatureRow
          bg="mist"
          title="A record you can put on file"
          body={
            <p>
              Export the findings as a PDF or Word report and attach it to your review. Everyone on the project works from the
              same list.
            </p>
          }
          visual={<ExportReport />}
        />

        <WhoItIsFor />
        <About />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
