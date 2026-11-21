import Link from "next/link";
import { FREE_PLAN, PRO_PLAN } from "@/lib/plans";

export default function PricingPage() {
  const plans = [FREE_PLAN, PRO_PLAN];

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Pricing
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Choose the plan that fits your workflow
          </h1>

          <p className="mt-4 text-lg text-muted-foreground">
            Start for free and upgrade when you need more projects, AI usage,
            and storage.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {plans.map((plan) => {
            const isPro = plan.id === "PRO";

            return (
              <section
                key={plan.id}
                className={`relative rounded-2xl border p-8 shadow-sm ${
                  isPro ? "border-primary" : ""
                }`}
              >
                {isPro && (
                  <span className="absolute right-6 top-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Recommended
                  </span>
                )}

                <h2 className="text-2xl font-bold">{plan.name}</h2>

                <p className="mt-3 min-h-12 text-muted-foreground">
                  {plan.description}
                </p>

                <div className="mt-8">
                  <span className="text-4xl font-bold">
                    {isPro ? "Pro" : "Free"}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {isPro ? "plan" : "forever"}
                  </span>
                </div>

                <div className="mt-8">
                  <h3 className="font-semibold">Usage limits</h3>

                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <li>
                      AI Assistant:{" "}
                      {plan.usageLimits.aiAssistantRequestsPerMonth} requests
                      / month
                    </li>

                    <li>
                      AI Circuit Generation:{" "}
                      {plan.usageLimits.aiCircuitGenerationsPerMonth} / month
                    </li>

                    <li>
                      Maximum projects: {plan.usageLimits.maxProjects}
                    </li>

                    <li>
                      Storage per project:{" "}
                      {plan.usageLimits.maxStoragePerProjectMB} MB
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <h3 className="font-semibold">Features</h3>

                  <ul className="mt-4 space-y-3 text-sm">
                    <li>✓ Circuit Editor</li>
                    <li>✓ Circuit Simulation</li>
                    <li>✓ Components</li>
                    <li>✓ Project Management</li>
                    <li>✓ Import & Export</li>
                    <li>✓ Truth Tables</li>
                    <li>✓ Circuit Validation</li>
                    <li>✓ AI Assistant</li>
                    <li>✓ AI Circuit Generation</li>
                  </ul>
                </div>

                <Link
                  href={isPro ? "/dashboard" : "/dashboard"}
                  className={`mt-8 block rounded-lg px-5 py-3 text-center text-sm font-semibold transition ${
                    isPro
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border hover:bg-muted"
                  }`}
                >
                  {isPro ? "Get Started with Pro" : "Start for Free"}
                </Link>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}