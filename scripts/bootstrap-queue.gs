/**
 * bootstrap-queue.gs
 * Run ONCE in the content-pipeline sheet to seed the Queue tab.
 * Menu: Extensions → Apps Script → run bootstrapQueue()
 */

function bootstrapQueue() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Ensure Queue tab exists with headers
  let queue = ss.getSheetByName('Queue');
  if (!queue) {
    queue = ss.insertSheet('Queue');
  }
  // Clear and reset
  queue.clearContents();
  queue.appendRow([
    'stub_id','status','topic','angle','source_urls',
    'site_slug','site_url','target_fish','pull_type','pull_url',
    'scheduled_at','notes'
  ]);
  queue.setFrozenRows(1);

  const STUBS = [
    // ── DAY 1 ──────────────────────────────────────────────────────────────
    ['INGEST-2026-06-07-A','approved',
     'Dragos SADM OT intrusion — an LLM identified an ICS gateway with no prior domain knowledge',
     'This is a visibility story, not an AI safety story. The boundary had no monitoring. The breach failed on a credential mismatch, not detection. Fix the boundary first.',
     'https://www.dragos.com/blog/ai-assisted-ics-attack-water-utility',
     '','','practitioner','site','','2026-06-07T09:00:00-04:00',''],

    ['INGEST-2026-06-07-B','approved',
     '96% of OT security incidents originate in IT — five years of stable data, no governance model change',
     'This is not a finding. It\'s a governance model indictment. Integration decisions are made without security architecture in the room. Every year.',
     'https://www.txone.com/security-reports/annual-ot-ics-cybersecurity-report-2026/',
     '','','compliance','advisory','https://dwightaspencer.com','2026-06-07T12:00:00-04:00',''],

    ['INGEST-2026-06-07-C','approved',
     'Home lab flat network is the same exposure class as the OT architecture producing 96% of industrial incidents',
     'The Purdue model isn\'t enterprise-only. If Home Assistant or any automation controller is on the same VLAN as internet-facing hosts, that\'s the architecture. VLAN segmentation is the floor.',
     'https://www.txone.com/security-reports/annual-ot-ics-cybersecurity-report-2026/',
     '','','practitioner','site','','2026-06-07T15:00:00-04:00',''],

    // ── DAY 2 ──────────────────────────────────────────────────────────────
    ['INGEST-2026-06-08-A','approved',
     'An SBOM stored in a wiki is not an SBOM — it\'s a list with no chain of custody',
     'The chain breaks the moment the document is detached from the artifact. If you can\'t cryptographically link your SBOM to the binary, procurement can ask for it and you can hand them a lie neither will catch until something burns. SLSA Level 3 is the floor.',
     'https://www.darkreading.com/application-security/sboms-in-2026-some-love-some-hate-much-ambivalence',
     '12-sbom-ai-provenance','https://dwightaspencer.com/posts/12-sbom-ai-provenance/','compliance','site',
     'https://dwightaspencer.com/posts/12-sbom-ai-provenance/','2026-06-08T09:00:00-04:00',''],

    ['INGEST-2026-06-08-B','approved',
     'CMMC Phase 2 November 2026: two readings of SR.1, one that catches supply chain attacks and one that doesn\'t',
     'Generating an SBOM satisfies SR.1 as a checkbox. Demonstrating a verifiable chain satisfies it as a control. C3PAOs are applying the latter. Five months to close the gap.',
     '',
     '12-sbom-ai-provenance','https://dwightaspencer.com/posts/12-sbom-ai-provenance/','compliance','advisory',
     'https://dwightaspencer.com','2026-06-08T12:00:00-04:00',''],

    ['INGEST-2026-06-08-C','approved',
     'Podman Quadlet: systemd as the container orchestrator you already have — podman generate systemd is deprecated',
     '.container file, systemd converts it to a service unit. journalctl for logs. systemctl for lifecycle. No daemon, rootless, git-friendly. Docker Compose on a single node → this is the migration path.',
     'https://ebourgess.dev/posts/podman-quadlet-production-containers/',
     '05-infrastructure-independence','https://dwightaspencer.com/posts/05-infrastructure-independence/',
     'practitioner','site','https://dwightaspencer.com/posts/05-infrastructure-independence/',
     '2026-06-08T15:00:00-04:00',''],

    // ── DAY 3 ──────────────────────────────────────────────────────────────
    ['INGEST-2026-06-09-A','approved',
     'AI compresses surveillance capability the same way it compressed OT attacker capability — same compression, different actor',
     'Dragos SADM: zero prior domain knowledge, one session. Same compression applies to commercial surveillance targeting. The analyst-time constraint is being removed from both.',
     'https://www.dragos.com/blog/ai-assisted-ics-attack-water-utility',
     '04-watchers-you-fed','https://dwightaspencer.com/posts/04-watchers-you-fed/',
     'community','book','https://dwightaspencer.com/posts/04-watchers-you-fed/','2026-06-09T09:00:00-04:00',''],

    ['INGEST-2026-06-09-B','approved',
     'Flock Safety ALPR + Fusus: continuous location logging, no retention limits, no independent oversight',
     'The cameras log every plate. Fusus aggregates. AI correlates. No warrant for collection, warrant required only for the query — after the record exists. Infrastructure is operational. Governance isn\'t.',
     '',
     '06-fourth-amendment-ai-surveillance','https://dwightaspencer.com/posts/06-fourth-amendment-ai-surveillance/',
     'community','book','https://dwightaspencer.com/posts/04-watchers-you-fed/','2026-06-09T12:00:00-04:00',''],

    ['INGEST-2026-06-09-C','approved',
     'Self-hosting as threat model alignment — not ideology, just matching infrastructure choices to documented risks',
     'The commercial data extraction layer is the part you control. Nextcloud, Signal, Vaultwarden, Gitea on a Quadlet stack. Threat model first. Tooling second.',
     '',
     '05-infrastructure-independence','https://dwightaspencer.com/posts/05-infrastructure-independence/',
     'community','site','https://dwightaspencer.com/posts/05-infrastructure-independence/','2026-06-09T15:00:00-04:00',''],

    // ── DAY 4 ──────────────────────────────────────────────────────────────
    ['INGEST-2026-06-10-A','approved',
     'Canarytail GitHub org deleted — not archived, deleted — warrant canary standard gone',
     'Every implementation linking to that standard now points at nothing. Canaries built on third-party dependencies you don\'t control are not canaries. DNS TXT + SSL SAN is the infrastructure-level fix. Post 09.',
     '',
     '09-after-the-canary','https://dwightaspencer.com/posts/09-after-the-canary/',
     'practitioner','site','https://dwightaspencer.com/posts/09-after-the-canary/','2026-06-10T09:00:00-04:00',''],

    ['INGEST-2026-06-10-B','approved',
     'DevOps Before DevOps: presenting Developer Operations at 2007 meetups before the term existed — IBM IP dispute followed',
     'When practitioner knowledge gets a name, vendors sell it. When vendors sell it, it becomes a role. When it becomes a role, the org chart rebuilds the silo the practice was trying to eliminate. DevSecOps is in the same cycle now.',
     '',
     '07-devops-before-devops','https://dwightaspencer.com/posts/07-devops-before-devops/',
     'practitioner','site','https://dwightaspencer.com/posts/07-devops-before-devops/','2026-06-10T12:00:00-04:00',''],

    ['INGEST-2026-06-10-C','approved',
     'GitHub Section D.8 requires you to waive your own protective terms against AI training access — and bars technical countermeasures',
     'robots.txt won\'t help. Your open-source license won\'t help. D.8 explicitly covers both. Post 02 has the clause analysis and the SourceHut migration path.',
     '',
     '02-github-tos-wont-save-you','https://dwightaspencer.com/posts/02-github-tos-wont-save-you/',
     'practitioner','site','https://dwightaspencer.com/posts/02-github-tos-wont-save-you/','2026-06-10T15:00:00-04:00',''],

    // ── DAY 5 ──────────────────────────────────────────────────────────────
    ['INGEST-2026-06-11-A','approved',
     'The Copilot meter shock is a governance signal — flat-rate pricing exempted AI tooling from controls every other cloud service gets',
     'No IAM policies. No cost alerts. No pipeline budget thresholds. No audit logging. Just a subscription. The meter is on now. Teams that didn\'t govern AI tooling are finding out simultaneously.',
     '',
     '12-copilot-meter-governance','https://dwightaspencer.com/posts/12-copilot-meter-governance/',
     'compliance','site','https://dwightaspencer.com/posts/12-copilot-meter-governance/','2026-06-11T09:00:00-04:00',''],

    ['INGEST-2026-06-11-B','approved',
     'SBOM tooling is technically complete and operationally misleading — AI-generated code provenance is the gap',
     'The SBOM accurately enumerates every package your AI-generated code depends on. It records nothing about the code being written by a model with no understanding of your architecture. CMMC Phase 2 November 2026 makes this active for DIB.',
     '',
     '12-sbom-ai-provenance','https://dwightaspencer.com/posts/12-sbom-ai-provenance/',
     'compliance','site','https://dwightaspencer.com/posts/12-sbom-ai-provenance/','2026-06-11T12:00:00-04:00',''],

    ['INGEST-2026-06-11-C','approved',
     'The geohot slop problem and the SBOM audit gap are the same bug — they compound in exactly the cases where both are worst',
     'Code generated quickly, by someone without deep context, merged because it looked right. In security contexts the failure mode is not "it breaks" — it\'s "it works until the blast radius is large." Post 13.',
     '',
     '13-ai-slop-audit-trail','https://dwightaspencer.com/posts/13-ai-slop-audit-trail/',
     'practitioner','site','https://dwightaspencer.com/posts/13-ai-slop-audit-trail/','2026-06-11T15:00:00-04:00',''],

    // ── DAY 6 ──────────────────────────────────────────────────────────────
    ['INGEST-2026-06-12-A','approved',
     'HOPE 26 submission: The Watchers You F.E.D. — Feds, Extractors, Data-brokers and the AI capability compression that connects them',
     'The book\'s thesis: you are not the product. You are the mine. The talk maps the technical architecture. Book follows pre-Labor Day 2026. Chapter preview on the site.',
     '',
     '04-watchers-you-fed','https://dwightaspencer.com/posts/04-watchers-you-fed/',
     'community','book','https://dwightaspencer.com/posts/04-watchers-you-fed/','2026-06-12T09:00:00-04:00',''],

    ['INGEST-2026-06-12-B','approved',
     'Self-hosting threat model: what it addresses, what it doesn\'t, how to decide what to run',
     'Most guides start with "you should own your data." Correct and useless. Which data? From whom? The honest threat model is four categories. Self-hosting addresses two. Post 05 has the stack without the homelab fantasy.',
     '',
     '05-infrastructure-independence','https://dwightaspencer.com/posts/05-infrastructure-independence/',
     'community','site','https://dwightaspencer.com/posts/05-infrastructure-independence/','2026-06-12T12:00:00-04:00',''],

    ['INGEST-2026-06-12-C','approved',
     'neural.sh: LLM as UNIX text filter — the shell is the right unit of composition and always was',
     'neural.vim lives in the editor. neural.sh lives in the shell. cat error.log | neural "what is causing this?" Composes with everything that speaks text streams. Built May 2023 before the category existed.',
     'https://git.sr.ht/~denzuko/neural.sh',
     '11-neural-sh','https://dwightaspencer.com/posts/11-neural-sh/',
     'practitioner','site','https://dwightaspencer.com/posts/11-neural-sh/','2026-06-12T15:00:00-04:00',''],
  ];

  for (const stub of STUBS) {
    queue.appendRow(stub);
  }

  // Format header row
  queue.getRange(1, 1, 1, 12)
    .setFontWeight('bold')
    .setBackground('#1D4E89')
    .setFontColor('#ffffff');

  // Conditional formatting: approved = green, generated = blue, skip = grey
  const range = queue.getRange(2, 2, STUBS.length, 1);
  const rules = queue.getConditionalFormatRules();
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('approved').setBackground('#c6efce').setFontColor('#276221').setRanges([range]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('generated').setBackground('#cfe2f3').setFontColor('#1155cc').setRanges([range]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('skip').setBackground('#f3f3f3').setFontColor('#999999').setRanges([range]).build());
  queue.setConditionalFormatRules(rules);

  // Auto-resize columns
  queue.autoResizeColumns(1, 12);

  SpreadsheetApp.getUi().alert(`Queue seeded with ${STUBS.length} stubs. Open the Pipeline menu → Generate drafts to populate Drafts tab.`);
}
