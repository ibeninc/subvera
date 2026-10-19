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
          title="Reduce review time per document from hours to minutes"
          body={
            <p>
              A manual review can take several hours. With Subvera, a review takes minutes, and the checks are applied
              consistently every time. Engineering time is then spent on the technical questions that need it.
            </p>
          }
          extra={
            <Stats
              items={[
                { value: "Minutes", label: "per document review" },
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
          title={
            <>
              Identify <span className="whitespace-nowrap">non-compliances</span> and missing information before they cause rework
            </>
          }
          body={
            <>
              <p>
                Each finding states the standard, the clause and its location in the document, so the engineer can verify it
                directly without searching.
              </p>
              <p>
                The checks are applied consistently every time, so the result does not depend on who carried out the review
                or the time available.
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
              Export the findings straight into your project comment sheet, and keep the PDF report on file. Every finished review
              is archived, ready to download again or reopen.
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
