using System;
using System.Collections.Generic;
using System.Linq;

namespace STARWARS_DELTA.Cutscenes.Editor
{
    internal static class MY_CinematicComposerStoryPlanner
    {
        private static readonly string[] Ids={"SCALE","WEAPON","FIRE","TRAVEL","IMPACT","AFTERMATH"};
        private static readonly double[] RelativeSeconds={4,3,4,4,3,4};
        private static readonly string[] Framing={"extreme_wide","detail","medium","wide","close","wide"};
        private static readonly string[] Movement={"hold","follow","track","pan","impact_shake","pull"};
        private static readonly string[] Story={"The escort fleet reveals a much larger hostile structure.",
            "A moving battlecruiser weapon is revealed before firing.",
            "A coordinated volley launches from physically grounded weapon origins.",
            "Projectiles cross frame toward the identified same target.",
            "Projectiles strike that target and trigger a visible impact reaction.",
            "The camera reveals the SAME target with persistent damage, flame and smoke."};
        private static readonly string[] Functions={"setup","anticipation","attack","travel","impact","aftermath"};

        internal static bool TryPlan(MY_CinematicIdeaBrief brief,
            out MY_CinematicShotPlan plan, out MY_CinematicComposerDiagnostic[] diagnostics)
        {
            var issues=new List<MY_CinematicComposerDiagnostic>();
            plan=null;
            if (brief==null) {
                diagnostics=new[]{new MY_CinematicComposerDiagnostic("MISSING_BRIEF","Provide a cinematic idea.")};
                return false;
            }
            if (string.IsNullOrWhiteSpace(brief.Archetype) ||
                !string.Equals(brief.Archetype.Trim(),"FLEET_VOLLEY_22",StringComparison.OrdinalIgnoreCase))
                issues.Add(new MY_CinematicComposerDiagnostic("UNSUPPORTED_INTENT",
                    "MVP supports the FLEET_VOLLEY_22 archetype only; do not infer arbitrary actions from prose."));
            if (double.IsNaN(brief.DurationSeconds) || double.IsInfinity(brief.DurationSeconds) ||
                brief.DurationSeconds<=0 || brief.DurationSeconds>300)
                issues.Add(new MY_CinematicComposerDiagnostic("INVALID_DURATION","Film duration must be >0 and <=300 seconds."));
            if (string.IsNullOrWhiteSpace(brief.AttackerId) || string.IsNullOrWhiteSpace(brief.TargetId))
                issues.Add(new MY_CinematicComposerDiagnostic("MISSING_REQUIRED_ROLE","An attacking ship and a target are required."));
            var names=new[]{brief.AttackerId,brief.TargetId,brief.EscortId}.Where(x=>!string.IsNullOrWhiteSpace(x)).ToArray();
            if (names.Distinct(StringComparer.Ordinal).Count()!=names.Length)
                issues.Add(new MY_CinematicComposerDiagnostic("DUPLICATE_PHYSICAL_ROLE",
                    "Attacker, target and escort must be separate physical identities."));
            if(issues.Count>0){diagnostics=issues.ToArray();return false;}
            plan=new MY_CinematicShotPlan{Brief=brief};
            double start=0;
            for(int i=0;i<Ids.Length;i++){
                double duration=i==Ids.Length-1?brief.DurationSeconds-start:
                    Math.Round(brief.DurationSeconds*(RelativeSeconds[i]/22.0),6,MidpointRounding.AwayFromZero);
                if(duration<=0) {
                    diagnostics=new[]{new MY_CinematicComposerDiagnostic("SHOT_DURATION_INVALID","A planned shot has nonpositive duration.",Ids[i])};
                    plan=null;return false;
                }
                string subject=i<3?brief.AttackerId:brief.TargetId;
                plan.Shots.Add(new MY_CinematicShot {
                    Id=Ids[i],Start=start,Duration=duration,
                    Camera=new MY_CinematicCamera {
                        Framing=Framing[i],Movement=Movement[i],Subject=subject,
                        Direction=i==3?"right":""
                    },
                    StoryClaim=Story[i],
                    DramaticFunction=Functions[i]
                });
                start+=duration;
            }
            diagnostics=new MY_CinematicComposerDiagnostic[0];return true;
        }
    }
}
