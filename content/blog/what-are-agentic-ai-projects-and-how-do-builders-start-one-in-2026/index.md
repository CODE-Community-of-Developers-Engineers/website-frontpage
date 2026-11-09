---
title: "What Are Agentic AI Projects, and How Do Builders Start One in 2026?"
date: 2026-11-09
author: "C.O.D.E Philadelphia"
description: "A plain-language explainer on agentic AI projects: how agents work, the tools behind them, open-source options, beginner project ideas and how to build safely."
topic: "events"
tags: ["ai"]
image: "cover.webp"
---

An AI agent is software that gets a goal, decides what to do next, uses tools to act, checks the result and keeps going until the job is done or it gets stuck. That loop of plan, act, observe and adjust is the whole idea. An agentic AI project is any piece of software built around that loop, from a small script that triages your inbox to a multi-agent system that researches, writes and files a report.

<!--more-->

We run C.O.D.E Philadelphia, a volunteer-run nonprofit where developers, engineers and designers build side by side every week. Agents have become one of the most common things our members want to build, and our AI Agent Hackathon was organized around them. This guide explains the topic from the ground up: what makes a project agentic, how the pieces fit together, which tools and open-source projects builders use, which ideas suit beginners, where agents fail and why the work matters to sponsors and donors as well as to the people writing the code.

> Agentic AI projects are software systems where a language model chooses actions, calls tools and works toward a goal over several steps with limited human input. They matter to developers learning a fast-moving skill, to early-career builders who need portfolio work, and to the sponsors and donors who fund the spaces where people learn to build agents responsibly.

## Key takeaways

- An agentic AI project is defined by a loop in which a model plans, uses tools, observes results and adjusts, not by which model or framework it uses.
- Most working agents are small and narrow, with one clear goal, a few well-described tools and a human checkpoint before anything risky happens.
- Open standards such as the Model Context Protocol, now hosted by the Linux Foundation's Agentic AI Foundation, make it easier to connect agents to tools and to share source code.
- Beginners can build a real agent in a weekend if they choose a task with clear inputs, a measurable result and low stakes when the agent gets it wrong.
- Many agent projects fail from vague goals, weak evaluation and poor security, which is why hands-on practice in a community setting has value for builders and funders alike.

![Developers collaborating on agentic AI projects at a community coding session in Philadelphia](https://pub-451d10ec53cc4a789b85ceaa163ede7f.r2.dev/inline/55411e53d8be422c993e6bf24677aa4d.webp)
*Most agent projects start as small experiments built alongside other people.*

## What makes a project agentic

A project is agentic when the software, not the programmer, decides the sequence of steps needed to reach a goal. A traditional program follows a path a developer wrote in advance. An agent gets a goal and a set of tools, and the language model picks which tool to call, in what order and with what inputs, based on what it has seen so far.

The term comes from agency, the capacity to act on one's own behalf. Computer science has studied software agents for decades. The idea of an intelligent agent that perceives its environment and acts to reach goals is a core concept in the field, described in Wikipedia's entry on [intelligent agents](https://en.wikipedia.org/wiki/Intelligent_agent). What changed is that large language models can now read a messy instruction, reason about it in plain language and produce structured tool calls well enough to make general-purpose agents practical.

Agency comes in degrees. A system that asks a model to choose between two fixed branches has a little. A system that lets a model write and run its own code, browse the web and spawn helper agents has a lot. Most useful projects sit somewhere in the middle, and choosing how much autonomy to give is one of the main design decisions a builder makes.

### Chatbots, workflows and agents compared

The clearest way to see what an agent is, and is not, is to compare it with the two things people most often confuse it with: a chatbot and an automated workflow. The table shows that the difference comes down to who controls the steps.

How chatbots, AI workflows and AI agents differ

| System | Who decides the steps | Uses tools | Typical example |
| --- | --- | --- | --- |
| Chatbot | The user, one message at a time | Rarely | A help widget that answers questions |
| AI workflow | The developer, in fixed code | Yes, in a set order | Summarize every new support ticket |
| AI agent | The model, at run time | Yes, chosen as needed | Research a bug, edit code, run tests |
| Multi-agent system | Several models coordinating | Yes, split across roles | A planner agent assigning work to helpers |

Workflows are often the better choice. If you already know the exact steps, writing them as code is cheaper, faster and easier to test than asking a model to rediscover them each run. Agents earn their cost when the path varies from task to task and cannot be written out ahead of time.

## The building blocks inside every AI agent

Every AI agent, however large, is built from the same small set of parts. Knowing these parts makes any framework or repository easier to understand, because each one is just a different way of arranging them.

- A model that reads the current situation and decides the next action. This is usually a large language model accessed through an API or run locally.
- Instructions, often called a system prompt, that describe the goal, the rules and the tone the agent should follow.
- Tools, which are functions the agent can call, such as searching the web, querying a database, sending an email or running code. Each tool has a name, a description and a schema for its inputs.
- Memory, which covers the short-term conversation history in the current task and, in some projects, long-term storage the agent can search later.
- An orchestration loop, the code that sends the model its context, runs whatever tool the model asks for, feeds the result back and decides when to stop.
- Guardrails, the limits that keep the agent safe: step caps, spending limits, allowed tool lists and human approval before risky actions.
- Evaluation and logging, the records that show what the agent did and whether it did it well.

Beginners often focus on the model and the prompt. Experienced builders spend most of their time on tool descriptions, guardrails and evaluation, because those decide whether an agent behaves the same way on its hundredth run as it did in the demo.

## How the agent loop runs, step by step

An agent works by repeating a short cycle until the task is finished. The orchestration code sends the model the goal and everything that has happened so far. The model replies with either a final answer or a request to call a tool. If it asks for a tool, the code runs it, adds the result to the history and asks the model again.

Here is a stripped-down version of that loop in Python-style pseudocode. It is not tied to any framework, which makes the structure easier to see.

```text
history = [system_prompt, user_goal]
for step in range(MAX_STEPS):
    reply = model.respond(history, tools=TOOLS)
    if reply.is_final_answer:
        return reply.text
    result = run_tool(reply.tool_name, reply.tool_args)
    history.append(reply)
    history.append(result)
return "Stopped: step limit reached"
```

The first line builds the starting context from the instructions and the user's goal. The loop runs at most MAX_STEPS times, which is the simplest guardrail there is: it stops an agent from spinning forever. Inside the loop, the model sees the full history and the list of tools. If it decides it is done, the loop returns its answer. Otherwise the code runs the tool it chose, records both the request and the result, and goes around again. The last line handles the case where the agent never finishes.

Nearly every agent framework is an elaborate version of these nine lines. Frameworks add retries, parallel tool calls, streaming output, memory stores and tracing, but the core cycle stays the same.

**Planning patterns.** Some agents act one step at a time and react to each result. This pattern is often called ReAct, short for reasoning and acting. Others write a full plan first and then carry it out, revising when something fails. Plan-first agents tend to be easier to follow and audit, while step-by-step agents adapt better when the environment is unpredictable.

**Multi-agent designs.** In a multi-agent project, separate agents take separate roles, such as a researcher, a writer and a reviewer, and pass work between them. This can make each agent's job simpler, but it adds coordination problems. Many teams find that one well-equipped agent beats three loosely coordinated ones until the task is genuinely large.

## AI agent development tools and frameworks

AI agent development tools fall into three layers: the models that do the reasoning, the frameworks that run the loop, and the protocols that connect agents to outside systems. You can build an agent with nothing but a model API and a few dozen lines of code. Frameworks and protocols save time once a project grows.

### Model providers and runtimes

The model is the agent's decision-maker. Builders choose between hosted models from providers such as OpenAI, Anthropic and Google, which offer strong tool-calling ability through an API, and open-weight models that can run on a laptop or a private server through tools such as Ollama. Hosted models are usually more capable at multi-step reasoning. Local models cost nothing per call and keep data on your own machine, which matters for projects that handle private information.

For a first project, the practical test is whether the model reliably produces valid tool calls. A model that reasons well in chat but formats tool requests inconsistently will make the whole agent feel broken.

### Orchestration frameworks

Orchestration frameworks handle the loop, the tool wiring and the memory so you do not rewrite them for every project. Widely used open-source options in 2026 include LangChain and its graph-based companion LangGraph, LlamaIndex for agents that work heavily with documents, CrewAI and Microsoft's AutoGen for multi-agent setups, and the agent SDKs that model providers publish alongside their APIs.

- Use a lightweight SDK or plain code when the agent has a single goal and a handful of tools.
- Use a graph-based framework when the agent needs explicit states, branches and checkpoints you can inspect.
- Use a document-focused framework when most of the work is searching and reasoning over files, notes or knowledge bases.
- Use a multi-agent framework only when the task really splits into roles that benefit from separate instructions.

Frameworks change quickly. A tool that was standard in one year may be reorganized the next. Understanding the underlying loop protects you from that churn, because you can recognize the same parts under a new name.

### Protocols and shared standards

Protocols let agents connect to tools and data without custom glue code for every pairing. The most widely adopted is the Model Context Protocol (MCP), which defines a standard way for an agent to discover and call tools exposed by a server. A developer can write one MCP server for, say, a city open-data API, and any MCP-compatible agent can use it.

These standards now have a neutral home. The Linux Foundation [announced the Agentic AI Foundation on December 9, 2025](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation), with founding contributions of Anthropic's Model Context Protocol, Block's goose and OpenAI's AGENTS.md. Goose is an open-source agent that runs on a developer's machine. AGENTS.md is a convention for a plain-text file in a repository that tells coding agents how a project is built, tested and organized. For builders in 2026, this means the core plumbing of agent development is governed in the open, in the same way much of the internet's infrastructure is.

## Open-source agentic AI projects and source code

Open-source agentic AI projects are agents, frameworks and tools whose source code is public, so anyone can read, run and modify them. They are the fastest way to learn how working agents are built, because you can see the real prompts, tool definitions and error handling instead of a polished demo.

Open source has a long history as a way for developers to learn from each other's code, as Wikipedia's article on [open-source software](https://en.wikipedia.org/wiki/Open-source_software) describes. In the agent space, useful categories of public code include the following.

- Framework repositories, which contain example folders showing complete agents for tasks such as research, coding and customer support.
- Reference MCP servers, which show how to expose a tool, such as a file system, a database or a web search, so any agent can call it.
- Standalone open-source agents such as goose, which you can install, run against your own tasks and read line by line.
- Coding agents and command-line assistants that edit files and run tests in a local repository.
- Evaluation and tracing tools that record each step an agent takes so you can see where it went wrong.
- Community collections of example projects, where individual builders publish agents with source code and short write-ups.

### How to read an agent repository on GitHub

Most agentic AI projects with source code live on GitHub, and a repository page tells you a lot before you read any code. Learning to scan one quickly helps you decide whether a project is worth your time or safe to run.

- The README explains what the agent does, how to install it and which model keys it needs. A clear README with a working quickstart is a strong signal.
- The folders and files list shows the project's shape. Look for a tools or skills folder, a prompts folder and an examples folder, which map directly onto an agent's building blocks.
- The latest commit date and the commit history show whether the project is maintained. Agent tooling moves fast, so a long-abandoned repository may not work with current model APIs.
- Stars, watchers and forks show interest. They do not prove quality, but a forked project means other people have built on it.
- The issues tab shows what breaks for real users and how maintainers respond.
- A code of conduct file shows how the project expects contributors to treat each other, which matters if you plan to contribute.
- A security policy file explains how to report vulnerabilities. For agents that can run code or touch private data, its presence is a good sign.
- An AGENTS.md file, where present, documents how coding agents should work in the repository and doubles as a quick guide for human readers.

> Before running any open-source agent on your own machine, read which tools it can call and what permissions it asks for. An agent that can execute shell commands or send email acts with your access, so start it in a sandbox, a container or a throwaway account.

## Agentic AI projects ideas, from beginner to advanced

Good agentic AI projects ideas share three traits: a goal you can state in one sentence, tools the agent needs to vary in how it uses them, and a result you can check. If a task always follows the same steps, it is a workflow. If you cannot tell whether the agent succeeded, you cannot improve it.

### Agentic AI projects for beginners

The best first agent has one job, two to four tools and low stakes when it makes a mistake. These ideas fit that shape and can be built in a weekend with a hosted model and plain Python or JavaScript.

- A reading-list agent that takes a topic, searches the web, picks a handful of useful articles and writes a short annotated list.
- A local events agent that reads public event listings for your neighborhood and drafts a weekly plan matched to your interests.
- A study-buddy agent for bootcamp graduates that reads your notes, quizzes you and looks up explanations when you answer wrong.
- A file-tidying agent that scans a downloads folder and proposes how to rename and sort files, waiting for your approval before moving anything.
- A repository explainer that reads an unfamiliar codebase and answers questions about where things live and how they connect.
- A recipe agent that takes what is in your fridge, checks a recipe source and builds a shopping list for what is missing.
- A job-posting agent that reads listings you paste in, compares them with your resume and drafts tailored notes for each.

Each of these teaches the core skills: writing clear tool descriptions, handling a tool that returns an error and deciding when the agent should stop and ask you. Those skills carry into every larger project.

### Intermediate and advanced ideas

Once you have shipped a simple agent, harder projects add memory, more tools, more autonomy or more than one agent. These ideas suit hackathon teams and side-project builders looking for portfolio work with depth.

- An open-data agent that answers plain-language questions about city services by querying public datasets, with an MCP server you publish for others to reuse.
- A pull-request review agent that reads a change, runs the test suite, flags risky edits and writes review comments a human approves.
- A research agent with long-term memory that builds a searchable knowledge base across many sessions and cites where each fact came from.
- A nonprofit operations agent that helps a small organization draft grant reports from its own program records, with a human signing off on every claim.
- A multi-agent incident helper in which one agent reads logs, another searches past incidents and a coordinator proposes next steps.
- A browser agent that fills out repetitive web forms for accessibility, tested carefully against real sites and stopped before any submission.
- An evaluation harness that runs your own agent against dozens of test tasks and scores its success rate after every change.

The last idea is the least glamorous and arguably the most valuable. Builders who can measure an agent's reliability are rarer than builders who can make one run once.

![Hackathon team planning an AI agent project together at a whiteboard](https://pub-451d10ec53cc4a789b85ceaa163ede7f.r2.dev/inline/8925272634294b1199f1efefa9f31c58.webp)
*Agent projects tend to go better when the team agrees on the goal and the tools before writing code.*

## How AI agent development works in practice

AI agent development is an iterative cycle of defining a task, building the smallest agent that might handle it, watching it fail and fixing the cause. It looks less like writing a program from a spec and more like training a new colleague: you explain the job, watch the first attempts and clarify what you meant.

- Write the goal as a single sentence and list what a successful result looks like.
- Collect a small set of realistic test tasks, including a few that should fail or ask for help.
- Build the loop with the fewest tools that could work and a strict step limit.
- Run the test tasks and read every step of the trace, not only the final answer.
- Fix the most common failure, usually a vague tool description or a missing instruction, and run the tests again.
- Add autonomy, memory or extra tools only after the simple version succeeds reliably.
- Put a human approval step in front of any action that spends money, sends messages or changes data.

Reading traces is the habit that separates working agents from frustrating ones. When an agent picks the wrong tool, the trace usually shows why: two tools have overlapping descriptions, or a tool returned an error message the model misread. Most fixes are changes to wording, not to code.

**Cost and speed.** Every loop iteration is a model call, and long histories make each call slower and more expensive. Builders keep agents affordable by trimming old context, summarizing long tool outputs and using a smaller model for simple steps. A short agent that finishes in a few calls is easier to run and easier to trust.

**Working in a team.** On a hackathon team, the cleanest split is usually by building block. One person owns the tools, one owns prompts and evaluation, one owns the interface and the demo. Each part can be tested separately, which keeps a weekend project from collapsing in the last hour.

## Why many agent projects stall

Many agent projects stall because they start with the technology instead of a problem, then cannot show reliable results. The pattern is common enough that analysts expect a large share of agent work to be dropped. In a June report, Gartner projected that [more than 40% of agentic AI projects would be canceled by the end of 2027](https://www.sdxcentral.com/analysis/was-2025-really-the-year-of-the-ai-agent/).

That projection sits alongside fast growth. A security framework paper reports that [the market value of agentic AI reached USD 5.1 billion in 2024](https://arxiv.org/pdf/2512.18043), and the same paper cites a survey finding that [less than 1% of enterprise software included agentic AI in 2024, with nearly a third expected to by 2028](https://arxiv.org/pdf/2512.18043). Broader AI use was already climbing: McKinsey data reported by Svitla shows [regular generative-AI use rose from 65% in 2024 to 71% in 2025](https://svitla.com/blog/agentic-ai-trends-2025/) across business functions. Growth and high cancellation rates together describe a field in 2026 where demand is real but skill at shipping dependable agents is still scarce.

The reasons projects stall are consistent across company pilots and weekend builds.

- The goal is vague, so nobody can say whether the agent succeeded.
- The task has fixed steps and would work better as a plain workflow.
- There is no test set, so each change is judged by a single lucky run.
- Tool descriptions overlap or omit edge cases, and the model guesses.
- Costs grow with long histories and nobody tracks them.
- Security review comes last and blocks launch.
- The team adds more agents to fix reliability problems that more agents make worse.

Every item on that list is a skill gap, not a hardware or budget gap. People learn to avoid these mistakes by building agents, watching them fail and comparing notes with others who hit the same walls.

## Security and responsibility in agent design

Agents carry more risk than chatbots because they act. A chatbot that misreads a request gives a wrong answer. An agent that misreads a request can delete a file, send an email or spend money. Responsible design starts from the assumption that the agent will sometimes be wrong, and limits the damage when it is.

One threat is specific to agents: prompt injection, where text the agent reads, such as a web page or an email, contains instructions that try to hijack it. Wikipedia's article on [prompt injection](https://en.wikipedia.org/wiki/Prompt_injection) describes how untrusted input can override a model's intended instructions. An agent that browses the web and also has access to your inbox is exposed to exactly this risk.

- Give each agent the least access it needs: read-only where possible, and a narrow allowed-tool list.
- Require human approval before irreversible actions such as sending, paying, deleting or publishing.
- Treat everything the agent reads from outside as untrusted, and keep it separate from instructions.
- Run code-executing agents in sandboxes or containers, never directly on a machine with sensitive data.
- Log every step so a person can audit what happened and why.
- Set limits on steps, time and spending so a confused agent stops instead of looping.

Responsibility also covers who an agent affects. An agent that screens job applications or answers questions about public services can treat people unfairly if its data or instructions are skewed. Builders who test their agents against varied users and edge cases catch these problems before they reach the public.

## What a strong agent project looks like at a hackathon

A strong hackathon agent solves one clear problem, shows its reasoning live and handles at least one failure on stage without breaking. Judges and fellow builders are rarely impressed by an agent that claims to do everything. They respond to a narrow agent that works every time it is demoed.

At our AI Agent Hackathon, part of C.O.D.E Philadelphia's quarterly hackathon series, the projects that held up best shared a few habits. Teams scoped the goal early, built the tools before polishing the interface and rehearsed the demo against real inputs. Several teams showed their agent's step-by-step trace on screen, which let the room see the agent decide, act and recover.

- A one-sentence problem statement anyone in the room can repeat.
- A visible trace of the agent's steps during the demo.
- A human approval point before any consequential action.
- A short honest note on what the agent cannot do yet.
- Public source code with a README so others can run it after the event.

That last habit matters beyond the weekend. A hackathon agent with readable source code becomes a portfolio piece, a starting point for another builder and sometimes a tool a local organization actually uses.

## Why agent building matters to sponsors and donors

For sponsors and donors, agent building is a practical way to fund skills that employers and nonprofits need in 2026. The gap described above, strong demand alongside frequent project failure, is a gap in hands-on experience. Workshops and lectures help, but people learn to ship reliable agents by building them with others nearby who can help debug a broken tool call at nine at night.

That is how C.O.D.E Philadelphia is organized. According to our organization's own figures, the community has grown since its founding in 2024 to more than 5,700 members on Meetup and more than 490 active builders on Discord. Weekly coding sessions give members a regular place to work side by side, and quarterly hackathons at venues such as Pennovation Works give them deadlines and teammates. We describe ourselves as a working community, not a networking happy hour, and agent projects fit that model well because they reward iteration and shared debugging.

**For corporate sponsors and CSR managers.** Sponsorship funds venues, food and prizes for events where early-career developers, bootcamp graduates and experienced engineers build agents together. Sponsors can offer API credits, mentors who review tool design and security, or problem statements drawn from real needs. The result is a stronger local talent pool with practical agent experience.

**For recurring donors.** Regular donations keep weekly sessions free and open to builders of every skill level, including people who cannot afford paid courses. A steady session is where a beginner's first reading-list agent turns into a second, better project.

**For developers and builders.** You do not need prior agent experience to join. Bring a laptop and an idea from the lists above, or join a team at a hackathon. Our founder, Tony Siu, is an agentic AI engineer with research published at CAIP 2025, and many members have built agents of their own and are glad to look at yours.

> If you want more people in Philadelphia able to build AI agents that work reliably and safely, C.O.D.E Philadelphia is a place to make that happen. Developers can join a weekly coding session or our next hackathon. Volunteers can help run events, and companies and individuals can sponsor or donate to keep these sessions open to every builder who wants to learn.

## Sources

- [Securing Agentic AI Systems: A Multilayer Security Framework - arxiv.org](https://arxiv.org/pdf/2512.18043)
- [Linux Foundation Announces the Formation of the Agentic AI Foundation AAIF, Anchored by New Project Contributions Including Model Context Protocol MCP, goose and AGENTS.md - linuxfoundation.org](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- [Was 2025 really the year of the AI agent? - SDxCentral - sdxcentral.com](https://www.sdxcentral.com/analysis/was-2025-really-the-year-of-the-ai-agent/)
- [Agentic AI Trends 2025: From Assistants to Agents - svitla.com](https://svitla.com/blog/agentic-ai-trends-2025/)

<p class="powered-by">Powered by <a href="https://gofylo.io?utm_source=code-philly-community.pages.dev&amp;utm_medium=referral&amp;utm_campaign=powered_by" rel="sponsored">gofylo.io</a></p>

<script type="application/ld+json">[{"@context":"https://schema.org","@type":"Article","headline":"What Are Agentic AI Projects, and How Do Builders Start One in 2026?","description":"A plain-language explainer on agentic AI projects: how agents work, the tools behind them, open-source options, beginner project ideas and how to build safely.","wordCount":4408,"inLanguage":"en","author":{"@type":"Organization","name":"C.O.D.E Philadelphia"},"publisher":{"@type":"Organization","name":"C.O.D.E Philadelphia"},"keywords":"agentic ai projects","citation":["https://en.wikipedia.org/wiki/Intelligent_agent","https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation","https://en.wikipedia.org/wiki/Open-source_software","https://www.sdxcentral.com/analysis/was-2025-really-the-year-of-the-ai-agent/","https://arxiv.org/pdf/2512.18043","https://svitla.com/blog/agentic-ai-trends-2025/","https://en.wikipedia.org/wiki/Prompt_injection"]}]</script>
