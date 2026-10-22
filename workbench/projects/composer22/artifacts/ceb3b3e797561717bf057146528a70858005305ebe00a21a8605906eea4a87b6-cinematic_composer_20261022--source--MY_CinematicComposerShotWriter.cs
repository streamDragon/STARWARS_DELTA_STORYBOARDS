using System;
using System.Collections.Generic;
using System.Linq;

namespace STARWARS_DELTA.Cutscenes.Editor
{
    internal static class MY_CinematicComposerShotWriter
    {
        internal static bool TryBuildBeats(MY_CinematicShotPlan plan,
            out List<MY_CinematicBeat> beats, out MY_CinematicComposerDiagnostic[] diagnostics)
        {
            beats=null;
            if(plan==null || plan.Brief==null || plan.Shots.Count!=6) {
                diagnostics=new[]{new MY_CinematicComposerDiagnostic("INVALID_PLAN","Expected the six-shot causal plan.")};
                return false;
            }
            var ids=new[]{"SCALE","WEAPON","FIRE","TRAVEL","IMPACT","AFTERMATH"};
            var issue=new List<MY_CinematicComposerDiagnostic>();
            double next=0;
            foreach(var shot in plan.Shots) {
                if(shot==null || shot.Id!=ids[plan.Shots.IndexOf(shot)] || Math.Abs(shot.Start-next)>0.0001 || shot.Duration<=0)
                    issue.Add(new MY_CinematicComposerDiagnostic("SHOT_ORDER_OR_TIMING","Shot order and contiguous timing required.",shot==null?"":shot.Id));
                if(shot!=null) next+=shot.Duration;
            }
            if(issue.Count>0){diagnostics=issue.ToArray();return false;}
            var result=new List<MY_CinematicBeat>();
            string hero=plan.Brief.AttackerId,target=plan.Brief.TargetId,wing=plan.Brief.EscortId;
            foreach(var shot in plan.Shots){
                var b=new MY_CinematicBeat{Id=shot.Id,Start=shot.Start,Duration=shot.Duration,
                    Camera=shot.Camera,StoryClaim=shot.StoryClaim,DramaticFunction=shot.DramaticFunction};
                switch(shot.Id){
                    case "SCALE":
                        b.Visible.Add(new MY_CinematicVisible(hero,0.23,0.48,0.17));
                        if(!string.IsNullOrWhiteSpace(wing)) b.Visible.Add(new MY_CinematicVisible(wing,0.38,0.62,0.12,"foreground"));
                        b.Visible.Add(new MY_CinematicVisible(target,0.74,0.48,0.46,"background"));
                        b.Actions.Add(Movement(hero,0.1,Math.Max(0.1,b.Duration-0.1),0.16,0.48,0.29,0.49));
                        b.VisualRequirements.Add("target_at_least_2.2x_hero_projected_width");
                        break;
                    case "WEAPON":
                        b.Visible.Add(new MY_CinematicVisible(hero,0.54,0.51,0.66));
                        b.Actions.Add(Movement(hero,0.1,Math.Max(0.1,b.Duration-0.2),0.37,0.52,0.62,0.52));
                        b.VisualRequirements.Add("moving_rotating_muzzle_follow");
                        b.VisualRequirements.Add("actual_child_transform_inspector_binding");
                        break;
                    case "FIRE":
                        b.Visible.Add(new MY_CinematicVisible(hero,0.28,0.54,0.32));
                        if(!string.IsNullOrWhiteSpace(wing)) b.Visible.Add(new MY_CinematicVisible(wing,0.14,0.69,0.15,"foreground"));
                        b.Visible.Add(new MY_CinematicVisible(target,0.82,0.46,0.35,"background"));
                        for(int j=0;j<3;j++) b.Actions.Add(Fire(hero,target,0.45+j*0.41,b.Duration));
                        b.VisualRequirements.Add("visible_muzzle_flash_before_projectile");
                        break;
                    case "TRAVEL":
                        b.Visible.Add(new MY_CinematicVisible(hero,0.24,0.54,0.19,"foreground"));
                        b.Visible.Add(new MY_CinematicVisible(target,0.78,0.46,0.46,"background"));
                        // The projectile identities belong to FIRE; TRAVEL observes those same objects.
                        // Do not create a second volley just because the camera changed shots.
                        b.VisualRequirements.Add("continue_same_three_projectiles_from_previous_fire_shot");
                        b.VisualRequirements.Add("real_source_to_target_projectile_trajectory");
                        break;
                    case "IMPACT":
                        b.Visible.Add(new MY_CinematicVisible(target,0.61,0.49,0.62));
                        b.Actions.Add(new MY_CinematicAction{Type="impact",Subject=target,Target=target,
                            StartOffset=0.7,Duration=0.65,NeedsImpactAnchor=true,ImpactMode="target_anchor"});
                        b.Actions.Add(new MY_CinematicAction{Type="react",Subject=target,
                            StartOffset=1.25,Duration=Math.Max(0.1,b.Duration-1.25)});
                        b.VisualRequirements.Add("target_anchored_impact_flash");
                        b.VisualRequirements.Add("environment_light_reaction");
                        break;
                    case "AFTERMATH":
                        b.Visible.Add(new MY_CinematicVisible(target,0.55,0.49,0.48));
                        b.Actions.Add(new MY_CinematicAction{Type="react",Subject=target,
                            StartOffset=0.15,Duration=Math.Max(0.1,b.Duration-0.15)});
                        b.VisualRequirements.Add("persistent_smoke");
                        b.VisualRequirements.Add("damaged_hull");
                        b.VisualRequirements.Add("lingering_fire");
                        break;
                }
                result.Add(b);
            }
            beats=result;
            diagnostics=new MY_CinematicComposerDiagnostic[0];
            return true;
        }
        private static MY_CinematicAction Movement(string subject,double delay,double duration,double x0,double y0,double x1,double y1) {
            var a=new MY_CinematicAction{Type="move",Subject=subject,StartOffset=delay,
                Duration=duration,MotionIntent="move",Speed="slow"};
            a.PathPoints.Add(new MY_CinematicPoint(x0,y0));
            a.PathPoints.Add(new MY_CinematicPoint(x1,y1));
            return a;
        }
        private static MY_CinematicAction Fire(string source,string target,double delay,double beatDuration) {
            return new MY_CinematicAction{Type="fire",Subject=source,Target=target,StartOffset=delay,
                Duration=Math.Min(1.7,Math.Max(0.1,beatDuration-delay)),ProjectileId="CS_PROJECTILE_BLUE_BOLT",
                ImpactMode="target_anchor",NeedsMuzzle=true,NeedsImpactAnchor=true};
        }
    }
}
