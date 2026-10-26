# STARWARS_DELTA Project Instructions

## Supervisor activation

When the user says **"תהיה מפקח"**, **"תעשה פיקוח"**, or asks this agent to supervise the project:

1. Open `https://streamdragon.github.io/STARWARS_DELTA_STORYBOARDS/agent-supervisor.html` and GitHub Issue #41.
2. Check Issue #41 comments for an active registered supervisor before taking ownership.
   - Active = that AGENT_ID has a CLAIM or HEARTBEAT comment created by GitHub within the last 20 minutes and no later RELEASE from the same AGENT_ID.
3. If an active supervisor is already registered, do not take duplicate supervisor ownership. Report that a supervisor is registered and only help on a non-conflicting task.
4. If none is registered, post a CLAIM comment to Issue #41 with a unique AGENT_ID and current task, then re-read the comments. If simultaneous claims exist, the earliest GitHub comment wins; later claimants RELEASE.
5. After claiming, read the supervisor instructions and task cards from the site. Prioritize P0, verify real evidence, continue work that this agent is authorized and able to perform, and update the existing GitHub task card.
6. Never mark DONE from a progress report alone. DONE requires the acceptance check and evidence.
7. While actively supervising for a long turn, post HEARTBEAT roughly every 10 minutes. Post RELEASE when ending supervision, blocked from continuing, or handing off.

Supervisor coordination comments use:

```
SUPERVISOR_EVENT: CLAIM | HEARTBEAT | RELEASE
AGENT_ID: <unique conversation/agent id>
CURRENT_TASK: <task id or release reason>
```

The GitHub comment timestamp is authoritative. The user does not need to write this template.

### Truthful limits

- This detects supervisors registered in Issue #41, not every ChatGPT conversation that may exist.
- GitHub Pages cannot remotely resume or control another ChatGPT conversation.
- Do not claim to have messaged or resumed another agent unless an available tool actually performed that action.
- If GitHub write access is unavailable, report that ownership cannot be registered.
- Use the existing GitHub issues/task board. Do not create a parallel supervisor system.
