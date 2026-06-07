#!/usr/bin/env python3
"""
generate_stubs.py — writes all 18 content stubs to data/content-queue/
Run once from stream-assets root: python scripts/generate_stubs.py
"""
import pathlib, yaml

QUEUE = pathlib.Path("data/content-queue")
QUEUE.mkdir(parents=True, exist_ok=True)

STUBS = [

  # ── DAY 1 ────────────────────────────────────────────────────────────────

  {
    "stub_id": "INGEST-2026-06-07-A",
    "status": "approved",
    "scheduled_at": "2026-06-07T09:00:00-04:00",
    "topic": "Dragos SADM OT intrusion — an LLM identified an ICS gateway with no prior domain knowledge",
    "angle": "This is a visibility story, not an AI safety story. The boundary had no monitoring. The breach failed on a credential mismatch, not detection. Fix the boundary first.",
    "source_urls": ["https://www.dragos.com/blog/ai-assisted-ics-attack-water-utility",
                    "https://www.cybersecuritydive.com/news/anthropics-claude-compromise-mexican-water-utility/819710/"],
    "site_slug": None,
    "site_url": None,
    "target_fish": "practitioner",
    "pull_type": "site",
    "pull_url": None,
  },

  {
    "stub_id": "INGEST-2026-06-07-B",
    "status": "approved",
    "scheduled_at": "2026-06-07T12:00:00-04:00",
    "topic": "96% of OT security incidents originate in IT — five years of stable data, no governance model change",
    "angle": "This is not a finding. It's a governance model indictment. Integration decisions are made without security architecture in the room. Every year.",
    "source_urls": ["https://www.txone.com/security-reports/annual-ot-ics-cybersecurity-report-2026/"],
    "site_slug": None,
    "site_url": None,
    "target_fish": "compliance",
    "pull_type": "advisory",
    "pull_url": "https://dwightaspencer.com",
  },

  {
    "stub_id": "INGEST-2026-06-07-C",
    "status": "approved",
    "scheduled_at": "2026-06-07T15:00:00-04:00",
    "topic": "Home lab flat network is the same exposure class as the OT architecture producing 96% of industrial incidents",
    "angle": "The Purdue model isn't enterprise-only. If Home Assistant or any automation controller is on the same VLAN as internet-facing hosts, that's the architecture. VLAN segmentation is the floor.",
    "source_urls": ["https://www.txone.com/security-reports/annual-ot-ics-cybersecurity-report-2026/"],
    "site_slug": None,
    "site_url": None,
    "target_fish": "practitioner",
    "pull_type": "site",
    "pull_url": None,
  },

  # ── DAY 2 ────────────────────────────────────────────────────────────────

  {
    "stub_id": "INGEST-2026-06-08-A",
    "status": "approved",
    "scheduled_at": "2026-06-08T09:00:00-04:00",
    "topic": "An SBOM stored in a wiki is not an SBOM — it's a list with no chain of custody",
    "angle": "The chain breaks the moment the document is detached from the artifact. If you can't cryptographically link your SBOM to the binary, procurement can ask for it and you can hand them a lie neither will catch until something burns. SLSA Level 3 is the floor.",
    "source_urls": ["https://www.darkreading.com/application-security/sboms-in-2026-some-love-some-hate-much-ambivalence"],
    "site_slug": "12-sbom-ai-provenance",
    "site_url": "https://dwightaspencer.com/posts/12-sbom-ai-provenance/",
    "target_fish": "compliance",
    "pull_type": "site",
    "pull_url": "https://dwightaspencer.com/posts/12-sbom-ai-provenance/",
  },

  {
    "stub_id": "INGEST-2026-06-08-B",
    "status": "approved",
    "scheduled_at": "2026-06-08T12:00:00-04:00",
    "topic": "CMMC Phase 2 November 2026: two readings of SR.1, one that catches supply chain attacks and one that doesn't",
    "angle": "Generating an SBOM satisfies SR.1 as a checkbox. Demonstrating a verifiable chain satisfies it as a control. C3PAOs in current Phase 1 assessments are applying the latter. Five months to close the gap.",
    "source_urls": [],
    "site_slug": "12-sbom-ai-provenance",
    "site_url": "https://dwightaspencer.com/posts/12-sbom-ai-provenance/",
    "target_fish": "compliance",
    "pull_type": "advisory",
    "pull_url": "https://dwightaspencer.com",
  },

  {
    "stub_id": "INGEST-2026-06-08-C",
    "status": "approved",
    "scheduled_at": "2026-06-08T15:00:00-04:00",
    "topic": "Podman Quadlet: systemd as the container orchestrator you already have — podman generate systemd is deprecated",
    "angle": ".container file, systemd converts it to a service unit. journalctl for logs. systemctl for lifecycle. No daemon, rootless, git-friendly. If you're running Docker Compose on a single node, this is the migration path.",
    "source_urls": ["https://ebourgess.dev/posts/podman-quadlet-production-containers/"],
    "site_slug": "05-infrastructure-independence",
    "site_url": "https://dwightaspencer.com/posts/05-infrastructure-independence/",
    "target_fish": "practitioner",
    "pull_type": "site",
    "pull_url": "https://dwightaspencer.com/posts/05-infrastructure-independence/",
  },

  # ── DAY 3 ────────────────────────────────────────────────────────────────

  {
    "stub_id": "INGEST-2026-06-09-A",
    "status": "approved",
    "scheduled_at": "2026-06-09T09:00:00-04:00",
    "topic": "AI compresses surveillance capability the same way it compressed OT attacker capability — same compression, different actor",
    "angle": "The Dragos SADM finding: zero prior domain knowledge, one session. The same compression applies to commercial surveillance targeting. The constraint (analyst time, domain expertise) is being removed from both.",
    "source_urls": ["https://www.dragos.com/blog/ai-assisted-ics-attack-water-utility"],
    "site_slug": "04-watchers-you-fed",
    "site_url": "https://dwightaspencer.com/posts/04-watchers-you-fed/",
    "target_fish": "community",
    "pull_type": "book",
    "pull_url": "https://dwightaspencer.com/posts/04-watchers-you-fed/",
  },

  {
    "stub_id": "INGEST-2026-06-09-B",
    "status": "approved",
    "scheduled_at": "2026-06-09T12:00:00-04:00",
    "topic": "Flock Safety ALPR + Fusus: continuous location logging, no retention limits, no independent oversight",
    "angle": "The cameras log every plate. Fusus aggregates the feeds. AI correlates the movement patterns. No warrant for the collection, warrant required only for the query — after the record exists. The infrastructure is operational. The governance isn't.",
    "source_urls": [],
    "site_slug": "06-fourth-amendment-ai-surveillance",
    "site_url": "https://dwightaspencer.com/posts/06-fourth-amendment-ai-surveillance/",
    "target_fish": "community",
    "pull_type": "book",
    "pull_url": "https://dwightaspencer.com/posts/04-watchers-you-fed/",
  },

  {
    "stub_id": "INGEST-2026-06-09-C",
    "status": "approved",
    "scheduled_at": "2026-06-09T15:00:00-04:00",
    "topic": "Self-hosting as threat model alignment — not ideology, just matching infrastructure choices to documented risks",
    "angle": "The commercial data extraction layer is the part you control. Nextcloud, Signal, Vaultwarden, Gitea on a Quadlet stack. Threat model first. Tooling second. Post 05 covers what to host and what not to.",
    "source_urls": [],
    "site_slug": "05-infrastructure-independence",
    "site_url": "https://dwightaspencer.com/posts/05-infrastructure-independence/",
    "target_fish": "community",
    "pull_type": "site",
    "pull_url": "https://dwightaspencer.com/posts/05-infrastructure-independence/",
  },

  # ── DAY 4 ────────────────────────────────────────────────────────────────

  {
    "stub_id": "INGEST-2026-06-10-A",
    "status": "approved",
    "scheduled_at": "2026-06-10T09:00:00-04:00",
    "topic": "Canarytail GitHub org deleted — not archived, deleted — warrant canary standard gone",
    "angle": "Every implementation that linked to that standard now points at nothing. This is the failure mode: canaries built on third-party dependencies you don't control are not canaries. DNS TXT + SSL SAN is the infrastructure-level fix. Post 09 on the site.",
    "source_urls": [],
    "site_slug": "09-after-the-canary",
    "site_url": "https://dwightaspencer.com/posts/09-after-the-canary/",
    "target_fish": "practitioner",
    "pull_type": "site",
    "pull_url": "https://dwightaspencer.com/posts/09-after-the-canary/",
  },

  {
    "stub_id": "INGEST-2026-06-10-B",
    "status": "approved",
    "scheduled_at": "2026-06-10T12:00:00-04:00",
    "topic": "DevOps Before DevOps: presenting Developer Operations at 2007 meetups before the term existed — and the IBM IP dispute that followed",
    "angle": "When practitioner knowledge gets a name, vendors sell it. When vendors sell it, it becomes a role. When it becomes a role, the org chart rebuilds the silo the practice was trying to eliminate. DevSecOps is in the same cycle now. Post 07.",
    "source_urls": [],
    "site_slug": "07-devops-before-devops",
    "site_url": "https://dwightaspencer.com/posts/07-devops-before-devops/",
    "target_fish": "practitioner",
    "pull_type": "site",
    "pull_url": "https://dwightaspencer.com/posts/07-devops-before-devops/",
  },

  {
    "stub_id": "INGEST-2026-06-10-C",
    "status": "approved",
    "scheduled_at": "2026-06-10T15:00:00-04:00",
    "topic": "GitHub Section D.8 requires you to waive your own protective terms against AI training access — and bars technical countermeasures",
    "angle": "robots.txt won't help. Your open-source license won't help. D.8 explicitly covers both. It's not buried — most developers haven't read it. Post 02 has the clause analysis and the SourceHut migration path.",
    "source_urls": [],
    "site_slug": "02-github-tos-wont-save-you",
    "site_url": "https://dwightaspencer.com/posts/02-github-tos-wont-save-you/",
    "target_fish": "practitioner",
    "pull_type": "site",
    "pull_url": "https://dwightaspencer.com/posts/02-github-tos-wont-save-you/",
  },

  # ── DAY 5 ────────────────────────────────────────────────────────────────

  {
    "stub_id": "INGEST-2026-06-11-A",
    "status": "approved",
    "scheduled_at": "2026-06-11T09:00:00-04:00",
    "topic": "The Copilot meter shock is a governance signal — flat-rate pricing exempted AI tooling from controls every other cloud service gets",
    "angle": "No IAM policies. No cost alerts. No pipeline budget thresholds. No audit logging. Just a subscription. The meter is on now. The teams that didn't govern AI tooling are finding out simultaneously. Post 12.",
    "source_urls": [],
    "site_slug": "12-copilot-meter-governance",
    "site_url": "https://dwightaspencer.com/posts/12-copilot-meter-governance/",
    "target_fish": "compliance",
    "pull_type": "site",
    "pull_url": "https://dwightaspencer.com/posts/12-copilot-meter-governance/",
  },

  {
    "stub_id": "INGEST-2026-06-11-B",
    "status": "approved",
    "scheduled_at": "2026-06-11T12:00:00-04:00",
    "topic": "SBOM tooling is technically complete and operationally misleading — AI-generated code provenance is the gap",
    "angle": "The SBOM accurately enumerates every package your AI-generated code depends on. It records nothing about the code that calls those packages being written by a model with no understanding of your architecture. CMMC Phase 2 November 2026 makes this active for DIB.",
    "source_urls": [],
    "site_slug": "12-sbom-ai-provenance",
    "site_url": "https://dwightaspencer.com/posts/12-sbom-ai-provenance/",
    "target_fish": "compliance",
    "pull_type": "site",
    "pull_url": "https://dwightaspencer.com/posts/12-sbom-ai-provenance/",
  },

  {
    "stub_id": "INGEST-2026-06-11-C",
    "status": "approved",
    "scheduled_at": "2026-06-11T15:00:00-04:00",
    "topic": "The geohot slop problem and the SBOM audit gap are the same bug — they compound in exactly the cases where both are worst",
    "angle": "Code generated quickly, by someone without deep context, merged because it looked right. Quality failure is most likely and audit trail is most absent in the same scenario. In security contexts the failure mode is not 'it breaks' — it's 'it works until the blast radius is large.' Post 13.",
    "source_urls": [],
    "site_slug": "13-ai-slop-audit-trail",
    "site_url": "https://dwightaspencer.com/posts/13-ai-slop-audit-trail/",
    "target_fish": "practitioner",
    "pull_type": "site",
    "pull_url": "https://dwightaspencer.com/posts/13-ai-slop-audit-trail/",
  },

  # ── DAY 6 ────────────────────────────────────────────────────────────────

  {
    "stub_id": "INGEST-2026-06-12-A",
    "status": "approved",
    "scheduled_at": "2026-06-12T09:00:00-04:00",
    "topic": "HOPE 26 submission: The Watchers You F.E.D. — Feds, Extractors, Data-brokers and the AI capability compression that connects them",
    "angle": "The book's thesis in the room: you are not the product. You are the mine. The talk maps the technical architecture. The book follows pre-Labor Day 2026. Chapter preview on the site.",
    "source_urls": [],
    "site_slug": "04-watchers-you-fed",
    "site_url": "https://dwightaspencer.com/posts/04-watchers-you-fed/",
    "target_fish": "community",
    "pull_type": "book",
    "pull_url": "https://dwightaspencer.com/posts/04-watchers-you-fed/",
  },

  {
    "stub_id": "INGEST-2026-06-12-B",
    "status": "approved",
    "scheduled_at": "2026-06-12T12:00:00-04:00",
    "topic": "Self-hosting threat model: what it addresses, what it doesn't, how to decide what to run",
    "angle": "Most guides start with 'you should own your data.' Correct and useless. Which data? From whom? The honest threat model is four categories. Self-hosting addresses two. Post 05 has the stack without the homelab fantasy.",
    "source_urls": [],
    "site_slug": "05-infrastructure-independence",
    "site_url": "https://dwightaspencer.com/posts/05-infrastructure-independence/",
    "target_fish": "community",
    "pull_type": "site",
    "pull_url": "https://dwightaspencer.com/posts/05-infrastructure-independence/",
  },

  {
    "stub_id": "INGEST-2026-06-12-C",
    "status": "approved",
    "scheduled_at": "2026-06-12T15:00:00-04:00",
    "topic": "neural.sh: LLM as UNIX text filter — the shell is the right unit of composition and always was",
    "angle": "neural.vim lives in the editor. neural.sh lives in the shell. cat error.log | neural 'what is causing this?' Composes with everything that speaks text streams. Built May 2023 before the category existed. sr.ht repo, patches welcome.",
    "source_urls": ["https://git.sr.ht/~denzuko/neural.sh"],
    "site_slug": "11-neural-sh",
    "site_url": "https://dwightaspencer.com/posts/11-neural-sh/",
    "target_fish": "practitioner",
    "pull_type": "site",
    "pull_url": "https://dwightaspencer.com/posts/11-neural-sh/",
  },

]

for stub in STUBS:
    fname = QUEUE / f"{stub['stub_id']}.yaml"
    with fname.open("w") as f:
        yaml.dump(stub, f, allow_unicode=True, default_flow_style=False, sort_keys=False)
    print(f"wrote {fname}")

print(f"\n{len(STUBS)} stubs written to {QUEUE}/")
