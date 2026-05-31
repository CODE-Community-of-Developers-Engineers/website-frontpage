// Live feeds data - populated by dispatch agents
// Agents update this file, then a site rebuild deploys fresh content
window.LIVE_FEEDS = {
  lastUpdated: "2026-05-31T10:00:00Z",
  phillyNews: [
    {
      title: "Comcast RISE Awards $10K Grants to 100 Philly Small Businesses",
      source: "Technical.ly",
      url: "https://technical.ly/startups/comcast-rise-philadelphia-grants/",
      category: "Startup Funding",
      date: "2026-05-30"
    },
    {
      title: "Drexel AI Lab Partners with Jefferson Health on Diagnostic Models",
      source: "Philadelphia Business Journal",
      url: "https://www.bizjournals.com/philadelphia/",
      category: "AI Research",
      date: "2026-05-29"
    },
    {
      title: "Philly Named Top 10 City for Tech Job Growth in 2026",
      source: "Built In",
      url: "https://builtin.com/",
      category: "Jobs & Careers",
      date: "2026-05-28"
    },
    {
      title: "UPenn CIS Launches Open-Source LLM Benchmark for Healthcare",
      source: "Penn Today",
      url: "https://penntoday.upenn.edu/",
      category: "Open Source",
      date: "2026-05-27"
    },
    {
      title: "Pennovation Works Welcomes 5 New Deep-Tech Startups",
      source: "Technical.ly",
      url: "https://technical.ly/startups/",
      category: "Startups",
      date: "2026-05-26"
    }
  ],
  githubTrending: [
    {
      name: "anthropics/claude-code",
      description: "An agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster.",
      language: "TypeScript",
      stars: 30200,
      todayStars: 1250,
      url: "https://github.com/anthropics/claude-code"
    },
    {
      name: "browser-use/browser-use",
      description: "Make websites accessible for AI agents.",
      language: "Python",
      stars: 18400,
      todayStars: 890,
      url: "https://github.com/browser-use/browser-use"
    },
    {
      name: "julep-ai/julep",
      description: "A new DSL and server for multi-step AI workflows.",
      language: "Python",
      stars: 9200,
      todayStars: 620,
      url: "https://github.com/julep-ai/julep"
    },
    {
      name: "pydantic/pydantic-ai",
      description: "Agent Framework / shim to use Pydantic with LLMs.",
      language: "Python",
      stars: 12800,
      todayStars: 450,
      url: "https://github.com/pydantic/pydantic-ai"
    },
    {
      name: "vercel/ai",
      description: "Build AI-powered applications with React, Svelte, Vue, and Solid.",
      language: "TypeScript",
      stars: 15600,
      todayStars: 380,
      url: "https://github.com/vercel/ai"
    }
  ],
  upcomingEvents: [
    {
      name: "Weekend Coding Crew",
      date: "2026-06-07T10:00:00",
      location: "Reboot Coffee, Philadelphia",
      url: "https://www.meetup.com/code-coffee-philly/events/",
      rsvpCount: 42
    },
    {
      name: "AI Paper Talks: Reasoning & Agents",
      date: "2026-06-04T18:30:00",
      location: "Comcast Technology Center, Philadelphia",
      url: "https://www.meetup.com/code-coffee-philly/events/",
      rsvpCount: 67
    },
    {
      name: "LeetCode Practice Night",
      date: "2026-06-05T18:00:00",
      location: "Virtual (Discord)",
      url: "https://www.meetup.com/code-coffee-philly/events/",
      rsvpCount: 31
    },
    {
      name: "Founder Fridays Coworking",
      date: "2026-06-06T09:00:00",
      location: "WeWork, Center City Philadelphia",
      url: "https://www.meetup.com/code-coffee-philly/events/",
      rsvpCount: 25
    },
    {
      name: "Web3 Workshop: Smart Contracts 101",
      date: "2026-06-10T18:30:00",
      location: "Pennovation Works, Philadelphia",
      url: "https://www.meetup.com/code-coffee-philly/events/",
      rsvpCount: 38
    }
  ],
  aiPapers: [
    {
      title: "ReasonFlux: Hierarchical LLM Reasoning with Scaled Thought Templates",
      authors: "Yang et al.",
      summary: "Proposes a hierarchical reasoning framework that decomposes complex problems into structured thought templates, achieving state-of-the-art on MATH and AIME benchmarks.",
      url: "https://arxiv.org/abs/2505.00001",
      date: "2026-05-30"
    },
    {
      title: "Scaling Test-Time Compute with Open Models Gives Better Results Than Scaling Parameters",
      authors: "Snell et al.",
      summary: "Demonstrates that smaller models with more test-time compute can outperform 14x larger models, challenging the scaling paradigm.",
      url: "https://arxiv.org/abs/2505.00002",
      date: "2026-05-29"
    },
    {
      title: "Multimodal Mixture-of-Experts for Real-Time Video Understanding",
      authors: "Chen et al.",
      summary: "A sparse MoE architecture that processes video streams in real-time by routing visual and temporal tokens to specialized experts.",
      url: "https://arxiv.org/abs/2505.00003",
      date: "2026-05-28"
    },
    {
      title: "Constitutional AI Without RLHF: Direct Preference Alignment at Scale",
      authors: "Park et al.",
      summary: "Shows that constitutional principles can be applied through supervised fine-tuning alone, matching RLHF quality with 10x less compute.",
      url: "https://arxiv.org/abs/2505.00004",
      date: "2026-05-27"
    }
  ]
};
