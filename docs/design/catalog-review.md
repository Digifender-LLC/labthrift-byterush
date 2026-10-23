# ByteRush catalog review (roadmap C02)

Review date: 2026-10-03. Canonical roadmap: [ROADMAP.md](../ROADMAP.md) (C02).

**Edits applied with this review.** The four "Needs edit" results below were fixed in the same change, along with the leftover Runs wording. Project IDs, beat IDs, graph shape, gear effects and counts are unchanged, and `npm test` (graph/topic/gear validator plus traversal tests) passes.

| Project / beat | Change |
|---|---|
| first-weekend / `update` | Explanation of `sudo` moved out of a code fence so it renders as prose, not a copyable command |
| first-weekend / `ssh-checkbox` | "the SSH run" → "SSH from the couch" |
| first-ssh / `denied` | Dropped "(unless you set a root password on purpose)" to match the guide's "Skip root login over SSH" |
| immich-make-it-better / `users` | Choice label now says it keeps Immich marked installed |
| start-with-what-you-have / `daily-caution`, `marketplace-wipe`, `ready` | "plan" wording replaced so it cannot be read as the separate Plan app |
| prism-intro / `start`, photos-backup-pick / `skip`, first-backup / `pick-immich` | "run" as a noun for a walkthrough replaced with "walkthrough" |

The result column and notes below record the state found before these edits. Items marked "Pass with notes" are recorded for editorial follow-up and were not changed. **Prism decision (2026-10-04):** Ender chose a full walkthrough. `prism-intro` is now a 16-beat, 4-branch PhotoPrism first install that follows the new `/guides/prism` guide (labthrift PR #5) step for step: read-only, house network only, reading the house share. The catalog totals are now 179 beats and 33 branch points. The notes for project 14 below describe the earlier stub. **Immich (2026-10-04):** both Immich projects now follow the new `/guides/immich` guide's commands (requirements check, Docker script, release files and `.env`, health check, first admin, phone backup, disk check, nightly-dump backup, extra user, updates) with their beat graphs unchanged. All 17 projects have now been compared with a source guide; C02 is complete once this change merges.

**Scope.** All 17 project graphs in `src/content/projects/*.json` (179 beats, 33 branch points; this matches `tests/projects.test.ts`). Each one was checked against its `sourceGuide` source in `labthrift/` (the HTML in `guides/<slug>.html` and the Markdown twin in `md/guides/<slug>.md`). Runtime wording in `src/components/feed/ProjectView.tsx` was also checked, because it frames every walkthrough.

**Criteria.**
1. Agreement with the source guide's steps and commands.
2. Command prerequisites stated before the commands are used.
3. Branch choices are explicit and completion wording is clear.
4. Anything referring to the separate Labthrift Plan app is labeled as Plan.
5. No claim that the app reads or detects installed equipment.

**Results.** Each project gets Pass, Pass with notes, or Needs edit.

**Global observations**
- **Criterion 5 holds across the catalog.** No beat claims the app reads, scans or detects the learner's equipment. Gear status changes only through `setsStatus` on choices the learner taps. The runtime adds two clarifying lines:
  - "Completing a walkthrough records learning, not an installation."
  - "Your gear only changes when you explicitly choose a gear status."

  One choice label, `immich-make-it-better` / `users`, does not show its status effect. See that project's notes.
- **Plan labeling.** `ProjectView.tsx` shows "These instructions are for the separate Labthrift Plan app and its account." for `lab-plan-passkeys` only, and only on the intro screen, not while the steps are running. The website names the product "Lab plan" (plan.labthrift.com), and the project beats follow that name.
- **Leftover Runs wording.** "run" is still used as a noun for a walkthrough in three places:
  - `first-weekend` / `ssh-checkbox`: "the SSH run"
  - `prism-intro` / `start`: "This run is a stub"
  - `photos-backup-pick` / `skip`: "house-folder backup run"
- **Missing sources (resolved).** When first reviewed, `https://labthrift.com/guides/immich` and `/guides/prism` had no source anywhere in the website repo. Both now exist as `guides/<slug>.html` with Markdown twins (C01, labthrift#4 and #5); live acceptance waits on that deploy. The original finding follows. There is no `guides/immich.html`, `guides/prism.html` or Markdown twin, and a grep for "immich" or "prism" across the website repo finds nothing. Three projects point at these URLs, and the UI labels them "Source guide · currently unavailable". This is roadmap item C01.
- **Missing Markdown twins.** `add-local-dns-name` and `when-house-disk-full` have HTML sources but no Markdown twin in `md/guides/`. This is relevant to C01's "matching Markdown representations".
- **Shared source URL.** Fifteen unique source URLs cover the 17 projects. `first-backup` and `photos-backup-pick` share `/guides/first-backup`, and the two Immich projects share `/guides/immich`.

## Summary table

| # | Project id | Title | Source guide (website repo) | Beats / branch points | Scope | Result |
|---|---|---|---|---|---|---|
| 1 | 12u-vs-10-inch-closet-rack | 12U open frame vs 10-inch wall cabinet | guides/12u-vs-10-inch-closet-rack.html + md twin. Exists | 5 / 1 | Short buying decision; full coverage of a short guide | Pass |
| 2 | 2-5g-switch | A faster switch for a first home lab | guides/2-5g-switch.html + md twin. Exists | 6 / 2 | Short buying decision; full coverage | Pass |
| 3 | add-local-dns-name | Add a local name in Pi-hole | guides/add-local-dns-name.html. Exists; **no md twin** | 6 / 1 | Condensed four-step walkthrough | Pass with notes |
| 4 | cheap-poe | Power two Wi-Fi points from one small switch | guides/cheap-poe.html + md twin. Exists | 6 / 1 | Short buying decision; full coverage | Pass with notes |
| 5 | first-backup | A backup of the house folder | guides/first-backup.html + md twin. Exists | 9 / 3 | Condensed walkthrough plus photo-interest branch (not in guide) | Pass with notes |
| 6 | first-file-share | A file share | guides/first-file-share.html + md twin. Exists | 7 / 1 | Condensed full walkthrough | Pass with notes |
| 7 | first-ssh | SSH from the couch | guides/first-ssh.html + md twin. Exists | 21 / 3 | Full walkthrough, expanded troubleshooting | **Needs edit** |
| 8 | first-weekend | Your first weekend | guides/first-weekend.html + md twin. Exists | 21 / 1 | Full nine-step walkthrough, expanded | **Needs edit** |
| 9 | immich-first-weekend | Immich: first weekend | guides/immich.html + md twin. Exists (shared URL) | 8 / 2 | Short setup walkthrough following the published guide's commands | Pass with notes |
| 10 | immich-make-it-better | Immich: make it better | guides/immich.html + md twin. Exists (shared URL) | 6 / 1 | Short follow-up following the published guide | Fixed (label edit applied) |
| 11 | lab-plan-passkeys | Keep a lab plan with a passkey, not an email | guides/lab-plan-passkeys.html + md twin. Exists | 6 / 1 | Short explainer of the Plan app; full coverage | Pass with notes |
| 12 | local-chat-on-the-pc | Run a local chat on the old PC | guides/local-chat-on-the-pc.html + md twin. Exists | 6 / 1 | Condensed full walkthrough | Pass with notes |
| 13 | photos-backup-pick | Photo backup: pick a path | guides/first-backup.html + md twin. Exists (shared URL) | 6 / 2 | Interest picker; content not in the source guide | Pass with notes |
| 14 | prism-intro | PhotoPrism first install | guides/prism.html + md twin. Exists | 16 / 4 | **Full first-install walkthrough** (decided 2026-10-04); read-only, house network only | Pass with notes (scope accepted) |
| 15 | start-with-what-you-have | Start with what you already have | guides/start-with-what-you-have.html + md twin. Exists | 21 / 3 | Full walkthrough, expanded | **Needs edit** |
| 16 | what-os-to-pick | What OS to put on it | guides/what-os-to-pick.html + md twin. Exists | 22 / 4 | Full walkthrough, expanded | Pass with notes |
| 17 | when-house-disk-full | When the computer's disk is full | guides/when-house-disk-full.html. Exists; **no md twin** | 7 / 2 | Condensed troubleshooting walkthrough | Pass with notes |

Totals: 179 beats and 33 branch points, recounted from the catalog JSON on 2026-10-22 (it was 168 and 30 before the Prism expansion). Results as first recorded on 2026-10-03: 2 Pass, 11 Pass with notes, 4 Needs edit. The four Needs edit items (7, 8, 10, 15) were fixed in the same change, and the rows for projects 9, 10 and 14 were refreshed after the 2026-10-04 guide work.

## Per-project notes

### 1. 12u-vs-10-inch-closet-rack: Pass
- **Agreement:** Matches the guide. It covers the 2POSTRACK12 default (guide: Amazon $155.99; project: "about $156 this pass"), RK12WALHM with "Recheck the live price", the NavePoint 6U 10-inch as not the default, and the same Skip list.
- **Prerequisites:** No commands.
- **Choices and completion:** The three choices on `start` are explicit. Every branch continues to the `skip` end beat.
- **Plan and gear:** No Plan reference and no detection claims.
- **Minor note:** "this pass" prices are undated in the app. The guide dates them 22 Aug 2026.

### 2. 2-5g-switch: Pass
- **Agreement:** Matches the guide: TL-SG108S-M2 default, TEG-S380 warranty pick, TEG-3102WS managed. The guide's TL-SG108-M2 row is omitted, which is acceptable.
- **Choices and completion:** Clear choices on `start` and `pick`. All four end beats are explicit.
- **Plan and gear:** None.

### 3. add-local-dns-name: Pass with notes
- **Agreement:** It follows the guide's four steps and the gating rule ("Skip until a phone on house Wi-Fi already has ads gone").
- **Prerequisites:**
  - `start` correctly gates on Pi-hole already being house DNS.
  - `lock` says "hostname -I" but not where to run it. The guide says "From SSH".
  - `add` omits the guide's note that the login uses the Pi-hole admin password, not the Linux SSH password.
  - `prove` lists `ping`, `dig`, ssh and smb tests but does not say to run them from a laptop on house Wi-Fi. The guide does.
- **Choices:** Explicit.
- **Cross-catalog note:** `name` says "Skip .local". `first-ssh` / `cmd` uses the example `ssh labuser@lab.local`.
- **Source gap:** No Markdown twin (C01).

### 4. cheap-poe: Pass with notes
- **Agreement:** Matches the guide's table and AP advice.
- **Note for website editorial:** `sixteen` says "TL-SG1016PE ... ~150W". That matches the guide's table, but the guide's own Sources line says "110 W on the US maker page". The source is inconsistent with itself, and the project copies the table value.
- **Choices and completion:** The four choices are explicit, and all of them continue to the `aps` end beat.

### 5. first-backup: Pass with notes
- **Agreement:** The USB, other-PC and after-copy steps and commands match the guide: `lsblk`, `sudo mkdir -p /mnt/backup && sudo mount /dev/sdb1 /mnt/backup`, `rsync -a /srv/share/ /mnt/backup/share/`, `sudo umount /mnt/backup`. The photo-interest branch (`photos-ask` → `photos-pick` → `pick-immich` / `pick-prism` / `done`) is not in the source guide. It was carried over from Runs.
- **Prerequisites:**
  - `start` does not say that you need to be SSH'd into the lab box or that it assumes the `/srv/share` folder from the file-share project. The guide states both ("This assumes the share from a file share ... SSH in from the couch").
  - `other-pc` does state its prerequisite ("If SSH already works on the second box").
  - `after` says "Confirm files landed" without saying how. The guide links a separate check note.
- **Choices:** Explicit. The status effects (photos interested or skipped, immich or prism interested) match the labels. "Immich sounds right" sets immich interested without saying so, but the question frames it as picking a direction.
- **Prism wording:** `pick-prism` states the limited scope: "Prism intro is a short stub".

### 6. first-file-share: Pass with notes
- **Agreement:** Folder, Samba install, `smb.conf` block, `smbpasswd`, restart, open paths, `chown` fix and ufw fix all match the guide.
- **Prerequisites:**
  - `start` says "SSH in first". It does not state the Debian/Ubuntu assumption the guide makes.
  - `samba` asks you to add a block to `/etc/samba/smb.conf` without saying how to edit it, for example with `sudo nano`. The guide also leaves this out.
- **Completion:** `chown` and `ufw` are end beats that say "then try again" or "Confirm with sudo ufw status". Finishing the walkthrough does not confirm the fix worked. Acceptable given the runtime's "records learning" note.

### 7. first-ssh: **Needs edit**
- **Agreement:** It largely matches the guide (command, host key, two usual failures, `sudo ufw allow OpenSSH`, no port forwarding, keys later) and adds troubleshooting.
- **Issue:** Beat `denied` says: "Use the user you created at install — not Administrator, not root (unless you set a root password on purpose), not pi unless you named it pi."
  - The guide says "not Administrator, not pi unless you named it pi" and, under Skip, "Skip root login over SSH".
  - Ubuntu and Debian OpenSSH defaults also reject root password login (`PermitRootLogin prohibit-password`).
  - The parenthetical invites a login path the guide rules out.
  - **Minimal fix:** "Use the user you created at install — not Administrator, not root, not pi unless you named it pi."
- **Prerequisites (note):** The guide states up front that openssh-server must be installed (the SSH checkbox at install). The project only covers this on the refused path (`refused-fix`).
- **Address example (note):** `cmd` uses "ssh labuser@lab.local". This conflicts with `add-local-dns-name`'s "Skip .local", and `.local` names depend on mDNS, which a default server install may not provide. Consider dropping that example.
- **Choices and completion:** Explicit, and `end` says "You have reached the end of this walkthrough".
- **Plan and gear:** Not mentioned.

### 8. first-weekend: **Needs edit**
- **Agreement:** It matches the guide's nine steps and expands them with stuck paths. It adds Rufus and Esc/F2 boot keys, which are reasonable additions.
- **Issue (rendering):** Beat `update` puts its explanation inside a second code fence:

  ````
  ```
  sudo = "do this as the administrator for one command." It will ask your password again. Let it finish; reboots if it asks.
  ```
  ````

  `ProjectView` renders every `\n\n` paragraph that starts with a triple backtick as a copyable `CodeBlock`. Learners therefore see this prose as a command to copy.
  - **Minimal fix:** Remove the fence lines around that sentence so it renders as prose. The command block `sudo apt update && sudo apt upgrade` stays as it is.
- **Issue (terminology):** Beat `ssh-checkbox` says "covered again in the SSH run". "Run" is retired Runs vocabulary.
  - **Minimal fix:** "covered again in SSH from the couch."
- **Completion:** Clear. `end` says "Check each on your own machine; finishing this walkthrough does not verify it." That is good, explicit no-verification wording.
- **Plan and gear:** Neither is mentioned.

### 9. immich-first-weekend: Pass with notes
- **Update (2026-10-04):** the guide now exists and the project follows its commands. The notes below were written against the earlier 404.
- **Source:** `https://labthrift.com/guides/immich` is **missing (404)**, with no HTML or Markdown in the website repo, so agreement with a source could not be checked. The content (Docker plus Compose, official compose file and `.env`, `UPLOAD_LOCATION`, web UI on port 2283, phone app on the LAN, no public exposure) is internally consistent. This review did not compare it against a source.
- **Prerequisites:** `prereq` states the Docker, Compose, disk and LAN prerequisites, and `need-docker` gives the check (`docker compose version`).
- **Choices:** Explicit, and the status effects come from the learner's own declaration.
  - **Label note:** "Uploads work — mark Immich installed" also sets `photos` installed, which the label does not mention.
  - **Optional fix:** "Uploads work — mark Immich and photos installed".

### 10. immich-make-it-better: Fixed
- **Update:** the label fix below was applied, and the project now follows the published guide. The notes below describe the state found before the edit.
- **Source:** `guides/immich` is **missing (404)**.
- **Issue (unlabeled gear status):** On beat `users`, the choice "Done for now" carries `setsStatus: [{itemId: "immich", status: "installed"}]`. The label does not say it changes gear status. The runtime promises "Your gear only changes when you explicitly choose a gear status." A learner who opens this from the feed without having marked Immich installed would have it marked silently.
  - **Minimal fix:** Change the label to "Done for now — keep Immich marked installed".
- **Other notes:**
  - `disk` and `backup-immich` give guidance without exact commands (for example, the Immich database dump is not spelled out).
  - "I want the lighter Prism path instead" sets prism interested, which the label implies.

### 11. lab-plan-passkeys: Pass with notes
- **Agreement:** It matches the guide closely: optional, username plus passkey, no email recovery, export before wiping, add a second passkey.
- **Plan labeling:** The project uses the website's product name, "Lab plan", and "the optional plan app". ByteRush shows "These instructions are for the separate Labthrift Plan app and its account." on the intro screen. That banner is not shown while the steps are running.
  - **Optional, for consistency:** In `start`, change "Lab plan is an optional checklist ..." to "Lab plan (the separate Labthrift Plan app) is an optional checklist ...".
- **Gear:** `what` says the Plan workspace lets you "list gear". That is user-entered data, not detection.
- **Choices and completion:** Explicit.

### 12. local-chat-on-the-pc: Pass with notes
- **Agreement:** Commands match the guide: `free -h`, `df -h ~`, the install script, `ollama -v`, `systemctl is-active ollama`, the pulls, `ollama run`, `/bye`, and keeping port 11434 off the internet.
- **Prerequisites:** `check` does not say these commands run over SSH on the old PC. The guide says "From SSH:". The `start` beat does mention "chat from SSH".
- **`pull`:** "About 8 GB free and patience?" does not say whether it means RAM or disk. The guide says "about 8 GB of RAM free".
  - **Optional fix:** "About 8 GB of RAM free and patience?"
- **`install`:** "or download, less it, then bash" compresses the guide's three explicit commands.
- **`disk`:** "Park the share on a USB" assumes the file-share project. The guide links that note.

### 13. photos-backup-pick: Pass with notes
- **Source:** It shares `guides/first-backup`, which exists. That guide covers rsync of the house folder and does not contain the Immich, Prism or folders choice. This project's content comes from Runs, not from the source guide.
- **Choices:** Mostly explicit.
  - "Immich" and "Prism" set those items to interested without saying so.
  - "Not now" sets `photos` to skipped. The question frames this ("Want a dedicated photo backup later?").
- **Terminology:** `skip` says "The house-folder backup run still covers files."
  - **Optional fix:** "The house-folder backup walkthrough still covers files."
- **Gear:** No detection claims. The summary "Sets your stack." refers to the learner's choices.

### 14. prism-intro: Pass with notes (scope accepted)
- **Update (2026-10-04):** the scope decision was made. Prism is PhotoPrism, and the project is now a 16-beat, 4-branch first-install walkthrough following `/guides/prism`. Everything below describes the earlier 5-beat stub and is kept as history.
- **Explicit scope statement:** The imported Prism project is a **short introductory stub**: 5 beats and 1 branch point. Its body is limited to:
  - `start`: what Prism is relative to Immich.
  - `fit`: who it suits.
  - One choice to mark Prism interested, mark it installed (if already run), or skip.
  - Three end beats.

  It contains **no installation steps, no commands, and no configuration**. Its source guide (`https://labthrift.com/guides/prism`) is **missing (404)**, with no HTML or Markdown in the website repo, so there is nothing to compare against. The project says so itself ("This run is a stub — enough to decide"), and `first-backup` / `pick-prism` and `immich-make-it-better` / `pivot-prism` call it "the short stub".
- **C02 decision needed:** Either accept this limited introductory scope, or commission a full walkthrough as a separate content change. That change would need deliberate count and validation updates; the 168 and 30 counts are asserted in tests.
- **Notes:**
  - `start` uses "This run is a stub". **Optional fix:** "This walkthrough is a short intro — enough to decide."
  - `interested` says "Follow the Prism docs for your OS" with no link. Without a source guide, the learner cannot tell which docs are meant.
  - "I already run it — mark installed" also sets `photos` installed, which the label does not mention.
- **Gear:** Status comes only from the learner's choice. There are no detection claims.

### 15. start-with-what-you-have: **Needs edit**
- **Agreement:** It matches the guide: an old laptop or a $0–60 office PC, 8 GB RAM and an ethernet port, the three "what you have" rows, skip racks and 1U servers, "allowed to spend later".
- **Issue (possible confusion with Plan):** Three beats use "plan" for the learning path. In this three-product setup, that reads as the separate Labthrift Plan app:
  - `daily-caution`: "Your plan can still continue — next you'll pick an OS for a future dedicated box, or wait until you find a spare."
  - `marketplace-wipe`: "Already wiped and dedicated? You'll pick an OS next in the plan."
  - `ready`: "Your plan continues with picking an OS — what the computer boots into. Resume from your ByteRush feed when you are ready."
  - **Minimal fixes:**
    - "You can still continue — next you'll pick an OS ..."
    - "You'll pick an OS in the next walkthrough."
    - "Next comes picking an OS — what the computer boots into. ..."
- **Choices (note):** On `stuck-find`, both choices ("I have a box ready" and "Still hunting — what next anyway?") go to `habit`. That works, but the second label suggests a different path.
- **Other notes:**
  - `ram-check` says "If it won't boot far enough: anything that ran Windows 10 with 8 GB is usually fine". This is not in the guide and is loosely worded.
  - The `daily-caution` → `marketplace-wipe` order puts wipe advice right after "Don't erase a machine people still need". The advice is conditional ("If it came from Marketplace"), so this is acceptable.
- **Completion:** Clear. `end` says "You have reached the end of this walkthrough."

### 16. what-os-to-pick: Pass with notes
- **Agreement:** It matches the guide's default table and its Ubuntu, Debian, Desktop, Proxmox and NAS-OS guidance.
- **Choices:** Explicit, with four branch points.
  - **Note:** "I'll try Proxmox anyway" (`proxmox-path`) and "Storage is the whole goal" (`nas-path`) both go to `wrap`. `wrap` then says the next guided project is the first weekend's Ubuntu/Debian-style install, and gives no NAS-OS or Proxmox pointer. The guide refers NAS readers to "a first file box".
- **Gear:** `daily-next` says "mark stack interests", which is a learner action and not detection.
- **Prerequisites:** No commands.

### 17. when-house-disk-full: Pass with notes
- **Agreement:** Commands match the guide: `df -h`, `df -h /srv/share`, `df -i /`, `sudo du -sh /srv/share`, `sudo du -h --max-depth=1 / 2>/dev/null | sort -h`.
- **Prerequisites:** `df` starts with "SSH in". That is good.
- **Notes:**
  - `clear` says "Clear old package downloads and old logs" without commands. The guide links separate notes for these.
  - The guide's case "Live share already on a stay-in USB that filled" and its step 6 retry check (`df -h / /srv/share`) are not represented.
- **Source gap:** No Markdown twin (C01).
- **Choices:** Explicit.
