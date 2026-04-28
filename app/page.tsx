import { getAllTopics } from "@/lib/mdx";
import LandingPage from "./landing-client";

export default function Home() {
  const topics = getAllTopics();
  // We only want the most recent 3 for the onboarding discovery section
  const recentTopics = topics.slice(0, 3);

  return <LandingPage recentTopics={recentTopics} />;
}
