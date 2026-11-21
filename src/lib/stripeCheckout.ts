export async function createCheckoutSession(): Promise<string> {
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to create checkout session"
    );
  }

  if (!data.url) {
    throw new Error("Checkout URL was not returned.");
  }

  return data.url;
}